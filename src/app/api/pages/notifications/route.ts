import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import OPTIONS from "../../auth/[...nextauth]/options";
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
    return NextResponse.json({ ok: true, isLogin: false }, { status: 200 });
  }
  const sql1 = fs.readFileSync(path.resolve("./public") + "/sql/notifications/get.sql", "utf-8");
  const notifications = await db.any(sql1, [session.user.email]);
  const sql2 = fs.readFileSync(path.resolve("./public") + "/sql/notifications/update.sql", "utf-8");
  await db.query(sql2, [session.user.email]);
  const res = NextResponse.json({ ok: true, isLogin: true, notifications: notifications[0].result }, { status: 200 });
  return res;
}
