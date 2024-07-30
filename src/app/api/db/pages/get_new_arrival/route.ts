import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { Page } from "@/types/page";
import { userBlockKey } from "@/modules/other/DBBlockKey";
import { UserPublic } from "@/types/user";

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

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }
  const pageType = req.nextUrl.searchParams.get("pageType");
  if (pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // キャッシュの取得.
  const time = new Date().getTime();
  const day = Math.floor(time / 60000);
  let cacheFilePath = "";
  if (pageType === "articles") {
    cacheFilePath = path.resolve(`/tmp/cache/pageNewArrival.json`);
  } else if (pageType === "questions") {
    cacheFilePath = path.resolve(`/tmp/cache/questionNewArrival.json`);
  } else if (pageType === "problems") {
    cacheFilePath = path.resolve(`/tmp/cache/problemsNewArrival.json`);
  }
  if (!fs.existsSync('/tmp/cache')) {
    fs.mkdirSync('/tmp/cache');
  }
  if (fs.existsSync(cacheFilePath)) {
    // 毎分更新.
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/get_new_arrival.sql", "utf-8");
    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFile);
    if (cacheData.time !== day) {
      const data = await db.any(sql, [pageType]);
      const cacheData = { time: day, data: data };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/get_new_arrival.sql", "utf-8");
    const data = await db.any(sql, [pageType]);
    const cacheData = { time: day, data: data };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
  }
  const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
  const cacheData = JSON.parse(cacheFile);
  const data = cacheData.data;
  let userData: UserPublic[] = [];
  if (data.length !== 0) {
    // userMap・likeCommentsの作成.
    const users: string[] = data.map((e: Page) => e.user_id);
    userData = await db.any(`select ${userBlockKey} from users where id in ($1:csv)`, [users]) as UserPublic[];
  }
  const res = NextResponse.json({ ok: true, data: data, userData }, { status: 200 });
  return res;
}
