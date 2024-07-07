import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

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

  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: true, exist: false, message: "not login" }, { status: 200 });
    return res;
  }
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
  const data = await db.any(sql, [session.user.email]);
  if (data.length === 0) {
    const res = NextResponse.json({ ok: true, exist: false }, { status: 200 });
    return res;
  } else {
    const res = NextResponse.json({ ok: true, exist: true, data: data[0] }, { status: 200 });
    return res;
  }
}
