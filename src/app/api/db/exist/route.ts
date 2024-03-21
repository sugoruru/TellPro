import db from "@/modules/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import OPTIONS from "../../auth/[...nextauth]/options";

export async function GET(req: NextRequest) {
  const session = await getServerSession(OPTIONS);
  if (!session) {
    const res = NextResponse.json({ ok: false, error: 'Unauthorized' });
    return res;
  }
  if (req.nextUrl.searchParams.has("user")) {
    const data = await db.any(`SELECT * FROM "Users" WHERE mail = $1`, [req.nextUrl.searchParams.get("user")]);
    if (data.length == 0) {
      const res = NextResponse.json({ ok: true, exist: false });
      return res;
    } else {
      const res = NextResponse.json({ ok: true, exist: true });
      return res;
    }
  } else {
    const res = NextResponse.json({ ok: false, error: 'Invalid request' });
    return res;
  }
}
