import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import URLTypes from "@/modules/URLTypes";

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  // ipの取得
  const headersList = headers();
  const ip = headersList.get(process.env.NODE_ENV === "development" ? "X-Forwarded-For" : "X-Nf-Client-Connection-Ip");
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
  const required = ["myID", "pageUserID", "pageID", "URLType"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (URLTypes.indexOf(body["URLType"]) === -1) {
    return NextResponse.json({ ok: false, error: "Invalid URLType" }, { status: 400 });
  }

  // 自分自身か確認.
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
    if (me.data.data.ID !== body["myID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページがすでにいいねしていなければ400を返す.
  try {
    const existLike = await axios.get(process.env.NEXTAUTH_URL + `/api/db/likes/exist?pageUserID=${body["pageUserID"]}&pageID=${body["pageID"]}&URLType=${body["URLType"]}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existLike.data.isLiked) {
      return NextResponse.json({ ok: false, error: "The page isn't liked" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページを削除.
  await db.any(`DELETE FROM "Likes" WHERE "userID" = $1 AND "pageID" = $2 AND "pageUserID" = $3 AND "URLType" = $4`, [body["myID"], body["pageID"], body["pageUserID"], body["URLType"]]);
  await db.any(`UPDATE "Users" SET "pageScore"="pageScore"-1 WHERE "ID"=$1`, [body["pageUserID"]]);
  await db.any(`UPDATE "Pages" SET "likeCount"="likeCount"-1 WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
