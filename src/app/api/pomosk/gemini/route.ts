import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/pomoskDB";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { APILimitConstant } from "@/modules/other/APILimitConstant";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai"
import { randomUUID } from "crypto";

const allowOrigin = process.env.IS_DEV === "true" ? "https://192.168.11.8:3000" : "https://pomosk.tellpro.net";
const corsHeaders = {
  'Access-Control-Allow-Origin': allowOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const API_KEY = process.env.GOOGLE_GEMINI;
let genAI: null | GoogleGenerativeAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}
const limitChecker = LimitChecker();
export async function POST(req: NextRequest) {
  req.headers.set("Access-Control-Allow-Origin", allowOrigin);
  req.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  req.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // ipの取得
  const headersList = headers();
  const ip = headersList.get("X-Forwarded-For");
  if (!ip) {
    return NextResponse.json({ ok: false, error: "not found your IP" }, { status: 400, headers: corsHeaders });
  }

  // 毎分100requestの制限.
  try {
    await limitChecker.check(APILimitConstant, ip);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "Too many requests",
    }, { status: 429, headers: corsHeaders });
  }

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401, headers: corsHeaders });
  }

  // リクエストボディに必要なキーが存在しなければ400を返す.
  const required = ["login_token", "tag_data"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400, headers: corsHeaders });
    }
  }
  const { login_token, tag_data } = body as { login_token: string, tag_data: string };
  const tags_data = JSON.parse(tag_data);
  if (!Array.isArray(tags_data)) {
    return NextResponse.json({ ok: false, error: "Invalid tag data" }, { status: 400, headers: corsHeaders });
  }
  if (tags_data.length === 0) {
    return NextResponse.json({ ok: false, error: "Empty tag data" }, { status: 400, headers: corsHeaders });
  }
  if (tags_data.length > 30) {
    return NextResponse.json({ ok: false, error: "Too many tags" }, { status: 400, headers: corsHeaders });
  }
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/check_login_key.sql", "utf-8");
  const result = await db.any(sql, [login_token]);
  if (result.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid login token" }, { status: 400, headers: corsHeaders });
  }
  const sql2 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/get_user_gemini.sql", "utf-8");
  const gemini = await db.any(sql2, [result[0].user_id]);
  if (gemini.length !== 0) {
    // 1週間に1回のみの制限.
    const today = new Date();
    const lastDate = new Date(gemini[0].created_at);
    const diff = today.getTime() - lastDate.getTime();
    const diffDays = diff / (1000 * 60 * 60 * 24);
    if (diffDays < 7) {
      return NextResponse.json({ ok: true, gemini_text: gemini[0].gemini_text }, { status: 200, headers: corsHeaders });
    }
  }
  if (!genAI) {
    return NextResponse.json({ ok: false, error: "Not found Google Gemini API Key" }, { status: 400, headers: corsHeaders });
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `
  以下のデータは1週間のタグごとの活動時間のものです。
  このデータを読み取ってアドバイスをしてください。
  ただし、「」はタグ名、「時間」は時間(h)を表しています。
  数字だけの相関を見て、タグ名は無視してください。

  ${tags_data.map((tag: { name: string, time: number }) => `「${tag.name}」: ${tag.time}時間`).join("\n")}
  `;
  const response = (await model.generateContent(prompt)).response.text();
  if (gemini.length === 0) {
    const uuid = randomUUID();
    const sql3 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/insert_user_gemini.sql", "utf-8");
    await db.any(sql3, [uuid, result[0].user_id, response]);
  } else {
    const sql4 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/update_user_gemini.sql", "utf-8");
    await db.any(sql4, [response, result[0].user_id]);
  }
  return NextResponse.json({ ok: true, gemini_text: response }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
