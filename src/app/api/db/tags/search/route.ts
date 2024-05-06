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
  const word = req.nextUrl.searchParams.get("word");
  if (word === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  const data = await db.any(`SELECT * FROM "Tags" WHERE "name" LIKE '%$1:value%' ORDER BY ("pageCount" + "questionCount") DESC LIMIT 30;`, [word]);
  const res = NextResponse.json({ ok: true, exist: true, data: data }, { status: 200 });
  return res;
}
