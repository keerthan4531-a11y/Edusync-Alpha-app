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

    const systemPrompt = `You are an expert HR assistant. Generate 5 realistic, entry-level software engineering and tech job postings.
You MUST return ONLY a valid JSON array of objects. Do not wrap it in markdown.
Schema for each object:
{
  "id": "unique string like job-1",
  "title": "Job title",
  "company": "Company name",
  "location": "City, Country or Remote",
  "salary": "Salary range string",
  "type": "Full-time or Internship",
  "matchScore": integer between 70 and 99,
  "requirements": ["3 key requirements strings"]
}`;

    const messages: INIXAMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate jobs." }
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

    let jobs = [];
    try {
      const cleanJson = aiRes.response.replace(/```json|```/gi, "").trim();
      jobs = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse AI jobs:", aiRes.response);
      // Fallback
      jobs = [
        { id: "fallback-1", title: "Frontend Developer", company: "TechCorp", location: "Remote", salary: "$70k - $90k", type: "Full-time", matchScore: 85, requirements: ["React", "TypeScript"] }
      ];
    }

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Jobs generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
