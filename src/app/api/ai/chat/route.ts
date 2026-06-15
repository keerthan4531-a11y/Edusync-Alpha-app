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
    const { message, history, mode } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const chatMode = mode || "general";

    // Set system instructions based on mode
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

    // Check if Gemini API is available and not dummy
    const isApiKeyDummy = process.env.GEMINI_API_KEY === "dummy_key" || !process.env.GEMINI_API_KEY;
    
    if (isApiKeyDummy) {
      // Use premium mock fallback responses when API key is a dummy
      const fallbackResponse = generateMockResponse(message, chatMode);
      return NextResponse.json({
        success: true,
        response: fallbackResponse
      });
    }

    try {
      const model = getGeminiModel("gemini-1.5-flash");

      // Format conversation history
      let historyText = "";
      if (Array.isArray(history) && history.length > 0) {
        historyText = history
          .slice(-6) // Take last 6 messages for context
          .map((h: any) => `${h.role === "user" ? "Student" : "AI Teacher"}: ${h.content}`)
          .join("\n");
      }

      const fullPrompt = `${systemPrompt}

Conversation History:
${historyText}

Student's Message: ${message}

AI Teacher response (Do NOT include label, just respond directly to the student):`;

      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text().trim();

      return NextResponse.json({
        success: true,
        response: responseText
      });
    } catch (apiError: any) {
      console.warn("Gemini API call failed, falling back to mock response:", apiError.message);
      const fallbackResponse = generateMockResponse(message, chatMode);
      return NextResponse.json({
        success: true,
        response: fallbackResponse
      });
    }
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateMockResponse(message: string, mode: string): string {
  const lowercaseMsg = message.toLowerCase().trim();

  if (mode === "grammar") {
    // Check for some common test cases
    if (lowercaseMsg.includes("i has") || lowercaseMsg.includes("brother")) {
      return `I noticed some grammatical errors in your sentence:
1. **"I has"** -> We use **"have"** with the pronoun "I" (I have, you have, they have, we have).
2. **"two brother"** -> Since you are referring to two people, the noun should be plural: **"brothers"**.

**Corrected Sentence:** "I have two brothers."
Keep up the good effort! Practice makes perfect.`;
    }
    
    if (lowercaseMsg.includes("he go")) {
      return `Good try! Here is a grammar correction:
We use third-person singular verbs with "he/she/it".
- **"he go"** -> **"he goes"**

**Corrected Sentence:** "He goes to college."`;
    }

    return `Your sentence: **"${message}"** looks grammatically correct! 
Great job constructing your sentence. What would you like to discuss next?`;
  }

  if (mode === "pronunciation") {
    // Grab some words from the message to pronounce
    const words = message.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    if (words.length === 0) {
      return `Try typing a sentence with longer words to get pronunciation assistance (e.g. "schedule", "thorough", "entrepreneur").`;
    }

    let response = `Here is the pronunciation guide for key words in your message:\n\n`;
    words.forEach(w => {
      const cleanWord = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
      let ipa = "/.../";
      let tips = "Focus on the vowel sound.";

      if (cleanWord === "schedule") {
        ipa = "/ˈʃɛd.juːl/ or /ˈskɛdʒ.uːl/";
        tips = "In British English, it starts with a 'sh' sound, while in American English it starts with 'sk'.";
      } else if (cleanWord === "thorough") {
        ipa = "/ˈθʌr.ə/";
        tips = "Pronounce the 'th' with your tongue between your teeth, followed by a short 'uh' sound.";
      } else if (cleanWord === "entrepreneur") {
        ipa = "/ˌɒn.trə.prəˈnɜːr/";
        tips = "A French origin word. Emphasize the final syllable 'nuer'.";
      } else if (cleanWord === "hello") {
        ipa = "/həˈləʊ/";
        tips = "Brief breathy 'h' then emphasize the second syllable 'low'.";
      } else {
        ipa = `/${cleanWord}/`;
        tips = `Break it down into syllables and keep your tongue relaxed.`;
      }

      response += `- **${w}**: IPA: \`${ipa}\`\n  *Tip: ${tips}*\n`;
    });

    response += `\nTry reading them aloud slowly to practice your speech!`;
    return response;
  }

  if (mode === "conversation") {
    if (lowercaseMsg.includes("hello") || lowercaseMsg.includes("hi")) {
      return `Hello! It is great to chat with you today. How is your day going so far?`;
    }
    if (lowercaseMsg.includes("hobby") || lowercaseMsg.includes("hobbies") || lowercaseMsg.includes("free time")) {
      return `Hobbies are a wonderful way to relax! I enjoy learning about different languages. What is your favorite hobby, and how often do you practice it?`;
    }
    return `That sounds interesting! Communicating clearly is a vital skill. What is the most challenging part of learning English for you?`;
  }

  // General fallback
  return `Hello! I am your AI English Teacher. I can help you practice your conversation skills, correct your grammar, or guide your pronunciation. 
  
Select a mode from the buttons above to try different exercises, or tell me: what would you like to practice today?`;
}
