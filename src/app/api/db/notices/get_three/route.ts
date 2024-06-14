import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

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

  // キャッシュの取得.
  const time = new Date().getTime();
  const day = Math.floor(time / 86400000);
  const cacheFilePath = path.resolve(`/tmp/cache/notices.json`);
  if (!fs.existsSync('/tmp/cache')) {
    fs.mkdirSync('/tmp/cache');
  }
  if (fs.existsSync(cacheFilePath)) {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/notices/get_three.sql", "utf-8");
    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFile);
    if (cacheData.time !== day) {
      const data = await db.any(sql, []);
      const cacheData = { time: day, data: data };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/notices/get_three.sql", "utf-8");
    const data = await db.any(sql, []);
    const cacheData = { time: day, data: data };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
  }
  const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
  const cacheData = JSON.parse(cacheFile);
  const data = cacheData.data;
  const res = NextResponse.json({ ok: true, data: data }, { status: 200 });
  return res;
}
