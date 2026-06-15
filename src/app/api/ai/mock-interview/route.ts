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

    const body = await req.json();
    const { action, transcript, sessionId } = body;

    // TODO: AI INTEGRATION POINT
    // Real implementation would pass the transcript to Gemini to evaluate the answer
    // and generate the next interview question based on the role/context.

    if (action === "evaluate_final") {
      // Return a final evaluation mock
      const mockScore = 85;
      const xpAwarded = 100;
      
      await db.stage4Activity.create({
        data: {
          userId: session.user.id,
          type: "MOCK_INTERVIEW",
          score: mockScore,
          xpAwarded,
          feedback: JSON.stringify({
            strengths: ["Clear communication", "Good technical vocabulary"],
            areasForImprovement: ["Provide more concrete examples", "Speak slightly slower"]
          })
        }
      });

      await awardXp(session.user.id, xpAwarded, "Mock Interview Completion");

      return NextResponse.json({
        evaluation: {
          score: mockScore,
          feedback: "Great job! You demonstrated a solid understanding of the core concepts. You communicated clearly and used appropriate technical terminology.",
          strengths: ["Clear communication", "Good technical vocabulary"],
          areasForImprovement: ["Provide more concrete examples", "Speak slightly slower"]
        },
        xpAwarded
      });
    }

    // Default: just generating the next question
    return NextResponse.json({
      nextQuestion: "That's a good answer. Now, could you explain a time when you had to resolve a complex bug under a tight deadline?",
      feedback: "Good response. Try to structure it using the STAR method next time."
    });

  } catch (error: any) {
    console.error("Mock interview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
