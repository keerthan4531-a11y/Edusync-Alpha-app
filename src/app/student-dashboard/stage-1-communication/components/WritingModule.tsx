"use client";

import { Stage1ContentDTO } from "@/types/communication";
import { GlassCard } from "@/components/ui/glass-card";
import { useWriting } from "../hooks/useWriting";

interface WritingModuleProps {
  content: Stage1ContentDTO | null;
  onNext: () => void;
}

export function WritingModule({ content, onNext }: WritingModuleProps) {
  const {
    submissionText,
    setSubmissionText,
    submitWriting,
    isSubmitting,
    result,
    error,
  } = useWriting(content);

  if (!content) {
    return (
      <GlassCard className="p-8 text-center text-gray-400">
        No writing challenges available right now.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-stage1 mb-2">{content.title}</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg">{content.content}</p>
        </div>
      </GlassCard>

      {!result ? (
        <GlassCard className="p-6 border-stage1/20">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Response
          </label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={isSubmitting}
            rows={6}
            placeholder="Start typing your answer here..."
            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-stage1 focus:ring-1 focus:ring-stage1 transition-all resize-none"
          />
          
          {error && (
            <div className="mt-4 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              {error}
            </div>
          )}

          <button
            onClick={submitWriting}
            disabled={isSubmitting || submissionText.trim().length < 5}
            className="w-full mt-6 py-3 rounded-xl bg-stage1 text-white font-semibold text-lg hover:bg-stage1/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI is grading...
              </>
            ) : (
              "Submit for AI Evaluation"
            )}
          </button>
        </GlassCard>
      ) : (
        <GlassCard className="p-6 border-stage1 bg-stage1/5">
          <h3 className="text-2xl font-bold text-white mb-4">AI Feedback</h3>
          
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-stage1 font-semibold mb-2">General Feedback</h4>
              <p className="text-gray-200">{result.evaluation.feedback}</p>
              <p className="text-gray-400 text-sm mt-2">{result.evaluation.tamilFeedback}</p>
            </div>

            {result.evaluation.grammarIssues?.length > 0 && (
              <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                <h4 className="text-red-400 font-semibold mb-2">Grammar & Syntax</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {result.evaluation.grammarIssues.map((issue: string, idx: number) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.evaluation.vocabularySuggestions?.length > 0 && (
              <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h4 className="text-blue-400 font-semibold mb-2">Vocabulary Suggestions</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  {result.evaluation.vocabularySuggestions.map((sug: string, idx: number) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
            <span className="px-4 py-2 rounded-full bg-stage1/20 text-stage1 font-semibold text-lg">
              Score: {result.score}%
            </span>
            <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-semibold text-lg">
              +{result.xpAwarded} XP
            </span>
            <div className="flex-1" />
            <button
              onClick={onNext}
              className="px-8 py-3 rounded-xl bg-stage1 text-white font-medium hover:bg-stage1/80 transition-colors"
            >
              Continue to Speaking
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
