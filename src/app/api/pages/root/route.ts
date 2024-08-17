import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { Page } from "@/types/page";
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

  // キャッシュの取得
  const time = new Date().getTime();
  const day = Math.floor(time / 60 * 1000);
  const cacheFilePath = path.resolve(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache/root.json`);
  if (!fs.existsSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}`)) {
    fs.mkdirSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}`);
  }
  if (!fs.existsSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache`)) {
    fs.mkdirSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache`);
  }
  if (fs.existsSync(cacheFilePath)) {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/root.sql", "utf-8");
    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFile);
    if (cacheData.time !== day) {
      const data = await db.one(sql, []);
      const cacheData = { time: day, data: data };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/root.sql", "utf-8");
    const data = await db.one(sql, []);
    const cacheData = { time: day, data: data };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
  }
  const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
  const cacheData = JSON.parse(cacheFile);
  const data = cacheData.data;
  let users = data.root.users;
  if (users) {
    users.forEach((user: any) => { delete user.mail });
  } else {
    users = [];
  }
  if (!data.root.trending_articles) {
    data.root.trending_articles = [];
  }
  if (!data.root.trending_questions) {
    data.root.trending_questions = [];
  }
  const result: { notices: Notice[], trending_articles: Page[], trending_questions: Page[], users: UserPublic[] } = data.root;
  result.users = users;
  const res = NextResponse.json({ ok: true, data: result }, { status: 200 });
  return res;
}
