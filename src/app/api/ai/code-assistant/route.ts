import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { codeReviewRequestSchema, ideaGenRequestSchema } from "@/schemas/ai-assistant";
import { performCodeReview, getArchitectureSuggestions, generateProjectIdeas } from "@/lib/ai-assistant-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const mode = body.mode; // "code-review", "architecture", "idea-gen"

    if (!mode) {
      return NextResponse.json({ error: "Mode is required" }, { status: 400 });
    }

    let result;

    if (mode === "code-review") {
      const validated = codeReviewRequestSchema.parse(body.data);
      result = await performCodeReview(validated.fileContent, validated.language, validated.fileName, session.user.id, session.user.role);
    } else if (mode === "architecture") {
      // In a real app, this would take the whole project context (e.g. file tree stringified)
      result = await getArchitectureSuggestions(body.data?.projectContext || "", session.user.id, session.user.role);
    } else if (mode === "idea-gen") {
      const validated = ideaGenRequestSchema.parse(body.data || {});
      result = await generateProjectIdeas(validated.problemStatementId, validated.currentIdea, session.user.id, session.user.role);
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 400 });
  }
}
