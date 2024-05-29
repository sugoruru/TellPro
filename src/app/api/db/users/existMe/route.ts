import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";

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

  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: true, exist: false, message: "not login" }, { status: 200 });
    return res;
  }
  const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/users/get_user_by_email.sql", "utf-8");
  const data = await db.any(sql, [session.user.email]);
  if (data.length === 0) {
    const res = NextResponse.json({ ok: true, exist: false }, { status: 200 });
    return res;
  } else {
    // 最終ログイン日時の更新.
    const sql = fs.readFileSync((process.env.NODE_ENV === "development" ? "public/" : "") + "sql/users/update_last_login_at.sql", "utf-8");
    await db.any(sql, [session.user.email]);
    const res = NextResponse.json({ ok: true, exist: true, data: data[0] }, { status: 200 });
    return res;
  }
}
