import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import returnRandomString from "@/modules/algo/returnRandomString";
import pageTypes from "@/modules/other/pageTypes";
import fs from "fs";
import path from "path";
import { User } from "@/types/DBTypes";
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
  const required = ["myID", "pageUserID", "pageID", "pageType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // pageTypeが正しいか確認.
  if (pageTypes.indexOf(body["pageType"]) === -1) {
    return NextResponse.json({ ok: false, error: "Invalid pageType" }, { status: 400 });
  }

  // 自分自身か確認.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].id !== body["myID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページの存在を確認.
  try {
    if (body["pageType"] === "articles" || body["pageType"] === "questions" || body["pageType"] === "problems") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/exist.sql", "utf-8");
      const page = await db.any(sql, [body["pageID"], body["pageUserID"], body["pageType"]]);
      if (page.length === 0) {
        return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
      }
    } else if (body["pageType"] === "comments") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/comments/exist.sql", "utf-8");
      const page = await db.any(sql, [body["pageID"], body["pageUserID"]]);
      if (page.length === 0) {
        return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
      }
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページがすでにいいねしていれば400を返す.
  try {
    if (body["pageType"] === "articles" || body["pageType"] === "questions" || body["pageType"] === "problems") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/likes/exist.sql", "utf-8");
      const likes = await db.any(sql, [body["myID"], body["pageID"], body["pageType"]]);
      if (likes.length > 0) {
        return NextResponse.json({ ok: false, error: "The page already liked" }, { status: 400 });
      }
    } else if (body["pageType"] === "comments") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/comment_likes/exist.sql", "utf-8");
      const likes = await db.any(sql, [body["myID"], body["pageID"]]);
      if (likes.length > 0) {
        return NextResponse.json({ ok: false, error: "The page already liked" }, { status: 400 });
      }
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // いいねを作成.
  await db.tx(async (t) => {
    if (body["pageType"] === "articles" || body["pageType"] === "questions" || body["pageType"] === "problems") {
      // ページの場合.
      const create = fs.readFileSync(path.resolve("./public") + "/sql/likes/create.sql", "utf-8");
      await t.any(create, [returnRandomString(64), body["myID"], body["pageType"], body["pageID"]]);
      const updateUsers = fs.readFileSync(path.resolve("./public") + "/sql/users/increment_page_score.sql", "utf-8");
      await t.any(updateUsers, [body["pageUserID"]]);
      const updatePages = fs.readFileSync(path.resolve("./public") + "/sql/pages/increment_like_count.sql", "utf-8");
      await t.any(updatePages, [body["pageID"], body["pageType"], body["pageUserID"]]);
    } else if (body["pageType"] === "comments") {
      // コメントの場合.
      const create = fs.readFileSync(path.resolve("./public") + "/sql/comment_likes/create.sql", "utf-8");
      await t.any(create, [returnRandomString(64), body["myID"], body["pageID"]]);
      const updateComments = fs.readFileSync(path.resolve("./public") + "/sql/comments/increment_like_count.sql", "utf-8");
      await t.any(updateComments, [body["pageID"], body["pageUserID"]]);
    }
    const achievement = fs.readFileSync(path.resolve("./public") + "/sql/achievement/likes.sql", "utf-8");
    await t.any(achievement, [body["myID"]]);
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
