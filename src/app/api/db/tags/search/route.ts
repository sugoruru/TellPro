import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import fs from "fs";
import path from 'path';

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

  const word = req.nextUrl.searchParams.get("word");
  if (word === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }
  const time = new Date().getTime();
  const fiveMinutes = Math.floor(time / 300000);
  const cacheFilePath = path.resolve(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache/tags.json`);
  if (!fs.existsSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}`)) {
    fs.mkdirSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}`);
  }
  if (!fs.existsSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache`)) {
    fs.mkdirSync(`${process.env.IS_DEV === "true" ? "./tmp" : "/tmp"}/cache`);
  }
  if (fs.existsSync(cacheFilePath)) {
    const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
    const cacheData = JSON.parse(cacheFile);
    if (cacheData.time !== fiveMinutes) {
      const data = await db.any(`select * from tags`);
      const cacheData = { time: fiveMinutes, data: data };
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
    }
  } else {
    const data = await db.any(`select * from tags`);
    const cacheData = { time: fiveMinutes, data: data };
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData));
  }
  const cacheFile = fs.readFileSync(cacheFilePath, 'utf-8');
  const cacheData = JSON.parse(cacheFile);
  const data = cacheData.data.filter((tag: any) => tag.name.includes(word));
  const res = NextResponse.json({ ok: true, exist: true, data: data }, { status: 200 });
  return res;
}
