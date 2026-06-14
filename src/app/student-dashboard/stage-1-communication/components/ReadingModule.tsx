"use client";

import { Stage1ContentDTO } from "@/types/communication";
import { GlassCard } from "@/components/ui/glass-card";
import { useMCQ } from "../hooks/useMCQ";

interface ReadingModuleProps {
  content: Stage1ContentDTO | null;
  onNext: () => void;
}

export function ReadingModule({ content, onNext }: ReadingModuleProps) {
  const {
    answers,
    handleOptionSelect,
    submitAnswers,
    isSubmitting,
    result,
    error,
  } = useMCQ(content);

  if (!content) {
    return (
      <GlassCard className="p-8 text-center text-gray-400">
        No reading challenges available right now.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-stage1 mb-4">{content.title}</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed text-lg">{content.content}</p>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Comprehension Questions</h3>
        {content.questions?.map((q) => (
          <GlassCard key={q.id} className="p-5 border-stage1/20">
            <p className="text-white mb-4 font-medium">{q.question}</p>
            <div className="space-y-3">
              {q.options?.map((opt, idx) => {
                const isSelected = answers[q.id] === idx;
                const isSubmitted = result !== null;
                const isCorrect = isSubmitted && idx === q.correctIndex;
                const isWrongSelection = isSubmitted && isSelected && idx !== q.correctIndex;

                let btnClass = "border-white/10 hover:bg-white/5 text-gray-300";
                
                if (isSelected && !isSubmitted) {
                  btnClass = "border-stage1 bg-stage1/10 text-white";
                } else if (isCorrect) {
                  btnClass = "border-green-500 bg-green-500/10 text-green-400";
                } else if (isWrongSelection) {
                  btnClass = "border-red-500 bg-red-500/10 text-red-400";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isSubmitted && handleOptionSelect(q.id, idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>

      {error && (
        <div className="text-red-400 text-sm font-medium">{error}</div>
      )}

      {result ? (
        <GlassCard className="p-6 border-stage1 bg-stage1/5">
          <h3 className="text-xl font-bold text-white mb-2">Results</h3>
          <p className="text-gray-300 mb-2">{result.feedback}</p>
          {result.tamilFeedback && (
            <p className="text-gray-400 text-sm mb-4">{result.tamilFeedback}</p>
          )}
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-stage1/20 text-stage1 font-semibold">
              Score: {result.score}%
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-semibold">
              +{result.xpAwarded} XP
            </span>
            <div className="flex-1" />
            <button
              onClick={onNext}
              className="px-6 py-2 rounded-full bg-stage1 text-white font-medium hover:bg-stage1/80 transition-colors"
            >
              Continue
            </button>
          </div>
        </GlassCard>
      ) : (
        <button
          onClick={submitAnswers}
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-stage1 text-white font-semibold text-lg hover:bg-stage1/80 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      )}
    </div>
  );
}
