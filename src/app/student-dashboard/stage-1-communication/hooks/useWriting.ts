import { useState } from "react";
import { Stage1ContentDTO } from "@/types/communication";

export function useWriting(content: Stage1ContentDTO | null) {
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const submitWriting = async () => {
    if (!content) return;
    
    if (submissionText.trim().length < 5) {
      setError("Please write a longer response before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        contentId: content.id,
        submissionText: submissionText.trim()
      };

      const res = await fetch("/api/communication/writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to evaluate writing");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSubmissionText("");
    setResult(null);
    setError(null);
  };

  return {
    submissionText,
    setSubmissionText,
    submitWriting,
    isSubmitting,
    result,
    error,
    reset,
  };
}
