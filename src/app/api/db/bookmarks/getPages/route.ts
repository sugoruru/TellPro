import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey, userBlockKey } from "@/modules/DBBlockKey";

const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
  // ipの取得.
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
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // 自分自身か確認.
  let userID = "";
  try {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    userID = data[0].ID;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを取得する.
  const pages = await db.any(`SELECT p.${pageBlockKey} FROM "Pages" p INNER JOIN (SELECT "pageID", "pageUserID" FROM "Bookmarks" WHERE "userID" = $1 AND "URLType" = 'pages' ORDER BY time DESC) b ON p."ID" = b."pageID" AND p."userID" = b."pageUserID"`, [userID]);
  const userMap: { [key: string]: UserList } = {};
  if (pages.length !== 0) {
    const users: string[] = pages.map((e: Page) => e.userID);
    const userData = await db.any(`SELECT ${userBlockKey} FROM "Users" WHERE "ID" IN ($1:csv)`, [users]) as UserList[];
    userData.forEach((e) => {
      userMap[e.ID] = e;
    });
  }

  // ブックマークを取得する.
  return NextResponse.json({ ok: true, pages, userMap }, { status: 200 });
}
