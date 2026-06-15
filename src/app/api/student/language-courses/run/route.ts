import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runJudge0Batch } from "@/lib/judge0";
import { getGeminiModel } from "@/lib/gemini-client";

// Map languages to Judge0 language IDs
const LANGUAGE_ID_MAP: Record<string, string> = {
  c: "50",
  cpp: "54",
  python: "71",
  javascript: "63",
  java: "62"
};

async function getCodeHelp(code: string, error: string, language: string) {
  try {
    const model = getGeminiModel("gemini-1.5-flash");
    const prompt = `You are a helpful programming tutor.
    A student is writing code in ${language}.
    
    Student's Code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Compilation or Runtime Error:
    \`\`\`
    ${error}
    \`\`\`
    
    Explain the error in simple terms and provide a short, helpful hint or suggestion on how to fix it in Tamil/English mix (Tanglish/colloquial Tamil). Do NOT write the completed corrected code for them. Keep it brief.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Gemini code help failed:", e);
    return "Check your syntax and variable types.";
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { language, code, module_id } = await req.json();
    if (!language || !code) {
      return NextResponse.json({ error: "Language and code are required" }, { status: 400 });
    }

    const langLower = language.toLowerCase();
    const languageId = LANGUAGE_ID_MAP[langLower] || "71"; // Default to Python if unknown

    // Run against a simple empty test case to execute code
    const judgeResult = await runJudge0Batch(code, languageId, [{ input: "", output: "" }]);

    if (!judgeResult.success) {
      const errorText = typeof judgeResult.result === "string" ? judgeResult.result : "Compilation/Sandbox execution error";
      const aiHint = await getCodeHelp(code, errorText, language);
      return NextResponse.json({
        success: false,
        output: "",
        error: errorText,
        ai_hint: aiHint
      });
    }

    const runResult = judgeResult.result[0];
    const isSuccess = runResult?.status?.id === 3; // 3 means Accepted/Passed
    const output = runResult?.stdout || "";
    const errorText = runResult?.stderr || runResult?.compile_output || "";

    let aiHint = "";
    if (!isSuccess && errorText) {
      aiHint = await getCodeHelp(code, errorText, language);
    }

    return NextResponse.json({
      success: isSuccess,
      output: output,
      error: errorText,
      ai_hint: aiHint
    });
  } catch (error) {
    console.error("Failed to run course code:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
