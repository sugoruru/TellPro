import db from "@/modules/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../auth/[...nextauth]/options";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("x-forwarded-for");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
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

  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }
  if (req.nextUrl.searchParams.has("user")) {
    if (session.user?.email == req.nextUrl.searchParams.get("user")) {
      const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [req.nextUrl.searchParams.get("user")]);
      if (data.length == 0) {
        const res = NextResponse.json({ ok: true, exist: false }, { status: 200 });
        return res;
      } else {
        const res = NextResponse.json({ ok: true, exist: true, data: data[0] }, { status: 200 });
        return res;
      }
    } else {
      const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      return res;
    }
  } else {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }
}
