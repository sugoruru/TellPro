import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

// TODO:関連するコメントの削除
const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  // ipの取得.
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
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["pageID", "pageUserID", "userID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // 自分自身のページであるか確認.
  try {
    const me = await axios.get(process.env.NEXTAUTH_URL + `/api/db/users/existMe`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!me.data.exist) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (me.data.data.ID !== body["userID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページがすでに存在していれば400を返す.
  try {
    const existPage = await axios.get(process.env.NEXTAUTH_URL + `/api/db/pages/exist?userID=${body["pageUserID"]}&pageID=${body["pageID"]}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existPage.data.exist) {
      return NextResponse.json({ ok: false, error: "The page doesn't exist." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページの削除.
  const pageScore = await db.one(`SELECT "pageScore" FROM "Users" WHERE "ID"=$1`, body["pageUserID"]);
  const likeCount = await db.one(`SELECT "likeCount" FROM "Pages" WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]]);
  await db.any(`UPDATE "Users" SET "pageScore"=$1 WHERE "ID"=$2`, [Number(pageScore.pageScore) - likeCount.likeCount, body["pageUserID"]]);
  await db.any(`DELETE FROM "Likes" WHERE "pageID" = $1 AND "pageUserID" = $2`, [body["pageID"], body["pageUserID"]]);
  await db.any(`DELETE FROM "Bookmarks" WHERE "pageID" = $1 AND "pageUserID" = $2`, [body["pageID"], body["pageUserID"]]);
  await db.any(`DELETE FROM "Pages" WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]])
  return NextResponse.json({ ok: true }, { status: 200 });
}
