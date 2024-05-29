import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey, userBlockKey } from "@/modules/DBBlockKey";
import { Page } from "@/types/page";
import fs from "fs";

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
  const pageType = req.nextUrl.searchParams.get("pageType");

  // リクエストボディに必要なキーが存在しなければ400を返す.
  if (pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }


  // 自分自身か確認.
  let userID = "";
  try {
    const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    userID = data[0].id;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを取得する.
  const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/bookmarks/get_pages.sql", "utf-8");
  const pages = await db.any(sql, [userID, pageType]);
  let userData: UserPublic[] = [];
  if (pages.length !== 0) {
    const users: string[] = pages.map((e: Page) => e.user_id);
    userData = await db.any(`select ${userBlockKey} from users where id in ($1:csv)`, [users]) as UserPublic[];
  }

  // ブックマークを取得する.
  return NextResponse.json({ ok: true, pages, userData }, { status: 200 });
}
