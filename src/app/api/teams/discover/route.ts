import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find all projects that have a team, are PUBLIC, and where the user is NOT a member
    const publicProjects = await db.project.findMany({
      where: {
        visibility: "PUBLIC",
        team: {
          is: {
            members: {
              none: { userId: session.user.id }
            }
          }
        }
      },
      include: {
        team: {
          include: {
            members: {
              include: { user: { select: { name: true } } }
            }
          }
        },
        owner: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(publicProjects);
  } catch (error) {
    console.error("Failed to fetch public groups:", error);
    return NextResponse.json({ error: "Failed to fetch public groups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { teamId } = body;

    if (!teamId) return NextResponse.json({ error: "teamId is required" }, { status: 400 });

    // Add user as member to team
    const newMember = await db.teamMember.create({
      data: {
        teamId,
        userId: session.user.id,
        roleInTeam: "MEMBER"
      }
    });

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (error) {
    console.error("Failed to join group:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 400 });
  }
}
