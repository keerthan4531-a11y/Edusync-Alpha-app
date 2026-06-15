import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/lib/projects-service";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string, fileId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, fileId } = await params;
    await getProjectById(projectId, session.user.id);

    const history = await db.fileVersion.findMany({
      where: { fileId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Failed to fetch file version history:", error);
    return NextResponse.json({ error: "Failed to fetch file version history" }, { status: 500 });
  }
}
