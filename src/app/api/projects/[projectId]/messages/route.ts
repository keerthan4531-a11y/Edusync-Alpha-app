import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMessagesByTeam, createMessage } from "@/lib/messages-service";
import { getProjectById } from "@/lib/projects-service";
import { getTeamByProject } from "@/lib/teams-service";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    await getProjectById(projectId, session.user.id);
    
    const team = await getTeamByProject(projectId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const messages = await getMessagesByTeam(team.id);
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    await getProjectById(projectId, session.user.id);

    const team = await getTeamByProject(projectId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const body = await req.json();
    if (!body.content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

    const message = await createMessage(team.id, session.user.id, body.content);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create message" }, { status: 400 });
  }
}
