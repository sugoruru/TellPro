import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
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

  // URLTypeが不正な値であれば400を返す.
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
  if (body["URLType"] === "page") {
    try {
      const page = await db.any(`SELECT * FROM "Pages" WHERE "ID" = $1 AND "userID" = $2`, [body["pageID"], body["pageUserID"]]);
      if (page.length === 0) {
        return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } else if (body["URLType"] === "comment") {
    try {
      const comment = await db.any(`SELECT * FROM "Comments" WHERE "ID" = $1 AND "userID" = $2`, [body["pageID"], body["pageUserID"]]);
      if (comment.length === 0) {
        return NextResponse.json({ ok: false, error: "Comment not found" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  }

  // ページがすでにいいねしていなければ400を返す.
  try {
    const likes = await db.any('SELECT * FROM "Likes" WHERE "userID" = $1 AND "pageID" = $2 AND "pageUserID" = $3 AND "URLType" = $4', [body["myID"], body["pageID"], body["pageUserID"], body["URLType"]]);
    if (likes.length === 0) {
      return NextResponse.json({ ok: false, error: "The page isn't liked" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページを削除.
  await db.tx(async (t) => {
    await t.any(`DELETE FROM "Likes" WHERE "userID" = $1 AND "pageID" = $2 AND "pageUserID" = $3 AND "URLType" = $4`, [body["myID"], body["pageID"], body["pageUserID"], body["URLType"]]);
    if (body["URLType"] === "pages") {
      await t.any(`UPDATE "Users" SET "pageScore"="pageScore"-1 WHERE "ID"=$1`, [body["pageUserID"]]);
      await t.any(`UPDATE "Pages" SET "likeCount"="likeCount"-1 WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]]);
    } else if (body["URLType"] === "comments") {
      await t.any(`UPDATE "Comments" SET "likeCount"="likeCount"-1 WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]]);
    }
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
