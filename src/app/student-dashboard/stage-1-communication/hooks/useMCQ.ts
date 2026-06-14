import { useState } from "react";
import { Stage1ContentDTO, EvaluateResponse } from "@/types/communication";

export function useMCQ(content: Stage1ContentDTO | null) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitAnswers = async () => {
    if (!content || !content.questions) return;
    
    // Check if all questions are answered
    if (Object.keys(answers).length < content.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        contentId: content.id,
        answers: Object.entries(answers).map(([qId, index]) => ({
          questionId: parseInt(qId),
          answerIndex: index,
        })),
      };

      const res = await fetch("/api/communication/evaluate-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answers");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  return {
    answers,
    handleOptionSelect,
    submitAnswers,
    isSubmitting,
    result,
    error,
    reset,
  };
}
