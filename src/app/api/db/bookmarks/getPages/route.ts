import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey, userBlockKey } from "@/modules/DBBlockKey";

// TODO:ページを30件ずつ取得できるようにページIDを受け取るようにする.
const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
  // ipの取得.
  const headersList = headers();
  const ip = headersList.get(process.env.NODE_ENV === "development" ? "X-Forwarded-For" : "X-Nf-Client-Connection-Ip");
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

  // ブックマークを取得する.
  const pages = await db.any(`SELECT p.${pageBlockKey} FROM "Pages" p INNER JOIN (SELECT "pageID", "pageUserID" FROM "Bookmarks" WHERE "userID" = $1 AND "URLType" = 'pages' ORDER BY time DESC LIMIT 30) b ON p."ID" = b."pageID" AND p."userID" = b."pageUserID"`, [userID]);
  const userMap: { [key: string]: User } = {};
  if (pages.length !== 0) {
    const users: string[] = pages.map((e: Page) => e.userID);
    const userData = await db.any(`SELECT ${userBlockKey} FROM "Users" WHERE "ID" IN ($1:csv)`, [users]) as User[];
    userData.forEach((e) => {
      userMap[e.ID] = e;
    });
  }

  // ブックマークを取得する.
  return NextResponse.json({ ok: true, pages, userMap }, { status: 200 });
}
