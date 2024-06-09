import db from "@/modules/network/db";
import { NextRequest, NextResponse } from "next/server";
import { LimitChecker } from "@/modules/limitChecker";
import { headers } from "next/headers";

const limitChecker = LimitChecker();
export async function GET(req: NextRequest) {
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
  const userName = req.nextUrl.pathname.split("/")[1];
  const pageType = req.nextUrl.pathname.split("/")[2];
  const pageID = req.nextUrl.pathname.split("/")[3];
  const pageMD = await db.any("select content from pages where id=$1 and user_id=$2 and page_type=$3", [pageID, userName, pageType]);
  // textで返す.
  console.log(pageMD);
  return new NextResponse(pageMD[0].content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
