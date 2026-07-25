import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJsonParse<T>(text: string): T | null {
  if (!text) return null
  try {
    return JSON.parse(text) as T
  } catch {
    let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim()
    try {
      return JSON.parse(cleaned) as T
    } catch {
      const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
      if (match) {
        try {
          return JSON.parse(match[1]) as T
        } catch {
          return null
        }
      }
    }
  }
  return null
}

