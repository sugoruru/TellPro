import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
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

  // クエリパラメータの取得.
  const word = req.nextUrl.searchParams.get("word");
  if (word === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }

  // 検索する.
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/search.sql", "utf-8");
  const result = await db.query(sql, [word]);
  return NextResponse.json({ ok: true, result, word }, { status: 200 });
}
