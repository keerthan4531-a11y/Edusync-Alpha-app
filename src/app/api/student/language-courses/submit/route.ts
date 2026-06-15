import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runJudge0Batch } from "@/lib/judge0";
import { getGeminiModel } from "@/lib/gemini-client";
import { db } from "@/lib/db";
import { awardXp } from "@/lib/gamification";

const LANGUAGE_ID_MAP: Record<string, string> = {
  c: "50",
  cpp: "54",
  python: "71",
  javascript: "63",
  java: "62"
};

async function getCodeReview(code: string, language: string, moduleId: string) {
  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const prompt = `You are a strict, professional developer reviewing a student's code.
    Language: ${language}
    Module ID: ${moduleId}
    
    Student's Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Evaluate the student's code on correctness, logic, clean code standards, and style.
    Return your response as a valid JSON object ONLY. Do NOT wrap it in markdown blockquotes like \`\`\`json.
    {
        "score": integer (0-100),
        "feedback": "Two sentences of constructive feedback in English",
        "tamilFeedback": "Detailed code review and style tips in Tamil"
    }`;
    
    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Gemini code review failed:", e);
    return {
      score: 75,
      feedback: "Code compiled successfully. Well done!",
      tamilFeedback: "நிரல் வெற்றிகரமாக இயங்கியது. நன்று!"
    };
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { language, code, module_id } = await req.json();
    if (!language || !code || !module_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const langLower = language.toLowerCase();
    const languageId = LANGUAGE_ID_MAP[langLower] || "71";

    // 1. Compile & Execute
    const judgeResult = await runJudge0Batch(code, languageId, [{ input: "", output: "" }]);
    const execSuccess = judgeResult.success && judgeResult.result[0]?.status?.id === 3;
    const output = judgeResult.success ? judgeResult.result[0]?.stdout || "" : "";
    const errorText = judgeResult.success ? judgeResult.result[0]?.stderr || judgeResult.result[0]?.compile_output || "" : "Execution failed";

    // 2. Perform AI review
    const review = await getCodeReview(code, language, module_id);
    const score = execSuccess ? Math.max(0, Math.min(100, review.score || 0)) : 0;
    const passed = score >= 70;

    let creditsAwarded = 0;
    if (passed) {
      creditsAwarded = Math.floor(score / 10);
      
      // Award XP (Credits * 10 XP)
      await awardXp(userId, creditsAwarded * 10, `Completed language course ${language} module ${module_id}`);

      // Update user credits
      await db.user.update({
        where: { id: userId },
        data: {
          coins: { increment: creditsAwarded } // Award coins as credits
        }
      });

      // Update Language Course Progress
      const langUpper = language.toUpperCase();
      await db.languageCourseProgress.upsert({
        where: {
          userId_language: {
            userId,
            language: langUpper
          }
        },
        update: {
          completedExercises: { increment: 1 },
          totalCredits: { increment: creditsAwarded }
        },
        create: {
          userId,
          language: langUpper,
          completedExercises: 1,
          totalCredits: creditsAwarded
        }
      });
    }

    return NextResponse.json({
      success: true,
      passed,
      score,
      ai_feedback: review.feedback + " " + review.tamilFeedback,
      output,
      error: errorText
    });
  } catch (error) {
    console.error("Failed to submit language course solution:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
