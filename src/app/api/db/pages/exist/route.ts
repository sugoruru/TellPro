import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";

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

  const userID = req.nextUrl.searchParams.get("userID");
  const pageID = req.nextUrl.searchParams.get("pageID");
  const pageType = req.nextUrl.searchParams.get("pageType");
  if (userID === null || pageID === null || pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }
  const sql = fs.readFileSync("src/sql/pages/exist.sql", "utf-8");
  const data = await db.any(sql, [pageID, userID, pageType]);
  if (data.length == 0) {
    const res = NextResponse.json({ ok: true, exist: false }, { status: 200 });
    return res;
  } else {
    const res = NextResponse.json({ ok: true, exist: true, data: data[0] }, { status: 200 });
    return res;
  }
}
