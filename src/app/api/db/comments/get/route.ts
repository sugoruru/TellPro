import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
  const URLType = req.nextUrl.searchParams.get("URLType");
  const myID = req.nextUrl.searchParams.get("myID");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageUserID === null || pageID === null || URLType === null || myID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  const data = await db.any(`SELECT * FROM "Comments" WHERE "pageID" = $1 AND "pageUserID" = $2 AND "URLType" = $3 ORDER BY time DESC`, [pageID, pageUserID, URLType]);
  if (data.length == 0) {
    const res = NextResponse.json({ ok: true, exist: false, data: [], userMap: {} }, { status: 200 });
    return res;
  } else {
    const userMap: { [key: string]: UserList } = {};
    const users = data.map((e: Comment) => e.userID);
    const userData = await db.any(`SELECT * FROM "Users" WHERE "ID" IN ($1:csv)`, [users]) as UserList[];
    userData.forEach((e) => {
      userMap[e.ID] = e;
    });
    if (myID !== "null") {
      // likeCommentを作成する→いいねしているかどうかを判定するため.
      const likeUserMap: { [key: string]: boolean } = {}
      const likeComments = await db.any(`
      SELECT l.*
      FROM "Likes" l
      INNER JOIN "Comments" c ON l."pageID" = c."ID"
      WHERE l."userID" = $1 
      AND l."URLType" = 'comments'
      AND c."pageID" = $2`, [myID, pageID]);
      likeComments.forEach((e: Like) => {
        likeUserMap[e.pageID] = true;
      });
      const res = NextResponse.json({ ok: true, exist: true, data: data, userMap, likeComments: likeUserMap }, { status: 200 });
      return res;
    } else {
      const res = NextResponse.json({ ok: true, exist: true, data: data, userMap, likeComments: {} }, { status: 200 });
      return res;
    }
  }
}
