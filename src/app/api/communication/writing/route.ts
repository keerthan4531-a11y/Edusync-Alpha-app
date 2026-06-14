import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { evaluateWriting } from "@/lib/ai-evaluation-service";
import { checkRateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

const writingRequestSchema = z.object({
  contentId: z.string().min(1, "Content ID is required"),
  submissionText: z.string().min(5, "Submission must be at least 5 characters long"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate Limiting (30s debounce)
    const rateLimit = checkRateLimit(userId, "writing", 30000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Please wait ${Math.ceil(rateLimit.remainingMs / 1000)}s before submitting again.`, code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsedData = writingRequestSchema.parse(body);

    const result = await evaluateWriting(userId, parsedData.contentId, parsedData.submissionText);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    
    console.error("Evaluate Writing Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
