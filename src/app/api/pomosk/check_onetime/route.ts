import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/pomoskDB";
import mainDB from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { APILimitConstant } from "@/modules/other/APILimitConstant";
import fs from "fs";
import path from "path";
import returnRandomString from "@/modules/algo/returnRandomString";

const allowOrigin = process.env.IS_DEV === "true" ? "https://localhost:3001" : "https://pomosk.tellpro.net";
const corsHeaders = {
  'Access-Control-Allow-Origin': allowOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  req.headers.set("Access-Control-Allow-Origin", allowOrigin);
  req.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  req.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("X-Forwarded-For");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "not found your IP" }, { status: 400, headers: corsHeaders });
  }

  // 毎分100requestの制限.
  try {
    await limitChecker.check(APILimitConstant, ip);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429, headers: corsHeaders });
  }

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401, headers: corsHeaders });
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["passKey", "currentTellproID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400, headers: corsHeaders });
    }
  }
  const { passKey, currentTellproID } = body as { passKey: string, currentTellproID: string };
  if (passKey.length !== 32) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 200, headers: corsHeaders });
  }

  // oneTimePassの確認.
  let isExist = false;
  {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/check_one_time.sql", "utf-8");
    const data = await db.any(sql, [passKey]);
    if (data.length > 0) {
      isExist = true;
    }
    // 古いoneTimePassの削除.
    const sql2 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/delete_old_one_time.sql", "utf-8");
    await db.none(sql2, [passKey]);
  }
  if (isExist) {
    let mail = "";
    try {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_id.sql", "utf-8");
      const data = (await mainDB.one(sql, [currentTellproID]));
      if (!data) {
        return NextResponse.json({ ok: false, error: "User not found" }, { status: 400, headers: corsHeaders });
      }
      mail = data.mail;
    } catch (error) {
      return NextResponse.json({ ok: false, error: "Invalid request2" }, { status: 400, headers: corsHeaders });
    }
    // ログインキーの作成.
    const loginKey = returnRandomString(32);
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/create_login_key.sql", "utf-8");
    const name = `匿名${Math.floor(Math.random() * 10000)}`;
    await db.none(sql, [loginKey, mail, name]);
    return NextResponse.json({ ok: true, loginKey }, {
      status: 200, headers: corsHeaders
    });
  } else {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 200, headers: corsHeaders });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
