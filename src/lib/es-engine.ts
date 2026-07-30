export interface ESMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_TIMEOUT = 30000; // 30 seconds timeout
const WORKER_API_BASE = "https://ultimate-ai-worker.haruyhari930.workers.dev/v1/chat/completions";
const MODEL_NAME = "surfsense/gpt-5.4-mini-no-login";

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

function parseWorkerResponse(rawText: string): string {
  const text = rawText.trim();
  if (!text) return "";

  // 1. Standard JSON object
  if (text.startsWith("{")) {
    try {
      const data = JSON.parse(text);
      if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
      if (data.choices?.[0]?.delta?.content) return data.choices[0].delta.content;
      if (data.response) return data.response;
      if (data.output) return data.output;
    } catch {}
  }

  // 2. Server-Sent Events (SSE) lines ("data: {...}")
  let accumulatedContent = "";
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("data:")) {
      const jsonStr = trimmed.replace(/^data:\s*/, "").trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const chunk = JSON.parse(jsonStr);
        const delta = chunk.choices?.[0]?.delta?.content || chunk.choices?.[0]?.message?.content || "";
        if (delta) accumulatedContent += delta;
      } catch {}
    }
  }

  if (accumulatedContent) {
    return accumulatedContent;
  }

  // 3. Fallback raw text if not HTML
  return isHtml(text) ? "" : text;
}

// Custom Cloudflare Worker Request
async function tryWorker(messages: ESMessage[], retries = 2): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`🌐 [ES-ENGINE] Sending AI request to Worker (Attempt ${attempt}/${retries})...`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

      const res = await fetch(WORKER_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/event-stream",
        },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          model: MODEL_NAME,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.status !== 200) {
        console.warn(`[Worker] HTTP ${res.status} on attempt ${attempt}`);
        if (attempt < retries) continue;
        return null;
      }

      const rawText = await res.text();
      const content = parseWorkerResponse(rawText);

      if (!content || isHtml(content) || !isValidResponse(content)) {
        console.warn(`[Worker] Invalid response or HTML received on attempt ${attempt}`);
        if (attempt < retries) continue;
        return null;
      }

      console.log("✅ [ES-ENGINE] Custom AI Worker succeeded!");
      return content.trim();
    } catch (e: any) {
      console.warn(`[Worker] Error on attempt ${attempt}: ${e.message || e}`);
      if (attempt < retries) continue;
      return null;
    }
  }
  return null;
}

// Main chat function used across all API routes
export async function esChat(messages: ESMessage[]): Promise<string> {
  const workerResult = await tryWorker(messages);
  if (workerResult && !workerResult.includes("⚠️")) {
    return workerResult;
  }
  
  throw new Error("Custom AI Worker failed or returned invalid response.");
}
