"use client";

import { useState } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { GlassCard } from "@/components/ui/glass-card";
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
      <GlassCard className="p-8 text-center text-gray-400">
        No listening challenges available right now.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-8 flex flex-col items-center justify-center border-stage1/30">
        <h2 className="text-xl font-bold text-stage1 mb-6">{content.title}</h2>
        
        <button
          onClick={handlePlayAudio}
          disabled={isPlaying}
          className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${
            isPlaying 
              ? "bg-stage1 shadow-[0_0_30px_rgba(139,92,246,0.5)] scale-110" 
              : "bg-stage1/20 hover:bg-stage1/30 hover:scale-105"
          }`}
        >
          {isPlaying ? (
            <div className="flex gap-1 items-center">
              <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
              <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
              <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-stage1 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <p className="mt-4 text-gray-400 font-medium">
          {isPlaying ? "Playing audio..." : "Click to play the audio passage"}
        </p>
      </GlassCard>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Listen & Answer</h3>
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
