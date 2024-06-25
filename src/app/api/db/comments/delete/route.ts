import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { UserPublic } from "@/types/user";

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

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["commentID", "userID", "pageID", "pageType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // 自分自身のアカウントであるか確認.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as UserPublic[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].id !== body["userID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // コメントが存在しなければエラーを返す.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/comments/exist.sql", "utf-8");
    const data = await db.any(sql, [body["commentID"], body["userID"]]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "This comment isn't exist." }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // コメントの削除.
  await db.tx(async (t) => {
    const sql1 = fs.readFileSync(path.resolve("./public") + "/sql/pages/decrement_comment_count.sql", "utf-8");
    await t.any(sql1, [body["pageID"], body["pageType"]]);
    const sql2 = fs.readFileSync(path.resolve("./public") + "/sql/comments/delete.sql", "utf-8");
    await t.any(sql2, [body["commentID"], body["userID"], body["pageType"], body["pageID"]]);
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
