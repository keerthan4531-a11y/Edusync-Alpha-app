import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { esChat, ESMessage } from "@/lib/es-engine";

export async function POST(req: Request) {
  try {
    try {
      const session = await getServerSession(authOptions);
      // Optional session check without blocking
    } catch {}

    const { message, history } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const systemPrompt = `You are a friendly, encouraging personal AI English Teacher on EduSync.
Your goal is to converse naturally with the student in clear, natural English.
Help them practice speaking and writing. If they make grammar or spelling mistakes, gently point out corrections in a friendly manner. Keep your answers engaging, helpful, and concise (2-4 sentences max).`;

    const messages: ESMessage[] = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-10).map((h: any) => ({
        role: (h.role === "model" ? "assistant" : "user") as "assistant" | "user",
        content: String(h.content || "")
      })) : []),
      { role: "user", content: String(message) }
    ];

    let aiResponse = "";
    try {
      aiResponse = await esChat(messages);
    } catch (err) {
      console.warn("esChat call failed in ai-chat route:", err);
    }

    if (!aiResponse) {
      aiResponse = "That's very interesting! Tell me more about that, or feel free to ask me any questions about English grammar or vocabulary.";
    }

    return NextResponse.json({ response: aiResponse });
  } catch (error: any) {
    console.error("AI Chat API Route Error:", error);
    return NextResponse.json({
      response: "I'm right here to help you practice English! Could you please repeat that?"
    });
  }
}
