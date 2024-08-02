import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import OPTIONS from "../../auth/[...nextauth]/options";
import { Page } from "@/types/page";
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

  // クエリパラメータの取得.
  const userID = req.nextUrl.searchParams.get("userID");
  if (userID === null) {
    const res = NextResponse.json({ ok: false, error: 'Invalid request1' }, { status: 400 });
    return res;
  }

  const session = await getServerSession(OPTIONS);
  let me, _res;
  if (!session || !session.user) {
    me = { ok: true, exist: false, message: "not login" };
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/user.sql", "utf-8");
    _res = await db.one(sql, ["", userID]);
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/user.sql", "utf-8");
    _res = await db.one(sql, [session.user.email, userID]);
  }
  let __res: { me: UserPublic[], user: UserPublic[], articles: Page[], questions: Page[], problems: Page[] } = _res.result;
  let result: { me: UserPublic | null, user: UserPublic | null, articles: Page[], questions: Page[], problems: Page[] } = _res.result;
  if (__res.user) {
    if (__res.user.length === 1) {
      delete (__res.user[0] as any).mail;
      result.user = __res.user[0];
    }
  } else {
    result.user = null;
  }
  if (__res.me) {
    if (__res.me.length === 1) {
      delete (__res.me[0] as any).mail;
      result.me = __res.me[0];
    }
  } else {
    result.me = null;
  }
  if (!result.articles) {
    result.articles = [];
  }
  if (!result.questions) {
    result.questions = [];
  }
  if (!result.problems) {
    result.problems = [];
  }
  const res = NextResponse.json({ ok: true, data: result }, { status: 200 });
  return res;
}
