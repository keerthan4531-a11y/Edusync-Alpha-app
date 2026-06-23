import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
        badges: {
          include: {
            badge: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all badges to show earned vs locked
    const allBadges = await db.badge.findMany();

    // Fetch stage progress
    const stageProgresses = await db.stageProgress.findMany({
      where: { userId },
      include: { stage: true }
    });

    // Fetch recent activities (e.g. Stage 1 communication, project files, assignments)
    const stage1Activities = await db.stage1Activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const assignmentSubmissions = await db.assignmentSubmission.findMany({
      where: { studentId: userId },
      include: {
        assignment: true
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Compile dynamic activities list
    const activities: any[] = [];

    stage1Activities.forEach(act => {
      activities.push({
        id: act.id,
        type: "communication",
        title: `Completed ${act.type} Practice`,
        description: `Scored ${act.score}% in communication skill check. Awarded +${act.xpAwarded} XP.`,
        createdAt: act.createdAt
      });
    });

    assignmentSubmissions.forEach(sub => {
      activities.push({
        id: sub.id,
        type: "assignment",
        title: `Submitted Assignment: ${sub.assignment.title}`,
        description: sub.status === "GRADED" 
          ? `Graded by instructor. Score: ${sub.grade}/100. Feedback: "${sub.feedback || 'None'}"`
          : `Code uploaded successfully. Pending grading.`,
        createdAt: sub.createdAt
      });
    });

    // Sort combined activities by date desc
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Format final response
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      coins: user.coins,
      level: user.level,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      bio: user.bio,
      skills: user.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      github: user.github,
      linkedin: user.linkedin,
      department: user.department?.name || "Unassigned Department",
      badges: allBadges.map(badge => {
        const earnedRecord = user.badges.find(ub => ub.badgeId === badge.id);
        return {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          earned: !!earnedRecord,
          earnedAt: earnedRecord ? earnedRecord.earnedAt : null
        };
      }),
      stageProgress: stageProgresses.map(sp => ({
        stageNumber: sp.stage.number,
        stageName: sp.stage.name,
        status: sp.status,
        completedAt: sp.completedAt
      })),
      activities: activities.slice(0, 10)
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Failed to fetch profile details:", error);
    return NextResponse.json({ error: "Failed to fetch profile details" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const body = await req.json();
    const { name, bio, skills, github, linkedin, phone, dob, gender, rollNumber, department, yearOfStudy, interests, careerGoals, weakAreas } = body;

    // Validate inputs
    if (name !== undefined && name.trim() === "") {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills.join(",") : skills.trim() }),
        ...(github !== undefined && { github: github.trim() }),
        ...(linkedin !== undefined && { linkedin: linkedin.trim() })
        // Note: For fields not in the schema (phone, dob, gender, etc), 
        // they are currently handled via localStorage on the client side per our open questions.
        // If they are added to Prisma later, they can be uncommented here:
        // ...(phone !== undefined && { phone: phone.trim() }),
        // ...(dob !== undefined && { dob: dob }),
        // ...(gender !== undefined && { gender: gender }),
        // ...(rollNumber !== undefined && { rollNumber: rollNumber.trim() }),
        // ...(department !== undefined && { department: { connect: { name: department } } }),
        // ...(yearOfStudy !== undefined && { yearOfStudy: parseInt(yearOfStudy) }),
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        bio: updatedUser.bio,
        skills: updatedUser.skills ? updatedUser.skills.split(",") : [],
        github: updatedUser.github,
        linkedin: updatedUser.linkedin
      }
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json({ error: "Failed to update profile info" }, { status: 500 });
  }
}

