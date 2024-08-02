import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.data === undefined) {
    return NextResponse.json({ error: "ERROR" }, { status: 400 });
  }
  // JWTで接続するためのトークンを発行する.
  const payload = {
    problems: body.data,
  }
  const jwtSecret = process.env.JWT_SECRET as string;
  return NextResponse.json({ token: sign(payload, jwtSecret, { expiresIn: "10s", algorithm: "HS256" }) }, { status: 200 });
}
