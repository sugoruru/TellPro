import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { APILimitConstant } from "@/modules/other/APILimitConstant";
import fs from "fs";
import path from "path";
import returnRandomString from "@/modules/algo/returnRandomString";
import { addOneTimePass, deleteOneTimePass } from "@/modules/network/oneTimePass";
import { UserPublic } from "@/types/user";

const allowOrigin = "*";
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
  const required = ["tellproID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400, headers: corsHeaders });
    }
  }
  const { tellproID } = body;
  if (!tellproID.match(/^[a-zA-Z0-9-]+$/)) {
    return NextResponse.json({ ok: false, error: "TellProIDは半角英数字とハイフンのみ使用できます." }, { status: 400, headers: corsHeaders });
  }

  // ユーザーの存在確認.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_id.sql", "utf-8");
    const data = (await db.one(sql, [tellproID])) as UserPublic[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400, headers: corsHeaders });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400, headers: corsHeaders });
  }

  // ワンタイムパスワードの生成.
  deleteOneTimePass();
  const oneTimePassword = returnRandomString(32);
  addOneTimePass(oneTimePassword);

  // ワンタイムパスワードの送信.
  const notificationID = returnRandomString(64);
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/notifications/pomosk_one_time.sql", "utf-8");
  await db.any(sql, [notificationID, tellproID, oneTimePassword]);

  return NextResponse.json({ ok: true }, {
    status: 200, headers: corsHeaders
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
