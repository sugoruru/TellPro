import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey, userBlockKey } from "@/modules/other/DBBlockKey";
import { Page } from "@/types/page";
import { UserPublic } from "@/types/user";
import { APILimitConstant } from "@/modules/other/APILimitConstant";

const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("X-Forwarded-For");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "not found your IP" }, { status: 400 });
  }

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
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
  const name = req.nextUrl.searchParams.get("name");
  const page = req.nextUrl.searchParams.get("page");
  if (name === null || page === null || isNaN(Number(page)) || Number(page) < 1) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  let data, pages, questions, problems, userMap: { [key: string]: UserPublic } = {};
  await db.tx(async (t) => {
    data = await t.any(`SELECT * FROM tags WHERE name=$1`, [name]);
    pages = await t.any(`
  SELECT ${pageBlockKey} FROM pages 
  WHERE tags @> ARRAY[$1] AND is_public=true and page_type='articles'
  ORDER BY like_count DESC 
  LIMIT 30 OFFSET (($2 - 1) * 30);
  `, [name, page]);
    questions = await t.any(`
SELECT ${pageBlockKey} FROM pages 
WHERE tags @> ARRAY[$1] AND is_public=true AND page_type='questions'
ORDER BY like_count DESC
LIMIT 30 OFFSET (($2 - 1) * 30);
`, [name, page]);
    problems = await t.any(`
SELECT ${pageBlockKey} FROM pages 
WHERE tags @> ARRAY[$1] AND is_public=true AND page_type='problems'
ORDER BY like_count DESC
LIMIT 30 OFFSET (($2 - 1) * 30);
`, [name, page]);
    if (pages.length !== 0 || questions.length !== 0 || problems.length !== 0) {
      let users: string[] = [];
      for (let i = 0; i < pages.length; i++) {
        users.push(pages[i].user_id);
      }
      for (let i = 0; i < questions.length; i++) {
        users.push(questions[i].user_id);
      }
      for (let i = 0; i < problems.length; i++) {
        users.push(problems[i].user_id);
      }
      const usersSet = new Set(users);
      users = Array.from(usersSet);
      const userData = await t.any(`SELECT ${userBlockKey} FROM users WHERE id IN ($1:csv)`, [users]) as UserPublic[];
      userData.forEach((e) => {
        userMap[e.id] = e;
      });
    }
  });
  if (data === undefined || pages === undefined || questions === undefined || problems === undefined) {
    const res = NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    return res;
  }
  const res = NextResponse.json({ ok: true, exist: true, data: data[0], pages, questions, problems, userMap }, { status: 200 });
  return res;
}
