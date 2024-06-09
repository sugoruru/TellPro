import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import pageTypes from "@/modules/pageTypes";
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
  const required = ["myID", "pageUserID", "pageID", "pageType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // pageTypeが不正な値であれば400を返す.
  if (pageTypes.indexOf(body["pageType"]) === -1) {
    return NextResponse.json({ ok: false, error: "Invalid pageType" }, { status: 400 });
  }

  // 自分自身か確認.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as UserPublic[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].id !== body["myID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request1" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request2" }, { status: 400 });
  }

  // ページの存在を確認.
  try {
    if (body["pageType"] === "articles" || body["pageType"] === "questions") {
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
    return NextResponse.json({ ok: false, error: "Invalid request3" }, { status: 400 });
  }

  // ページがすでにいいねしていなければ400を返す.
  try {
    if (body["pageType"] === "articles" || body["pageType"] === "questions") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/likes/exist.sql", "utf-8");
      const likes = await db.any(sql, [body["myID"], body["pageID"], body["pageType"]]);
      if (likes.length === 0) {
        return NextResponse.json({ ok: false, error: "The page isn't liked" }, { status: 400 });
      }
    } else if (body["pageType"] === "comments") {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/comment_likes/exist.sql", "utf-8");
      const likes = await db.any(sql, [body["myID"], body["pageID"]]);
      if (likes.length === 0) {
        return NextResponse.json({ ok: false, error: "The page isn't liked" }, { status: 400 });
      }
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request4" }, { status: 400 });
  }

  // ページを削除.
  await db.tx(async (t) => {
    if (body["pageType"] === "articles" || body["pageType"] === "questions") {
      const del = fs.readFileSync(path.resolve("./public") + "/sql/likes/delete.sql", "utf-8");
      await t.any(del, [body["pageID"], body["pageType"], body["myID"]]);
      const updateUsers = fs.readFileSync(path.resolve("./public") + "/sql/users/decrement_page_score.sql", "utf-8");
      await t.any(updateUsers, [body["pageUserID"]]);
      const updatePages = fs.readFileSync(path.resolve("./public") + "/sql/pages/decrement_like_count.sql", "utf-8");
      await t.any(updatePages, [body["pageID"], body["pageType"], body["pageUserID"]]);
    } else if (body["pageType"] === "comments") {
      const del = fs.readFileSync(path.resolve("./public") + "/sql/comment_likes/delete.sql", "utf-8");
      await t.any(del, [body["pageID"], body["myID"]]);
      const updateComments = fs.readFileSync(path.resolve("./public") + "/sql/comments/decrement_like_count.sql", "utf-8");
      await t.any(updateComments, [body["pageID"], body["pageUserID"]]);
    }
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
