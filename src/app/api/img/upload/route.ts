import { NextRequest, NextResponse } from "next/server";
import returnRandomString from "@/modules/algo/returnRandomString";
import { writeFileSync } from "fs";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ ok: false, error: "This API is only available in development mode." }, { status: 400 });
  }
  const imageID = returnRandomString(32);
  const image = (await req.formData()).get("image") as string;
  const decodedFile = Buffer.from(image, 'base64');
  writeFileSync(`public/img.local/${imageID}.jpg`, decodedFile);
  return NextResponse.json({ ok: true, data: { link: `${process.env.NEXT_PUBLIC_TRUTH_URL}/img.local/${imageID}.jpg` } }, { status: 200 });
}
