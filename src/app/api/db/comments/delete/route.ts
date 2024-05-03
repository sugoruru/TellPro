import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["commentID", "userID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // 自分自身のアカウントであるか確認.
  try {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].ID !== body["userID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // コメントが存在しなければエラーを返す.
  try {
    const data = await db.any(`SELECT * FROM "Comments" WHERE "ID" = $1 AND "userID" = $2`, [body["commentID"], body["userID"]]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "This comment isn't exist." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページの削除.
  await db.any(`UPDATE "Pages" SET "commentCount" = "commentCount" - 1 WHERE "ID" = (SELECT "pageID" FROM "Comments" WHERE "ID"=$1 AND "userID"=$2)`, [body["commentID"], body["userID"]]);
  await db.any(`DELETE FROM "Likes" WHERE "pageID" = $1 AND "pageUserID" = $2`, [body["commentID"], body["userID"]]);
  await db.any(`DELETE FROM "Comments" WHERE "ID"=$1 AND "userID"=$2`, [body["commentID"], body["userID"]]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
