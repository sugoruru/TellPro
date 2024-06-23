import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import OPTIONS from "../../auth/[...nextauth]/options";
import { Page } from "@/types/page";

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

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }

  // クエリパラメータの取得.
  const userID = req.nextUrl.searchParams.get("userID");
  const pageType = req.nextUrl.searchParams.get("pageType");
  const pageID = req.nextUrl.searchParams.get("pageID");
  if (userID === null || pageType === null || pageID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  const session = await getServerSession(OPTIONS);
  const result: {
    isExist: boolean,
    me: UserPublic | null,
    page: Page | null,
    pageUser: UserPublic | null,
    comments: Comment[],
    commentsUser: UserPublic[],
    commentsLike: string[],
    isLiked: boolean,
    isBookmarked: boolean,
  } = {
    isExist: false,
    me: null,
    page: null,
    pageUser: null,
    comments: [],
    commentsUser: [],
    commentsLike: [],
    isLiked: false,
    isBookmarked: false,
  };
  const userEmail = session?.user?.email || "";
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/articles.sql", "utf-8");
  const _res = await db.one(sql, [userEmail, userID, pageID, pageType]);
  let me = _res.res.me;
  let pageUser = _res.res.pageUser;
  let page = _res.res.page;
  let isLiked = _res.res.isLiked;
  let isBookmarked = _res.res.isBookmarked;
  let comments = _res.res.comments;
  let commentsUser = _res.res.commentsUser;
  let commentsLike = _res.res.commentsLike;
  if (me) {
    if (me.length > 0) {
      me = me[0];
      delete me.mail;
      result.me = me;
    }
  }
  if (pageUser) {
    if (pageUser.length > 0) {
      pageUser = pageUser[0];
      delete pageUser.mail;
      result.pageUser = pageUser;
    }
  }
  if (page) {
    if (page.length > 0) {
      page = page[0];
      result.page = page;
      result.isExist = true;
    }
  }
  if (isLiked) {
    if (isLiked.length > 0) {
      result.isLiked = true;
    }
  }
  if (isBookmarked) {
    if (isBookmarked.length > 0) {
      result.isBookmarked = true;
    }
  }
  if (comments) {
    if (comments.length > 0) {
      result.comments = comments;
    }
  }
  if (commentsUser) {
    if (commentsUser.length > 0) {
      result.commentsUser = commentsUser;
    }
  }
  if (commentsLike) {
    if (commentsLike.length > 0) {
      result.commentsLike = commentsLike;
    }
  }
  const res = NextResponse.json({ ok: true, data: result }, { status: 200 });
  return res;
}
