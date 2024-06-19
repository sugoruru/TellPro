import { NextRequest, NextResponse } from "next/server";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";
import { getServerSession } from "next-auth/next";
import OPTIONS from "../../auth/[...nextauth]/options";
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

  // Maintenance中は401を返す.
  if (process.env.NEXT_PUBLIC_IS_MAINTENANCE === "true") {
    return NextResponse.json({ ok: false, error: "Maintenance" }, { status: 401 });
  }

  // Cookieからセッションを取得して、セッションが存在しなければ401を返す.
  const session = await getServerSession(OPTIONS);
  if (!session || !session.user) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }

  // 画像を保存.
  const imageID = returnRandomString(64);
  const jwtToken = await axios.post(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/img`, { imageID });
  const body = await req.json();
  const imageData = body.image as string;
  const res = await axios.post(`${process.env.IMAGE_SERVER_URL}/upload`, { image: imageData, jwtToken: jwtToken.data.token });
  return NextResponse.json({ ok: true, data: { link: `${process.env.IMAGE_SERVER_URL}${res.data}` } }, { status: 200 });
}
