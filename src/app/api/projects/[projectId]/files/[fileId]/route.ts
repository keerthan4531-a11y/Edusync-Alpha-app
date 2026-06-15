import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFileById, updateFileContent, deleteFile } from "@/lib/project-files-service";
import { getProjectById } from "@/lib/projects-service";
import { updateFileContentSchema } from "@/schemas/project-file";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string, fileId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, fileId } = await params;
    await getProjectById(projectId, session.user.id);

    const file = await getFileById(fileId, projectId);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ projectId: string, fileId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, fileId } = await params;
    await getProjectById(projectId, session.user.id);

    const body = await req.json();
    const validated = updateFileContentSchema.parse(body);

    const file = await updateFileContent(fileId, projectId, validated.content);
    return NextResponse.json(file);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update file" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string, fileId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, fileId } = await params;
    await getProjectById(projectId, session.user.id);

    await deleteFile(fileId, projectId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
