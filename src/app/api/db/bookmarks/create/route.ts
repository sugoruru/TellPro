import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import returnRandomString from "@/modules/algo/returnRandomString";
import URLTypes from "@/modules/URLTypes";

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
    NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["myID", "pageUserID", "pageID", "URLType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (URLTypes.indexOf(body["URLType"]) === -1) {
    return NextResponse.json({ ok: false, error: "Invalid URLType" }, { status: 400 });
  }

  // 自分自身か確認.
  try {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].ID !== body["myID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページの存在を確認.
  try {
    const page = await db.any(`SELECT * FROM "Pages" WHERE "ID" = $1 AND "userID" = $2`, [body["pageID"], body["pageUserID"]]);
    if (page.length === 0) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページがすでにブックマークしていれば400を返す.
  try {
    const data = await db.any(`SELECT * FROM "Bookmarks" WHERE "pageUserID" = $1 AND "pageID" = $2 AND "URLType" = $3 AND "userID" = $4`, [body["pageUserID"], body["pageID"], body["URLType"], body["myID"]]);
    if (data.length > 0) {
      return NextResponse.json({ ok: false, error: "The page already bookmark" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを作成.
  await db.any(`INSERT INTO "Bookmarks" ("ID", "userID", "pageID", "time", "URLType", "pageUserID") VALUES ($1, $2, $3, $4, $5, $6);`, [returnRandomString(64), body["myID"], body["pageID"], new Date().getTime(), body["URLType"], body["pageUserID"]]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
