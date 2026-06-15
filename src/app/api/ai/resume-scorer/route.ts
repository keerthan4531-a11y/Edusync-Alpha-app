import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We might receive formData with a file, or just JSON if testing
    // For now we just mock the response
    
    // TODO: AI INTEGRATION POINT
    // Read the uploaded PDF/text, send to Gemini to parse and evaluate 
    // against standard ATS (Applicant Tracking System) rules.

    const mockScore = 78;
    const xpAwarded = 50;

    await db.stage4Activity.create({
      data: {
        userId: session.user.id,
        type: "RESUME_SCORE",
        score: mockScore,
        xpAwarded,
        feedback: JSON.stringify({
          recommendations: ["Add more quantifiable metrics", "Include a link to your GitHub profile"],
          strengths: ["Clean formatting", "Relevant skills section"],
          weaknesses: ["Missing contact info", "Descriptions are too brief"]
        })
      }
    });

    await awardXp(session.user.id, xpAwarded, "Resume Evaluation");

    return NextResponse.json({
      score: mockScore,
      recommendations: ["Add more quantifiable metrics to your project descriptions (e.g., 'improved performance by 20%')", "Include a link to your GitHub profile or live project demos"],
      strengths: ["Clean formatting", "Relevant skills section matches target roles"],
      weaknesses: ["Descriptions are too brief in the experience section", "Missing a summary objective"],
      xpAwarded
    });

  } catch (error: any) {
    console.error("Resume scorer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
