import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/pomoskDB";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { APILimitConstant } from "@/modules/other/APILimitConstant";
import fs from "fs";
import path from "path";

const allowOrigin = "*";
const corsHeaders = {
  'Access-Control-Allow-Origin': allowOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
  const required = ["login_token"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400, headers: corsHeaders });
    }
  }
  const { login_token } = body as { login_token: string };
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/check_login_key.sql", "utf-8");
  const result = await db.any(sql, [login_token]);
  if (result.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid login token" }, { status: 400, headers: corsHeaders });
  }
  return NextResponse.json({ ok: true, result }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
