import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { Page } from "@/types/page";
import { pageBlockKey, userBlockKey } from "@/modules/DBBlockKey";

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
  const pageType = req.nextUrl.searchParams.get("pageType");
  if (pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // キャッシュの取得.
  const time = new Date().getTime();
  const day = Math.floor(time / 3600000);
  let cacheFilePath = "";
  if (pageType === "articles") {
    cacheFilePath = path.resolve(`/tmp/cache/pageTrend.json`);
  } else if (pageType === "questions") {
    cacheFilePath = path.resolve(`/tmp/cache/questionTrend.json`);
  }
  if (!fs.existsSync('/tmp/cache')) {
    fs.mkdirSync('/tmp/cache');
  }
  if (fs.existsSync(cacheFilePath)) {
    // 毎時間更新.
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/get_trend.sql", "utf-8");
    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFile);
    if (cacheData.time !== day) {
      const data = await db.any(sql, [pageType]);
      const cacheData = { time: day, data: data };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/pages/get_trend.sql", "utf-8");
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
