import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import URLTypes from "@/modules/URLTypes";

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

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }
  const pageUserID = req.nextUrl.searchParams.get("pageUserID");
  const pageID = req.nextUrl.searchParams.get("pageID");
  const URLType = req.nextUrl.searchParams.get("URLType");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageUserID === null || pageID === null || URLType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // URLTypeが正しいか確認する.
  if (URLTypes.indexOf(URLType) === -1) {
    return NextResponse.json({ ok: false, error: "Invalid URLType" }, { status: 400 });
  }

  // 自分自身を検索する.
  let userID = "";
  try {
    const existMe = await axios.get(process.env.NEXTAUTH_URL + `/api/db/users/existMe`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existMe.data.exist) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 400 });
    }
    userID = existMe.data.data.ID;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページの存在を検索する.
  try {
    const existPage = await axios.get(process.env.NEXTAUTH_URL + `/api/db/pages/exist?userID=${pageUserID}&pageID=${pageID}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existPage.data.exist) {
      return NextResponse.json({ ok: false, error: "The page doesn't exist" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // いいねを取得する.
  const likes = await db.any('SELECT * FROM "Likes" WHERE "userID" = $1 AND "pageID" = $2 AND "pageUserID" = $3 AND "URLType" = $3', [userID, pageID, pageUserID, URLType]);
  if (likes.length === 0) {
    return NextResponse.json({ ok: true, isLiked: false }, { status: 200 });
  } else {
    return NextResponse.json({ ok: true, isLiked: true }, { status: 200 });
  }
}
