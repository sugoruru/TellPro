import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import OPTIONS from "../../auth/[...nextauth]/options";

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
  let me, data, result;
  if (!session || !session.user) {
    me = { ok: true, exist: false, message: "not login" };
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/user.sql", "utf-8");
    result = await db.one(sql, ["", userID]);
  } else {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/api/user.sql", "utf-8");
    result = await db.one(sql, [session.user.email, userID]);
  }
  if (result.result.user) {
    if (result.result.user.length === 1) {
      delete result.result.user[0].mail;
      result.result.user = result.result.user[0];
    }
  } else {
    result.result.user = null;
  }
  if (result.result.me) {
    if (result.result.me.length === 1) {
      delete result.result.me[0].mail;
      result.result.me = result.result.me[0];
    }
  } else {
    result.result.me = null;
  }
  const res = NextResponse.json({ ok: true, data: result.result }, { status: 200 });
  return res;
}
