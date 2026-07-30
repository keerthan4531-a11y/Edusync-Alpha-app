import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJsonParse<T>(text: string): T | null {
  if (!text) return null
  
  // 1. Clean markdown formatting
  let cleaned = text
    .replace(/^```json\s*/gi, "")
    .replace(/^```\s*/gi, "")
    .replace(/\s*```$/gi, "")
    .trim()
  
  // 2. Direct parse attempt
  try {
    return JSON.parse(cleaned) as T
  } catch {}

  // 3. Extract JSON object {...} or array [...]
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (match) {
    const jsonCandidate = match[1]
    
    // Direct candidate attempt
    try {
      return JSON.parse(jsonCandidate) as T
    } catch {}

    // Fix trailing commas & control chars
    try {
      const sanitized = jsonCandidate
        .replace(/,\s*([\}\]])/g, "$1") // Remove trailing commas
        .replace(/\n/g, "\\n")         // Escape unescaped newlines inside strings
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t")
      return JSON.parse(sanitized) as T
    } catch {}
  }

  return null
}
