import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createFile, getFilesByProject } from "@/lib/project-files-service";
import { getProjectById } from "@/lib/projects-service";
import { createFileSchema } from "@/schemas/project-file";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    // Validate access
    await getProjectById(projectId, session.user.id);

    const files = await getFilesByProject(projectId);
    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    // Validate access
    await getProjectById(projectId, session.user.id);

    const body = await req.json();
    const validated = createFileSchema.parse(body);

    const file = await createFile(projectId, validated.path, validated.content, validated.language);
    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create file" }, { status: 400 });
  }
}
