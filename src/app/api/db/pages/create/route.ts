import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../../auth/[...nextauth]/options";
import db from "@/modules/network/db";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

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

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["ID", "userID", "title", "content", "tags", "isPublic"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400 });
    }
  }

  // 自分自身のページであるか確認.
  try {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [session.user.email]) as User[];
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }
    if (data[0].ID !== body["userID"]) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページがすでに存在していれば400を返す.
  try {
    const data = await db.any(`SELECT * FROM "Pages" WHERE "ID" = $1 AND "userID" = $2`, [body["ID"], body["userID"]]);
    if (data.length > 0) {
      return NextResponse.json({ ok: false, error: "Page already exists" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページを作成.
  await db.any(`
    INSERT INTO "Pages" ("ID", "userID", "title", "content", "likeCount", "commentCount", "isPublic", "date", "tags") 
    VALUES ($1, $2, $3, $4, 0, 0, $5, $6, $7);
  `, [body.ID, body.userID, body.title, body.content, body.isPublic, new Date().toISOString().split("T")[0], body.tags]);
  const tagsToUpdate = `{${body.tags.join(',')}}`;
  await db.any(`
    WITH tag_data AS (
      SELECT unnest($1::text[]) AS tag_name
    )
    INSERT INTO "Tags" ("name", "pageCount")
    SELECT tag_name, 0
    FROM tag_data
    WHERE NOT EXISTS (
      SELECT 1
      FROM "Tags"
      WHERE "name" = tag_name
    );
  `, [tagsToUpdate]);
  await db.any(`UPDATE "Tags" SET "pageCount"="pageCount"+1 WHERE "name" IN ($1:csv)`, [body.tags]);
  return NextResponse.json({ ok: true }, { status: 200 });
}
