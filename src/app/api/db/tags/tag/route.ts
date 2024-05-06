import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey, questionBlockKey, userBlockKey } from "@/modules/DBBlockKey";

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
  const name = req.nextUrl.searchParams.get("name");
  const page = req.nextUrl.searchParams.get("page");
  if (name === null || page === null || isNaN(Number(page)) || Number(page) < 1) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  const data = await db.any(`SELECT * FROM "Tags" WHERE "name"=$1`, [name]);
  const pages = await db.any(`
  SELECT ${pageBlockKey} FROM "Pages" 
  WHERE "tags" @> ARRAY[$1] AND "isPublic"=true
  ORDER BY "likeCount" DESC 
  LIMIT 30 OFFSET (($2 - 1) * 30);
  `, [name, page]);
  const questions = await db.any(`
  SELECT ${questionBlockKey} FROM "Questions" 
  WHERE "tags" @> ARRAY[$1] AND "isPublic"=true
  ORDER BY "likeCount" DESC
  LIMIT 30 OFFSET (($2 - 1) * 30);
  `, [name, page]);
  const userMap: { [key: string]: UserList } = {};
  if (pages.length !== 0) {
    let users: string[] = [pages.map((e: Page) => e.userID), questions.map((e: Question) => e.userID)].flat(1);
    const usersSet = new Set(users);
    users = Array.from(usersSet);
    const userData = await db.any(`SELECT ${userBlockKey} FROM "Users" WHERE "ID" IN ($1:csv)`, [users]) as UserList[];
    userData.forEach((e) => {
      userMap[e.ID] = e;
    });
  }
  const res = NextResponse.json({ ok: true, exist: true, data: data[0], pages, questions, userMap }, { status: 200 });
  return res;
}
