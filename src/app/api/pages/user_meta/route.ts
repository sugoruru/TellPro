import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/db";
import { headers } from "next/headers";
import { LimitChecker } from "@/modules/main/limitChecker";
import { APILimitConstant } from "@/modules/other/APILimitConstant";

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
    await limitChecker.check(APILimitConstant, ip);
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

  // クエリパラメータの取得.
  const userID = req.nextUrl.searchParams.get("userID");
  if (userID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // ユーザー情報の取得.
  const res = await db.any("SELECT id, status_message, icon FROM users WHERE id = $1", [userID]);
  if (res.length === 0) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request2' }, { status: 400 });
    return res;
  } else {
    const result = NextResponse.json({ ok: true, user: res[0] });
    return result;
  }
}