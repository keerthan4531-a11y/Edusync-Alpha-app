import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming authOptions is exported from here or similar
import { evaluateMCQ } from "@/lib/communication-service";
import { evaluateRequestSchema } from "@/schemas/communication";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate input
    const parsedData = evaluateRequestSchema.parse(body);

    // Process logic via service
    const result = await evaluateMCQ(session.user.id, parsedData);

    return NextResponse.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: (error as any).errors, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }
    
    console.error("Evaluate MCQ Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
