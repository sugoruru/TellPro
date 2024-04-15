import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";
import axios from "axios";

const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  // ipの取得
  const headersList = headers();
  const ip = headersList.get(process.env.NODE_ENV === "development" ? "X-Forwarded-For" : "X-Nf-Client-Connection-Ip");
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

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["userName", "mail", "icon", "ID"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  }
  if (body.statusMessage === undefined) body.statusMessage = "";

  // メールアドレスがセッションのユーザーのものでなければ401を返す.
  if (session.user?.email !== body.mail) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // ユーザーがすでに存在していれば400を返す.
  try {
    const existUser = await axios.get(process.env.NEXTAUTH_URL + `api/db/users/existMe?userID=${body.ID}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existUser.data.exist) {
      return NextResponse.json({ ok: false, error: "User Not found" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ユーザーをアップデート.
  await db.any(`UPDATE "Users" SET "username"=$1, "icon"=$2, "statusMessage"=$3 WHERE "ID" = $4`, [body.userName, body.icon, body.statusMessage, body.ID]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
