import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const systemPrompt = `You are a data generator for a student leaderboard. Generate 5 fictional student profiles who are competing for jobs. The last user should be the current user "You".
You MUST return ONLY a valid JSON array of objects. Do not wrap it in markdown.
Schema for each object:
{
  "rank": integer,
  "name": "Student name",
  "score": integer between 700 and 1000,
  "mockScore": integer between 70 and 100,
  "projects": integer between 1 and 10,
  "status": "Placed", "Interviewing", or "Open to Work"
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Generate leaderboard including me (${session.user.name || "Student"}).` }
    ];

    const aiRes = await generateResponse(
      messages,
      {
        stage: "stage-4",
        feature: "idea-gen",
        role: session.user.role || "STUDENT",
        userId: session.user.id
      }
    );

    let leaderboard = [];
    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      leaderboard = JSON.parse(cleanJson);
    } catch (e) {
      // Fallback
      leaderboard = [
        { rank: 1, name: "AI Top Student", score: 990, mockScore: 98, projects: 5, status: "Placed" },
        { rank: 2, name: session.user.name || "You", score: 850, mockScore: 85, projects: 3, status: "Open to Work" }
      ];
    }

    return NextResponse.json(leaderboard);
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
