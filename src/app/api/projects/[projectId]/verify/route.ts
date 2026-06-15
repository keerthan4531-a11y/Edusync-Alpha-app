import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getProjectById } from "@/lib/projects-service";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const project = await getProjectById(projectId, session.user.id);

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Only project owner can submit for verification" }, { status: 403 });
    }

    const body = await req.json();
    const { facultyId } = body;

    if (!facultyId) return NextResponse.json({ error: "facultyId is required" }, { status: 400 });

    // Update project status to PENDING_VERIFICATION
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        status: "PENDING_VERIFICATION"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Project submitted for verification successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("Failed to submit project for verification:", error);
    return NextResponse.json({ error: "Failed to submit project for verification" }, { status: 400 });
  }
}
