import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import axios from "axios";
import { pageBlockKey } from "@/modules/DBBlockKey";

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
  if (req.nextUrl.searchParams.get("userID") === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }

  // 自分のページの場合は非公開のページも取得.
  try {
    const me = await axios.get(process.env.NEXTAUTH_URL + `/api/db/users/existMe`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (me.data.exist) {
      if (me.data.data.ID === req.nextUrl.searchParams.get("userID")) {
        // 非公開のページも取得.
        const pages = await db.any(`SELECT ${pageBlockKey} FROM "Pages" WHERE "userID" = $1`, [req.nextUrl.searchParams.get("userID")]);
        const res = NextResponse.json({ ok: true, pages: pages }, { status: 200 });
        return res;
      }
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // 公開ページのみ取得.
  const pages = await db.any(`SELECT ${pageBlockKey} FROM "Pages" WHERE "userID" = $1 AND "isPublic" = true`, [req.nextUrl.searchParams.get("userID")]);
  const res = NextResponse.json({ ok: true, pages: pages }, { status: 200 });
  return res;
}
