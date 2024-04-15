import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import axios from "axios";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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
    NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429 });
    return;
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["ID", "userID", "title", "content", "tags", "isPublic"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  }

  // ページがすでに存在していれば400を返す.
  try {
    const existUser = await axios.get(process.env.NEXTAUTH_URL + `api/db/pages/exist?userID=${body["userID"]}&pageID=${body["ID"]}`, {
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
  await db.any(`INSERT INTO "Pages" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [body.ID, body.userID, body.title, body.content, 0, 0, body.isPublic, new Date().toISOString().split("T")[0], body.tags]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
