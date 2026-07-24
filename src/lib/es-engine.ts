import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ESMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_TIMEOUT = 25000; // 25 seconds timeout
const WORKER_API_BASE = "https://curly-hill-3303.aegonat29.workers.dev/v1/chat/completions";

function isHtml(text: string): boolean {
  const t = text.trim();
  return (
    t.startsWith("<!DOCTYPE") ||
    t.startsWith("<html") ||
    t.startsWith("<div") ||
    t.includes("<script") ||
    t.includes("window.location")
  );
}

function isValidResponse(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    !t.includes("sorry, ai servers are busy") &&
    !t.includes("please try again later") &&
    !t.includes("rate limit") &&
    !t.includes("too many requests") &&
    !t.includes("bad gateway") &&
    !t.includes("queue full") &&
    !t.includes("internal server error")
  );
}

// Try Direct Gemini API using GEMINI_API_KEY
async function tryDirectGemini(messages: ESMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    console.log("🌐 [ES-ENGINE] Trying direct Gemini API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemMsg = messages.find(m => m.role === "system")?.content || "";
    const userMsgs = messages.filter(m => m.role !== "system");

    const promptText = systemMsg 
      ? `${systemMsg}\n\n${userMsgs.map(m => m.content).join("\n\n")}`
      : userMsgs.map(m => m.content).join("\n\n");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const result = await model.generateContent(promptText);
    clearTimeout(timeoutId);

    const text = result.response.text();
    if (text && isValidResponse(text) && !isHtml(text)) {
      console.log("✅ [ES-ENGINE] Direct Gemini API succeeded!");
      return text.trim();
    }
  } catch (e: any) {
    console.warn(`[ES-ENGINE] Direct Gemini API failed: ${e.message || e}`);
  }
  return null;
}

// Custom Cloudflare Worker
async function tryWorker(messages: ESMessage[]): Promise<string | null> {
  console.log("🌐 [ES-ENGINE] Sending request to Custom Worker...");
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const res = await fetch(WORKER_API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        model: "gpt-4o-mini",
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status !== 200) {
      console.warn(`[Worker] HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    let content = "";
    
    if (data.choices?.[0]?.message?.content) {
      content = data.choices[0].message.content;
    } else if (typeof data === "string") {
      content = data;
    } else if (data.response) {
      content = data.response;
    } else {
      content = JSON.stringify(data);
    }

    if (!content || isHtml(content) || !isValidResponse(content)) {
      console.warn("[Worker] Invalid response or HTML received.");
      return null;
    }

    console.log("✅ [ES-ENGINE] Custom Worker succeeded!");
    return content.trim();
  } catch (e: any) {
    console.warn(`[Worker] Error: ${e.message || e}`);
    return null;
  }
}

// Main chat function
export async function esChat(messages: ESMessage[]): Promise<string> {
  // 1. Try Direct Gemini API first
  const directResult = await tryDirectGemini(messages);
  if (directResult && !directResult.includes("⚠️")) {
    return directResult;
  }

  // 2. Try Worker API second
  const workerResult = await tryWorker(messages);
  if (workerResult && !workerResult.includes("⚠️")) {
    return workerResult;
  }
  
  throw new Error("Custom AI Worker failed or returned invalid response.");
}
