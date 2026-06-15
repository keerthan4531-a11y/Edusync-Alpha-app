import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGeminiModel } from "@/lib/gemini-client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, history, character } = body;

    if (!message || !message.trim() || !character) {
      return NextResponse.json({ error: "Missing message or character" }, { status: 400 });
    }

    let systemPrompt = "";
    if (character === "interviewer") {
      systemPrompt = "You are a professional HR Job Interviewer at a tech company. Ask standard behavioral and career questions, briefly acknowledge the candidate's answer, and ask one follow-up question. Respond in 2-3 sentences.";
    } else if (character === "clerk") {
      systemPrompt = "You are a polite hotel front desk receptionist helping a guest check in. Respond to the customer's query and ask a clarifying question about their booking details or ID.";
    } else if (character === "professor") {
      systemPrompt = "You are a friendly but academic university professor advising a student. Ask about their research project interests or check-in on their study progress.";
    } else {
      systemPrompt = "You are a helpful roleplay conversation partner.";
    }

    // Check if Gemini API is dummy
    const isApiKeyDummy = process.env.GEMINI_API_KEY === "dummy_key" || !process.env.GEMINI_API_KEY;

    if (isApiKeyDummy) {
      const mockReply = getMockRoleplayReply(message, character);
      return NextResponse.json({ success: true, response: mockReply });
    }

    try {
      const model = getGeminiModel("gemini-1.5-flash");

      let historyText = "";
      if (Array.isArray(history) && history.length > 0) {
        historyText = history
          .slice(-6)
          .map((h: any) => `${h.role === "user" ? "Candidate" : "Interviewer"}: ${h.content}`)
          .join("\n");
      }

      const fullPrompt = `${systemPrompt}

Roleplay Session History:
${historyText}

Guest/Student/Candidate message: ${message}

AI Roleplay response (Respond directly to the user in character, under 3 sentences):`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text().trim();

      return NextResponse.json({ success: true, response: responseText });
    } catch (apiError: any) {
      console.warn("Roleplay API failed, falling back to mock reply:", apiError.message);
      const mockReply = getMockRoleplayReply(message, character);
      return NextResponse.json({ success: true, response: mockReply });
    }
  } catch (error: any) {
    console.error("AI Roleplay route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getMockRoleplayReply(message: string, character: string): string {
  const lowercase = message.toLowerCase();

  if (character === "interviewer") {
    if (lowercase.includes("hello") || lowercase.includes("hi")) {
      return "Hello! Welcome to the interview. To start, could you please introduce yourself and highlight your key programming strengths?";
    }
    if (lowercase.includes("react") || lowercase.includes("javascript") || lowercase.includes("developer")) {
      return "Excellent! Having strong frontend experience is highly valuable. Can you describe a challenging bug you faced in a React project and how you debugged it?";
    }
    return "Thank you for sharing that. How do you handle work pressure and prioritize tasks when faced with tight deadlines?";
  }

  if (character === "clerk") {
    if (lowercase.includes("hello") || lowercase.includes("hi") || lowercase.includes("check in")) {
      return "Welcome to Grand Plaza Resort! I would be delighted to help you check in today. Do you have a reservation under your name, or are you looking to book a new room?";
    }
    if (lowercase.includes("booking") || lowercase.includes("reserve") || lowercase.includes("name")) {
      return "Perfect, I see your reservation right here. May I please see your ID card and a credit card for incidental charges to complete the check-in?";
    }
    return "Certainly! I have updated that in our system. Your room number is 402 on the fourth floor. Here is your keycard. Is there anything else I can assist you with?";
  }

  if (character === "professor") {
    if (lowercase.includes("hello") || lowercase.includes("professor") || lowercase.includes("hi")) {
      return "Hello! Please, take a seat. What brings you to my office today? Are you looking for guidance on your research proposal or coursework studies?";
    }
    if (lowercase.includes("project") || lowercase.includes("research") || lowercase.includes("thesis")) {
      return "Fascinating! Researching AI learning pathways is a highly relevant area. What core methodologies are you planning to utilize to gather your experiment data?";
    }
    return "That sounds like a solid academic foundation. I suggest you draft a two-page summary outlining your timeline and submit it to me by next Friday. How does that sound?";
  }

  return "I understand. Let's continue our roleplay discussion. What are your thoughts on this scenario?";
}
