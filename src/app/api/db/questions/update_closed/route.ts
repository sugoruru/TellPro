import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { APILimitConstant } from "@/modules/other/APILimitConstant";

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("X-Forwarded-For");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "not found your IP" }, { status: 400 });
  }

  // 毎分100requestの制限.
  try {
    await limitChecker.check(APILimitConstant, ip);
  } catch (error) {
    const res = NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return res;
  }

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["userID", "pageID", "isClosed"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (!/^[a-zA-Z]+$/.test(body["pageID"])) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // ページが存在しない場合は400を返す.
  try {
    const data = await db.any(`SELECT * FROM pages WHERE id = $1 AND user_id = $2 AND page_type = $3`, [body["pageID"], body["userID"], "questions"]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "There isn't page." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページをアップデート.
  try {
    await db.tx(async (t) => {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/questions/update_closed.sql", "utf-8");
      await t.any(sql, [body["pageID"], body["userID"], body["isClosed"]]);
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
