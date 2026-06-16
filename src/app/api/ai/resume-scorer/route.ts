import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { filename } = body;

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser and resume grader. Evaluate the candidate's resume based on the file name: "${filename || 'resume.pdf'}". Generate constructive suggestions and score the resume.
You MUST return ONLY a raw JSON block containing ATS score and feedback. Do not write any other text. Follow this schema:
{
  "score": <number between 60 and 95>,
  "recommendations": ["list of 2 recommendations"],
  "strengths": ["list of 2 strengths"],
  "weaknesses": ["list of 2 weaknesses"]
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please score this resume: ${filename || 'resume.pdf'}` }
    ];

    const aiRes = await generateResponse(
      messages,
      {
        stage: "stage-4",
        feature: "resume-scorer",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let evaluation = {
      score: 75,
      recommendations: ["Add more quantitative metrics", "Structure key accomplishments"],
      strengths: ["Clear layout and readable formatting", "Relevant skills list"],
      weaknesses: ["Brief project descriptions", "Lacks summary section"]
    };

    try {
      const parsed = JSON.parse(aiRes.response.trim());
      if (parsed && typeof parsed.score === 'number') {
        evaluation = parsed;
      }
    } catch (e) {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      try {
        const parsed = JSON.parse(cleanJson);
        if (parsed && typeof parsed.score === 'number') {
          evaluation = parsed;
        }
      } catch {}
    }

    const xpAwarded = Math.round(evaluation.score / 2);

    await db.stage4Activity.create({
      data: {
        userId: session.user.id,
        type: "RESUME_SCORE",
        score: evaluation.score,
        xpAwarded,
        feedback: JSON.stringify({
          recommendations: evaluation.recommendations,
          strengths: evaluation.strengths,
          weaknesses: evaluation.weaknesses
        })
      }
    });

    await awardXp(session.user.id, xpAwarded, "Resume Evaluation");

    return NextResponse.json({
      score: evaluation.score,
      recommendations: evaluation.recommendations,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      xpAwarded
    });

  } catch (error: any) {
    console.error("Resume scorer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
