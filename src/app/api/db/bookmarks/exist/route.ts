import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
  const URLType = req.nextUrl.searchParams.get("URLType");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageUserID === null || pageID === null || URLType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // TODO:(DEV) questionsにも対応する.
  // ページの存在を検索する.
  try {
    if (URLType === "pages") {
      const page = await db.any(`SELECT * FROM "Pages" WHERE "ID" = $1 AND "userID" = $2`, [pageID, pageUserID]);
      if (page.length === 0) {
        return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
      }
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // 自分自身を検索する.
  let userID = "";
  try {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 400 });
    }
    userID = data[0].ID;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを取得する.
  const bookmarks = await db.any('SELECT * FROM "Bookmarks" WHERE "userID" = $1 AND "pageID" = $2 AND "pageUserID" = $3 AND "URLType" = $4', [userID, pageID, pageUserID, URLType]);
  if (bookmarks.length === 0) {
    return NextResponse.json({ ok: true, isBookmark: false }, { status: 200 });
  } else {
    return NextResponse.json({ ok: true, isBookmark: true }, { status: 200 });
  }
}
