import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    const recipients = await db.user.findMany({
      where: {
        id: { not: userId },
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 15
    });

    return NextResponse.json(recipients);
  } catch (error) {
    console.error("Failed to fetch recipients:", error);
    return NextResponse.json({ error: "Failed to fetch recipients" }, { status: 500 });
  }
}
