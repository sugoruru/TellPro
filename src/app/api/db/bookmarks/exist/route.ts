import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";

const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
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
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }
  const pageUserID = req.nextUrl.searchParams.get("pageUserID");
  const pageID = req.nextUrl.searchParams.get("pageID");
  const pageType = req.nextUrl.searchParams.get("pageType");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageUserID === null || pageID === null || pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // ページの存在を検索する.
  try {
    const sql = fs.readFileSync("src/sql/pages/exist.sql", "utf-8");
    const data = await db.any(sql, [pageID, pageUserID, pageType]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // 自分自身を検索する.
  let userID = "";
  try {
    const sql = fs.readFileSync("src/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 400 });
    }
    userID = data[0].id;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを取得する.
  const bookmarks = await db.any('SELECT * FROM bookmarks WHERE user_id = $1 AND page_id = $2 AND page_type = $3', [userID, pageID, pageType]);
  if (bookmarks.length === 0) {
    return NextResponse.json({ ok: true, isBookmark: false }, { status: 200 });
  } else {
    return NextResponse.json({ ok: true, isBookmark: true }, { status: 200 });
  }
}
