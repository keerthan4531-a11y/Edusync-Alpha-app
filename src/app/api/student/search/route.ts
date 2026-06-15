import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await db.user.findMany({
      where: {
        role: "STUDENT",
        id: { not: session.user.id },
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to search students:", error);
    return NextResponse.json({ error: "Failed to search students" }, { status: 500 });
  }
}
