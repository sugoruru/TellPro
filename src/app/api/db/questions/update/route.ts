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
    const data = await db.any(`SELECT * FROM "Questions" WHERE "ID" = $1 AND "userID" = $2`, [body["ID"], body["userID"]]);
    if (data.length === 0) {
      return NextResponse.json({ ok: false, error: "Page already exists" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // ページをアップデート.
  try {
    const prevTags = await db.any(`SELECT "tags" FROM "Questions" WHERE "ID"=$1 AND "userID"=$2`, [body.ID, body.userID]);
    const tagsToUpdate = prevTags[0].tags;
    await db.any(`UPDATE "Tags" SET "questionCount"="questionCount"-1 WHERE "name" IN ($1:csv)`, [tagsToUpdate]);
    await db.any(`UPDATE "Questions" SET "title"=$1, "content"=$2, "tags"=$3, "isPublic"=$4, "date"=$5 WHERE "ID"=$6 AND "userID"=$7`, [body.title, body.content, body.tags, body.isPublic, new Date().toISOString().split("T")[0], body.ID, body.userID]);
    const tagsToUpdate2 = `{${body.tags.join(',')}}`
    await db.any(`
      WITH tag_data AS (
        SELECT unnest($1::text[]) AS tag_name
      )
      INSERT INTO "Tags" ("name", "questionCount")
      SELECT tag_name, 1
      FROM tag_data
      WHERE NOT EXISTS (
        SELECT 1
        FROM "Tags"
        WHERE "name" = tag_name
      );
    `, [tagsToUpdate2]);
    await db.any(`UPDATE "Tags" SET "questionCount"="questionCount"+1 WHERE "name" IN ($1:csv)`, [body.tags]);
    await db.any(`DELETE FROM "Tags" WHERE "questionCount"=0 AND "pageCount"=0 AND "name" IN ($1:csv)`, [tagsToUpdate]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
