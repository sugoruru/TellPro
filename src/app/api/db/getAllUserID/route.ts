import db from "@/modules/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    return res;
  }
  if (req.nextUrl.searchParams.has("user")) {
    if (session.user?.email == req.nextUrl.searchParams.get("user")) {
      const data = await db.any(`SELECT "ID" FROM "Users"`);
      const res = NextResponse.json({ ok: true, data: data.map((x: { [s: string]: string; } | ArrayLike<string>) => Object.values(x)).flat() });
      return res;
    } else {
      const res = NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      return res;
    }
  } else {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    return res;
  }
}
