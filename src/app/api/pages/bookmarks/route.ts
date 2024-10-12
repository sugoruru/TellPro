import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { userBlockKey } from "@/modules/other/DBBlockKey";
import { Page } from "@/types/DBTypes";
import fs from "fs";
import path from "path";
import { User } from "@/types/DBTypes";
import OPTIONS from "../../auth/[...nextauth]/options";
import { APILimitConstant } from "@/modules/other/APILimitConstant";

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
    await limitChecker.check(APILimitConstant, ip);
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

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // 自分自身か確認.
  let userID = "";
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    userID = data[0].id;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ブックマークを取得する.
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/getBookmarks.sql", "utf-8");
  const pages = (await db.any(sql, [userID]))[0].result;
  let userData: User[] = [];
  const users: string[] = [];
  if (pages.articles !== null) {
    pages.articles.forEach((e: Page) => users.push(e.user_id));
  }
  if (pages.questions !== null) {
    pages.questions.forEach((e: Page) => users.push(e.user_id));
  }
  if (pages.problems !== null) {
    pages.problems.forEach((e: Page) => users.push(e.user_id));
  }
  if (users.length !== 0) {
    userData = await db.any(`select ${userBlockKey} from users where id in ($1:csv)`, [users]) as User[];
  }

  // 結果送信.
  return NextResponse.json({ ok: true, pages, userData }, { status: 200 });
}
