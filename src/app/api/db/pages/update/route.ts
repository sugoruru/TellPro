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
  const required = ["ID", "userID", "title", "content", "tags", "isPublic"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // ページが存在しない場合は400を返す.
  try {
    const existPage = await axios.get(process.env.NEXTAUTH_URL + `/api/db/pages/exist?pageID=${body.ID}&userID=${body.userID}`, {
      withCredentials: true,
      headers: {
        Cookie: req.headers.get("cookie")
      }
    });
    if (!existPage.data.exist) {
      return NextResponse.json({ ok: false, error: "Page Not found" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページをアップデート.
  try {
    await db.any(`UPDATE "Pages" SET "title"=$1, "content"=$2, "tags"=$3, "isPublic"=$4, "date"=$5 WHERE "ID"=$6 AND "userID"=$7`, [body.title, body.content, body.tags, body.isPublic, new Date().toISOString().split("T")[0], body.ID, body.userID]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
