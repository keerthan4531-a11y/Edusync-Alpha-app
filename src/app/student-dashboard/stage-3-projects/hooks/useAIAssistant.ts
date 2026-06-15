import { useState } from "react";

type AIMode = "code-review" | "architecture" | "idea-gen";

export function useAIAssistant() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAI = async (mode: AIMode, data: any) => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/ai/code-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, data })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to call AI");
      
      setResponse(json.response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { requestAI, loading, response, error };
}
