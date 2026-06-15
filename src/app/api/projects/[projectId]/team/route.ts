import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTeamByProject, addTeamMember } from "@/lib/teams-service";
import { getProjectById } from "@/lib/projects-service";
import { addMemberSchema } from "@/schemas/team";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    await getProjectById(projectId, session.user.id);

    const team = await getTeamByProject(projectId);
    return NextResponse.json(team);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId } = await params;
    const project = await getProjectById(projectId, session.user.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    // Only owner can add members for now
    if (project.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Only project owner can add team members" }, { status: 403 });
    }

    const team = await getTeamByProject(projectId);
    if (!team) return NextResponse.json({ error: "Team not found for this project" }, { status: 404 });

    const body = await req.json();
    const validated = addMemberSchema.parse(body);

    const member = await addTeamMember(team.id, validated.userId, validated.roleInTeam);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add team member" }, { status: 400 });
  }
}
