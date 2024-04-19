import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
  const required = ["myID", "pageUserID", "pageID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
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

  // ページがすでにいいねしていれば400を返す.
  try {
    const existLike = await axios.get(process.env.NEXTAUTH_URL + `/api/db/likes/getLiked?userID=${body["pageUserID"]}&pageID=${body["pageID"]}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (existLike.data.isLiked) {
      return NextResponse.json({ ok: false, error: "The page already liked" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
  const url = `${body["pageUserID"]}/pages/${body["pageID"]}`;

  // ページを作成.
  const pageScore = await db.one(`SELECT "pageScore" FROM "Users" WHERE "ID"=$1`, body["pageUserID"]);
  await db.any(`INSERT INTO "Likes" ("userID", "URL", "time") VALUES ($1, $2, $3);`, [body["myID"], url, new Date().getTime()]);
  await db.any(`UPDATE "Users" SET "pageScore"=$1 WHERE "ID"=$2`, [Number(pageScore.pageScore) + 1, body["pageUserID"]]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
