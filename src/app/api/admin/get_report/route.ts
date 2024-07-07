import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";
import { UserPublic } from "@/types/user";

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
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
    NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // 自分自身か確認.
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [session.user.email]) as UserPublic[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    // 管理者か確認.
    if (data[0].is_admin === false) {
      return NextResponse.json({ ok: false, error: "You are not admin" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/reports/get.sql", "utf-8");
    const data = await db.any(sql) as Report[];
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
