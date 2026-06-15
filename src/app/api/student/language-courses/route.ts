import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const progresses = await db.languageCourseProgress.findMany({
      where: { userId }
    });

    const responseData = {
      C: progresses.find(p => p.language === "C") || { completedExercises: 0, totalCredits: 0, currentStreak: 0 },
      CPP: progresses.find(p => p.language === "CPP") || { completedExercises: 0, totalCredits: 0, currentStreak: 0 },
      PYTHON: progresses.find(p => p.language === "PYTHON") || { completedExercises: 0, totalCredits: 0, currentStreak: 0 }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Failed to fetch course progresses:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}
