import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

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
    const res = NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return res;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["userName", "mail", "icon", "ID", "status_message", "atcoder_id", "codeforces_id", "x_id"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }
  if (body.status_message === undefined) body.status_message = "";

  // メールアドレスがセッションのユーザーのものでなければ401を返す.
  if (session.user?.email !== body.mail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // ユーザーがすでに存在していなければ400を返す.
  try {
    const data = await db.any(`SELECT * FROM users WHERE id = $1`, [body.ID]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User Not found" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ユーザーをアップデート.
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/users/update.sql", "utf-8");
  await db.any(sql, [body.userName, body.icon, body.status_message, body.ID, body.atcoder_id, body.codeforces_id, body.x_id]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
