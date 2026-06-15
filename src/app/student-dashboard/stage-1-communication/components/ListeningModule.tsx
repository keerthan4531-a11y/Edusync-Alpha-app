"use client";

import { useState } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useMCQ } from "../hooks/useMCQ";

interface ListeningModuleProps {
  content: Stage1ContentDTO | null;
  onNext: () => void;
}

export function ListeningModule({ content, onNext }: ListeningModuleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const {
    answers,
    handleOptionSelect,
    submitAnswers,
    isSubmitting,
    result,
    error,
  } = useMCQ(content);

  const handlePlayAudio = () => {
    if (!content?.content || typeof window === "undefined") return;
    
    // TODO: replace with recorded audio. 
    // The prototype likely used real audio files. We are currently using SpeechSynthesis (browser TTS) 
    // to read out the passage text as a placeholder until actual audio URLs are seeded in the DB.
    const utterance = new SpeechSynthesisUtterance(content.content);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.cancel(); // clear previous
    window.speechSynthesis.speak(utterance);
  };

  if (!content) {
    return (
      <LiquidGlassCard className="p-8 text-center text-gray-400">
        No listening challenges available right now.
      </LiquidGlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <LiquidGlassCard className="p-8 flex flex-col items-center justify-center border-stage1/30" accentColor="#8b5cf6">
        <h2 className="text-xl font-bold text-stage1 mb-6">{content.title}</h2>
        
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 ${
            isPlaying 
              ? "bg-stage1 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(139,92,246,0.6)] scale-110" 
              : "bg-stage1/20 hover:bg-stage1/30 hover:scale-105 border border-stage1/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
          }`}
        >
          {isPlaying ? (
            <div className="flex gap-1 items-center">
              <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
              <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
              <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stage1 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <p className="mt-4 text-gray-400 font-medium">
          {isPlaying ? "Playing audio..." : "Click to play the audio passage"}
        </p>
      </LiquidGlassCard>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Listen & Answer</h3>
        {content.questions?.map((q) => (
          <LiquidGlassCard key={q.id} className="p-5 border-stage1/20" accentColor="#8b5cf6">
            <p className="text-white mb-4 font-medium">{q.question}</p>
            <div className="space-y-3">
              {q.options?.map((opt, idx) => {
                const isSelected = answers[q.id] === idx;
                const isSubmitted = result !== null;
                const isCorrect = isSubmitted && idx === q.correctIndex;
                const isWrongSelection = isSubmitted && isSelected && idx !== q.correctIndex;

                let btnClass = "border-white/10 hover:bg-white/5 text-gray-300";
                
                if (isSelected && !isSubmitted) {
                  btnClass = "border-stage1 bg-stage1/10 text-white shadow-[inset_0_0_10px_rgba(139,92,246,0.3)]";
                } else if (isCorrect) {
                  btnClass = "border-green-500 bg-green-500/10 text-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.3)]";
                } else if (isWrongSelection) {
                  btnClass = "border-red-500 bg-red-500/10 text-red-400 shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isSubmitted && handleOptionSelect(q.id, idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </LiquidGlassCard>
        ))}
      </div>

      {error && (
        <div className="text-red-400 text-sm font-medium">{error}</div>
      )}

      {result ? (
        <LiquidGlassCard className="p-6 border-stage1 bg-stage1/5" accentColor="#8b5cf6">
          <h3 className="text-xl font-bold text-white mb-2">Results</h3>
          <p className="text-gray-300 mb-2">{result.feedback}</p>
          {result.tamilFeedback && (
            <p className="text-gray-400 text-sm mb-4">{result.tamilFeedback}</p>
          )}
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-stage1/20 text-stage1 font-semibold border border-stage1/50 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
              Score: {result.score}%
            </span>
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 font-semibold border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              +{result.xpAwarded} XP
            </span>
            <div className="flex-1" />
            <button
              onClick={onNext}
              className="px-6 py-2 rounded-full bg-stage1 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(139,92,246,0.4)] hover:bg-stage1/90 transition-all duration-300 hover:scale-[1.02]"
            >
              Continue
            </button>
          </div>
        </LiquidGlassCard>
      ) : (
        <button
          onClick={submitAnswers}
          disabled={isSubmitting}
          className="w-full py-3 rounded-2xl bg-stage1 text-white font-semibold text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(139,92,246,0.4)] hover:bg-stage1/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      )}
    </div>
  );
}
