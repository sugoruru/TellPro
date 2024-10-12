import { LimitChecker } from "@/modules/main/limitChecker";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import OPTIONS from "../../auth/[...nextauth]/options";
import fs from "fs";
import path from "path";
import db from "@/modules/network/db";
import returnRandomString from "@/modules/algo/returnRandomString";
import { User } from "@/types/DBTypes";
import { APILimitConstant } from "@/modules/other/APILimitConstant";

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
    await limitChecker.check(APILimitConstant, ip);
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
  const mail = session.user.email;

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["user_id", "reported_user_id", "report_value"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // 自分自身か確認.
  let time_ms = 0;
  let name;
  try {
    const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/get_user_by_email.sql", "utf-8");
    const data = await db.any(sql, [mail]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    time_ms = new Date().getTime() - new Date(data[0].sent_report_at).getTime();
    name = data[0].id;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // 30分に1回しか通報できない.
  if (time_ms < 1000 * 60 * 30) {
    return NextResponse.json({ ok: false, error: "You can send proposal once every 30 minutes", type: 1, time_ms });
  } else {
    // 通報を送信.
    {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/reports/create.sql", "utf-8");
      await db.none(sql, [returnRandomString(32), body.user_id, body.reported_user_id, body.report_value]);
    }
    {
      // 通報時間を更新.
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/update_sent_report_at.sql", "utf-8");
      await db.none(sql, [mail]);
    }
    return NextResponse.json({ ok: true });
  }
}
