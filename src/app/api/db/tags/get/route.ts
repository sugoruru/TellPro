import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
  const page = req.nextUrl.searchParams.get("page");
  if (page === null || isNaN(Number(page)) || Number(page) < 1) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  const data = await db.any(`WITH numbered_tags AS (SELECT *, "pageCount" + "questionCount" AS "totalCount", ROW_NUMBER() OVER (ORDER BY "pageCount" + "questionCount" DESC) AS row_num FROM "Tags") SELECT * FROM numbered_tags WHERE row_num > (($1 - 1) * 30) AND row_num <= ($1 * 30);`, [Number(page)]);
  const res = NextResponse.json({ ok: true, exist: true, data: data }, { status: 200 });
  return res;
}
