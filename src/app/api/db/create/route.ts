import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/db";

export async function POST(req: NextRequest) {
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
    if (!body[key]) {
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
    const existUser = await axios.get(process.env.NEXTAUTH_URL + "api/db/exist?user=" + body.mail, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (existUser.data.exist) {
      return NextResponse.json({ ok: false, error: "User already exists" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ユーザーを作成.
  await db.any(`INSERT INTO "Users" VALUES ($1, $2, $3, $4, $5, $6, $7)`, [body.ID, body.userName, body.mail, body.icon, body.statusMessage, 0, 0]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
