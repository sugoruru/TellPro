import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import { pageBlockKey } from "@/modules/DBBlockKey";
import { getServerSession } from "next-auth";
import OPTIONS from "@/app/api/auth/[...nextauth]/options";
import fs from "fs";
import path from "path";
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
  const userID = req.nextUrl.searchParams.get("userID");
  const pageType = req.nextUrl.searchParams.get("pageType");
  if (userID === null || pageType === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!(!session || !session.user)) {
    // 自分のページの場合は非公開のページも取得.
    try {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
      const data = await db.any(sql, [session.user.email]) as UserPublic[];
      if (data.length > 0) {
        if (data[0].id === userID) {
          // 非公開のページも取得.
          const pages = await db.any(`SELECT ${pageBlockKey} FROM pages WHERE user_id = $1 AND page_type = $2 order by date desc`, [userID, pageType]);
          const res = NextResponse.json({ ok: true, pages: pages }, { status: 200 });
          return res;
        }
      }
    } catch (error) {
      return NextResponse.json({ ok: false, error: "Invalid request2" }, { status: 400 });
    }
  }

  // 公開ページのみ取得.
  const pages = await db.any(`SELECT ${pageBlockKey} FROM pages WHERE user_id = $1 AND is_public = true AND page_type = $2 order by date desc`, [userID, pageType]);
  const res = NextResponse.json({ ok: true, pages: pages }, { status: 200 });
  return res;
}
