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
    const role = searchParams.get("role") || "STUDENT";

    // If query is empty but role is FACULTY, return all faculty for the dropdown list
    if (query.length === 0 && role === "FACULTY") {
      const faculty = await db.user.findMany({
        where: { role: "FACULTY" },
        select: { id: true, name: true, email: true },
        take: 20
      });
      return NextResponse.json(faculty);
    }

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await db.user.findMany({
      where: {
        role: role,
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
    console.error("Failed to search users:", error);
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
  }
}

