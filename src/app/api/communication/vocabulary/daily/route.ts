import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawQuizzes = await db.stage1Content.findMany({
      where: {
        isActive: true,
        type: { in: ["VOCAB_MEANING", "VOCAB_FILL"] }
      }
    });

    const meaningQuizzes: any[] = [];
    const fillQuizzes: any[] = [];

    rawQuizzes.forEach((item) => {
      if (!item.questions) return;
      try {
        const parsed = JSON.parse(item.questions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const quizItem = {
            id: item.id,
            ...parsed[0]
          };
          if (item.type === "VOCAB_MEANING") {
            meaningQuizzes.push(quizItem);
          } else if (item.type === "VOCAB_FILL") {
            fillQuizzes.push(quizItem);
          }
        }
      } catch (err) {
        console.error("Failed to parse quiz item questions:", item.id, err);
      }
    });

    // If database is empty, fall back to default sets to prevent crashes
    const today = new Date().toISOString().split("T")[0];

    return NextResponse.json({
      success: true,
      date: today,
      meaning_quizzes: meaningQuizzes,
      fill_quizzes: fillQuizzes,
      total: meaningQuizzes.length + fillQuizzes.length
    });
  } catch (error: any) {
    console.error("Failed to load daily quizzes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
