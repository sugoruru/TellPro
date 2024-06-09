import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

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
    await limitChecker.check(100, ip);
  } catch (error) {
    const res = NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return res;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["ID", "userID", "title", "content", "tags", "isPublic", "pageType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (!/^[a-zA-Z]+$/.test(body["ID"])) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // ページが存在しない場合は400を返す.
  try {
    const data = await db.any(`SELECT * FROM pages WHERE id = $1 AND user_id = $2 AND page_type = $3`, [body["ID"], body["userID"], body["pageType"]]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "There isn't page." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページをアップデート.
  try {
    await db.tx(async (t) => {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/update.sql", "utf-8");
      await t.any(sql, [body.title, body.content, body.tags, body.isPublic, body.ID, body.userID, body.pageType]);
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
