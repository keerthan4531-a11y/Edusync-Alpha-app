import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateResponse, type INIXAMessage } from "@/lib/inixa-ai";

/**
 * AI Chat endpoint — now powered by the new Smart Router
 * Maintains backward compatibility with the existing API shape
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, history, mode, model, stage, feature } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const chatMode = mode || "general";

    let systemPrompt = "";
    if (chatMode === "grammar") {
      systemPrompt = "You are a strict and helpful English grammar tutor. Analyze the user's input. Correct any grammatical, spelling, or punctuation errors. Explain the grammar rule in 2 sentences. Give a corrected version of the user's sentence.";
    } else if (chatMode === "conversation") {
      systemPrompt = "You are a friendly English conversation partner. Respond to the student's message with a short, conversational response, and ask one simple follow-up question to keep the chat going. Keep your grammar simple and correct.";
    } else if (chatMode === "pronunciation") {
      systemPrompt = "You are an English pronunciation trainer. Give phonetic spellings (IPA) for key words in the student's message and brief tips on how to pronounce them clearly.";
    } else {
      systemPrompt = "You are a helpful English learning tutor and language coach. Give constructive, encouraging feedback, correct minor errors, and keep responses brief (under 4 sentences).";
    }

    const messages: INIXAMessage[] = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      }
    }
    messages.push({ role: 'user', content: message });

    // Use unified generateResponse with database-driven configurations & automatic 5-fallback chain
    const result = await generateResponse(
      messages,
      {
        stage: stage || 'stage-1',
        feature: feature || 'chat',
        role: session.user.role || 'STUDENT',
        userId: session.user.id,
      }
    );

    return NextResponse.json({
      success: result.success,
      response: result.response,
      modelUsed: result.modelUsed, // User sees "INIXA Nova" or "INIXA Flash Pro"
    });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
