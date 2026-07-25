import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user details including student profile
    let user = session.user.id
      ? await db.user.findUnique({
          where: { id: session.user.id },
          include: {
            department: true,
            studentProfile: {
              include: { class: true }
            },
            badges: {
              include: { badge: true }
            }
          }
        })
      : null;

    if (!user && session.user.email) {
      user = await db.user.findUnique({
        where: { email: session.user.email },
        include: {
          department: true,
          studentProfile: {
            include: { class: true }
          },
          badges: {
            include: { badge: true }
          }
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = user.id;

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
      
      // Pass the complete student profile object if it exists
      studentProfile: user.studentProfile || null,

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
    const { 
      // Base user fields
      name, bio, skills, github, linkedin, 
      
      // New profile fields
      studentId, rollNumber, admissionNo, emisNo, firstName, lastName, phone, gender,
      batch, semester, year, admissionDate, admissionType, feeStatus, status,
      alternatePhone, dateOfBirth, bloodGroup, nationality, religion, category, motherTongue, aadharNo, residenceType,
      address, parentInfo, references, previousEdu, scholarships, documents
    } = body;

    if (name !== undefined && name.trim() === "") {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }

    // 1. Update Base User Table
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(skills !== undefined && { skills: Array.isArray(skills) ? skills.join(",") : skills.trim() }),
        ...(github !== undefined && { github: github.trim() }),
        ...(linkedin !== undefined && { linkedin: linkedin.trim() })
      }
    });

    // 2. Upsert Student Profile Table
    const updatedProfile = await db.studentProfile.upsert({
      where: { userId },
      update: {
        studentId, rollNumber, admissionNo, emisNo, firstName, lastName, phone, gender,
        batch, semester, year, 
        admissionDate: admissionDate ? new Date(admissionDate) : null, 
        admissionType, feeStatus, status,
        alternatePhone, 
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodGroup, nationality, religion, category, motherTongue, aadharNo, residenceType,
        address: address ? JSON.stringify(address) : null,
        parentInfo: parentInfo ? JSON.stringify(parentInfo) : null,
        references: references ? JSON.stringify(references) : null,
        previousEdu: previousEdu ? JSON.stringify(previousEdu) : null,
        scholarships: scholarships ? JSON.stringify(scholarships) : null,
        documents: documents ? JSON.stringify(documents) : null,
      },
      create: {
        userId,
        studentId, rollNumber, admissionNo, emisNo, firstName, lastName, phone, gender,
        batch, semester, year, 
        admissionDate: admissionDate ? new Date(admissionDate) : null, 
        admissionType, feeStatus, status,
        alternatePhone, 
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        bloodGroup, nationality, religion, category, motherTongue, aadharNo, residenceType,
        address: address ? JSON.stringify(address) : null,
        parentInfo: parentInfo ? JSON.stringify(parentInfo) : null,
        references: references ? JSON.stringify(references) : null,
        previousEdu: previousEdu ? JSON.stringify(previousEdu) : null,
        scholarships: scholarships ? JSON.stringify(scholarships) : null,
        documents: documents ? JSON.stringify(documents) : null,
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        name: updatedUser.name,
        bio: updatedUser.bio,
        skills: updatedUser.skills ? updatedUser.skills.split(",") : [],
        github: updatedUser.github,
        linkedin: updatedUser.linkedin,
        studentProfile: updatedProfile
      }
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json({ error: "Failed to update profile info" }, { status: 500 });
  }
}
