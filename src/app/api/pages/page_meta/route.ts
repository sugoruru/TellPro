import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/db";
import { headers } from "next/headers";
import { LimitChecker } from "@/modules/limitChecker";

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

  // クエリパラメータの取得.
  const pageID = req.nextUrl.searchParams.get("pageID");
  const pageType = req.nextUrl.searchParams.get("pageType");
  const userID = req.nextUrl.searchParams.get("userID");
  if (pageID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // ユーザー情報の取得.
  const res = await db.any("SELECT id, title, user_id FROM pages WHERE id = $1 and page_type=$2 and user_id=$3", [pageID, pageType, userID]);
  if (res.length === 0) {
    const res = NextResponse.json({ ok: false });
    return res;
  } else {
    const result = NextResponse.json({ ok: true, page: res[0] });
    return result;
  }
}