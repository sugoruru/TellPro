import { NextRequest, NextResponse } from "next/server";
import db from "@/modules/network/pomoskDB";
import { LimitChecker } from "@/modules/main/limitChecker";
import { headers } from "next/headers";
import { APILimitConstant } from "@/modules/other/APILimitConstant";
import fs from "fs";
import path from "path";

const allowOrigin = process.env.IS_DEV === "true" ? "https://192.168.11.8:3000" : "https://pomosk.tellpro.net";
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
  const required = ["task_id", "login_token"];
  const body = await req.json();
  for (const key of required) {
    if (!(key in body)) {
      return NextResponse.json({ ok: false, error: "Missing required key" }, { status: 400, headers: corsHeaders });
    }
  }
  const { login_token, task_id } = body as { login_token: string, task_id: string };
  const sql = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/check_login_key.sql", "utf-8");
  const result = await db.any(sql, [login_token]);
  if (result.length === 0) {
    return NextResponse.json({ ok: false, error: "Invalid login token" }, { status: 400, headers: corsHeaders });
  }
  const sql2 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/get_user_tasks.sql", "utf-8");
  const tasks = await db.any(sql2, [result[0].user_id]);
  // tasksにtask_idが存在しなければ400を返す.
  if (!tasks.find((task: any) => task.id === task_id)) {
    return NextResponse.json({ ok: false, error: "Task not found" }, { status: 400, headers: corsHeaders });
  }
  const sql3 = fs.readFileSync(path.resolve("./public") + "/sql/pomosk/delete_task.sql", "utf-8");
  await db.none(sql3, [task_id]);
  return NextResponse.json({ ok: true }, { status: 200, headers: corsHeaders });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
