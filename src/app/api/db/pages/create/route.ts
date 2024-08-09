import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import pageTypes from "@/modules/other/pageTypes";
import path from "path";
import { UserPublic } from "@/types/user";

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
  const required = ["ID", "userID", "title", "content", "tags", "isPublic", "pageType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (!pageTypes.includes(body.pageType)) {
    return NextResponse.json({ ok: false, error: "Invalid pageType" }, { status: 400 });
  }
  if (!/^[a-zA-Z]+$/.test(body["ID"])) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // 自分自身のページであるか確認.
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

  // ページがすでに存在していれば400を返す.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/exist.sql", "utf-8");
    const data = await db.any(sql, [body["ID"], body["userID"], body["pageType"]]);
    if (data.length > 0) {
      return NextResponse.json({ ok: false, error: "Page already exists" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページを作成.
  await db.tx(async (t) => {
    const tagsToUpdate = `{${body.tags.join(',')}}`;
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/create.sql", "utf-8");
    await t.any(sql, [body.ID, body.userID, body.title, body.content, tagsToUpdate, body.isPublic, body.pageType]);
    if (body.pageType === "articles") {
      const achievement = fs.readFileSync(path.resolve("./public") + "/sql/achievement/articles.sql", "utf-8");
      await t.any(achievement, [body.userID]);
    } else if (body.pageType === "questions") {
      const achievement = fs.readFileSync(path.resolve("./public") + "/sql/achievement/questions.sql", "utf-8");
      await t.any(achievement, [body.userID]);
    } else if (body.pageType === "problems") {
      const achievement = fs.readFileSync(path.resolve("./public") + "/sql/achievement/problems.sql", "utf-8");
      await t.any(achievement, [body.userID]);
    }
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
