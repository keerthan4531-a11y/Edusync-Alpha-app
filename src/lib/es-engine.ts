export interface ESMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_TIMEOUT = 10000; // 10 seconds timeout for fast response & fallback

// Primary: curly-hill ERNIE workers (reliable, standard JSON)
// ERINE-5.1 first — returns clean raw JSON (best for evaluation)
// smartMode second — sometimes wraps JSON in markdown fences
const PRIMARY_WORKER = "https://curly-hill-3303.aegonat29.workers.dev/v1/chat/completions";
const PRIMARY_MODELS = ["ERINE-5.1", "smartMode"];

// Fallback: ultimate-ai-worker (SSE stream format, may 403)
const FALLBACK_WORKER = "https://ultimate-ai-worker.haruyhari930.workers.dev/v1/chat/completions";
const FALLBACK_MODEL = "surfsense/gpt-5.4-mini-no-login";

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

/** Detect Chinese characters — ERNIE sometimes returns Chinese error messages */
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
}

function isValidResponse(text: string): boolean {
  if (!text) return false;

  // Reject Chinese error messages from ERNIE (Baidu model)
  if (containsChinese(text)) {
    console.warn("[ES-ENGINE] Rejected response containing Chinese characters");
    return false;
  }

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

/**
 * Strip markdown code fences from AI responses.
 * smartMode often returns: ```json\n{...}\n```
 * This extracts the raw content inside.
 */
function stripMarkdownFences(text: string): string {
  const trimmed = text.trim();
  // Match ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/^```(?:json|JSON)?\s*\n?([\s\S]*?)\n?\s*```$/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  return trimmed;
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

// Try a single worker endpoint with a specific model
async function tryEndpoint(
  url: string,
  model: string,
  messages: ESMessage[],
  label: string
): Promise<string | null> {
  console.log(`🌐 [ES-ENGINE] Trying ${label} (${model})...`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        model,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status !== 200) {
      console.warn(`[${label}] HTTP ${res.status}`);
      return null;
    }

    const rawText = await res.text();
    const content = parseWorkerResponse(rawText);

    if (!content || isHtml(content) || !isValidResponse(content)) {
      console.warn(`[${label}] Invalid or empty response`);
      return null;
    }

    // Strip markdown fences (smartMode wraps JSON in ```json ... ```)
    const cleaned = stripMarkdownFences(content.trim());

    console.log(`✅ [ES-ENGINE] ${label} (${model}) succeeded!`);
    return cleaned;
  } catch (e: any) {
    console.warn(`[${label}] Error: ${e.message || e}`);
    return null;
  }
}

// Main chat function used across all API routes
export async function esChat(messages: ESMessage[]): Promise<string> {
  // 1. Try primary curly-hill worker with each model
  for (const model of PRIMARY_MODELS) {
    const result = await tryEndpoint(PRIMARY_WORKER, model, messages, "curly-hill");
    if (result && !result.includes("⚠️")) {
      return result;
    }
  }

  // 2. Fallback to ultimate-ai-worker with gpt-5.4-mini
  const fallbackResult = await tryEndpoint(FALLBACK_WORKER, FALLBACK_MODEL, messages, "ultimate-ai-worker");
  if (fallbackResult && !fallbackResult.includes("⚠️")) {
    return fallbackResult;
  }

  throw new Error("All AI Workers failed or returned invalid responses.");
}
