import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProblemStatements } from "@/lib/problem-statements-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const statements = await getProblemStatements();
    return NextResponse.json(statements);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problem statements" }, { status: 500 });
  }
}
