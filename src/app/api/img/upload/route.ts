import { NextRequest, NextResponse } from "next/server";
import returnRandomString from "@/modules/algo/returnRandomString";
import axios from "axios";

export async function POST(req: NextRequest) {
  const imageID = returnRandomString(128);
  const jwtToken = await axios.post(`${process.env.NEXT_PUBLIC_TRUTH_URL}/api/img`, { imageID });
  const body = await req.json();
  const imageData = body.image as string;
  const res = await axios.post(`${process.env.IMAGE_SERVER_URL}/upload`, { image: imageData, jwtToken: jwtToken.data.token });
  return NextResponse.json({ ok: true, data: { link: `${process.env.IMAGE_SERVER_URL}${res.data}` } }, { status: 200 });
}
