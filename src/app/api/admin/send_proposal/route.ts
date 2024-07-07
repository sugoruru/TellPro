import { LimitChecker } from "@/modules/main/limitChecker";
import { getServerSession } from "next-auth/next";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import OPTIONS from "../../auth/[...nextauth]/options";
import fs from "fs";
import path from "path";
import db from "@/modules/network/db";
import returnRandomString from "@/modules/algo/returnRandomString";
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
  const mail = session.user.email;

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["title", "opinion"];
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
    const data = await db.any(sql, [mail]) as UserPublic[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    time_ms = new Date().getTime() - new Date(data[0].sent_proposal_at).getTime();
    name = data[0].id;
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // 5分間に1回しか提案できない.
  if (time_ms < 1000 * 60 * 5) {
    return NextResponse.json({ ok: false, error: "You can send proposal once every 5 minutes", type: 1, time_ms });
  } else {
    // 提案を送信.
    {
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/proposals/create.sql", "utf-8");
      await db.none(sql, [returnRandomString(32), body.title, body.opinion, name]);
    }
    {
      // 提案送信時間を更新.
      const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/update_sent_proposal_at.sql", "utf-8");
      await db.none(sql, [mail]);
    }
    return NextResponse.json({ ok: true });
  }
}
