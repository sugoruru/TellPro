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
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["ID", "myID", "pageUserID", "pageID", "URLType", "content"];
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

  // ページが存在するか確認.
  try {
    const page = await axios.get(process.env.NEXTAUTH_URL + `/api/db/pages/exist?userID=${body["pageUserID"]}&pageID=${body["pageID"]}`);
    if (!page.data.ok) {
      return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Page not found" }, { status: 400 });
  }

  // コメントを作成.
  await db.tx(async (t) => {
    await t.none(`INSERT INTO "Comments" ("ID", "userID", "pageID", "time", "URLType", "pageUserID", "content", "likeCount") VALUES ($1, $2, $3, $4, $5, $6, $7, 0);`, [body["ID"], body["myID"], body["pageID"], new Date().getTime(), body["URLType"], body["pageUserID"], body["content"]]);
    await t.none(`UPDATE "Pages" SET "commentCount"="commentCount"+1 WHERE "ID"=$1 AND "userID"=$2`, [body["pageID"], body["pageUserID"]]);
  });
  return NextResponse.json({ ok: true }, { status: 200 });
}
