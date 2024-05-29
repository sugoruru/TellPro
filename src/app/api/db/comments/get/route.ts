import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import { Comment } from "@/types/comment";
import { userBlockKey } from "@/modules/DBBlockKey";

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
  const pageUserID = req.nextUrl.searchParams.get("pageUserID");
  const pageID = req.nextUrl.searchParams.get("pageID");
  const pageType = req.nextUrl.searchParams.get("pageType");
  const myID = req.nextUrl.searchParams.get("myID");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageUserID === null || pageID === null || pageType === null || myID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/comments/get.sql", "utf-8");
  const data = await db.any(sql, [pageID, pageType]) as Comment[];
  if (data.length == 0) {
    const res = NextResponse.json({ ok: true, exist: false, data: [], userData: [], likeComments: [] }, { status: 200 });
    return res;
  } else {
    // userMap・likeCommentsの作成.
    let userData: UserPublic[] = [];
    const users: string[] = data.map((e: Comment) => e.user_id);
    userData = await db.any(`select ${userBlockKey} from users where id in ($1:csv)`, [users]) as UserPublic[];
    let likeComments: string[] = [];
    const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/comment_likes/get_like_comments.sql", "utf-8");
    likeComments = await db.any(sql, [myID, pageID, pageType]) as string[];
    const res = NextResponse.json({ ok: true, exist: true, data, userData, likeComments }, { status: 200 });
    return res;
  }
}
