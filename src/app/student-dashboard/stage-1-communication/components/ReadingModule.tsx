"use client";

import { useState, useEffect } from "react";
import { Stage1ContentDTO, Question } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useMCQ } from "../hooks/useMCQ";
import Image from "next/image";
import { BookOpen, ChevronLeft } from "lucide-react";
import { DifficultyPicker, Difficulty } from "./DifficultyPicker";
import { ChallengeSkeleton } from "./ChallengeSkeleton";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

interface ReadingModuleProps {
  content: Stage1ContentDTO | null; // Old prop, we might ignore this now for dynamic
  onNext: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
  difficulty?: string;
  onComplete?: (score: number, timeSec: number) => void;
}

const READING_FEATURES = [
  { 
    id: "read-answer" as const, 
    label: "Read & Answer", 
    icon: BookOpen, 
    color: "text-indigo-500", 
    bgColor: "bg-indigo-500/10", 
    borderColor: "border-indigo-500/20", 
    borderStyle: "rounded-full border border-indigo-500/30 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
  },
];

export function ReadingModule({ onNext, onSubFeatureOpen, difficulty, onComplete }: ReadingModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"read-answer" | null>(null);
  const [pendingFeature, setPendingFeature] = useState<"read-answer" | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");

  // Dynamic state for Read & Answer
  const [isReadingLoading, setIsReadingLoading] = useState(false);
  const [dynamicReadingChallenge, setDynamicReadingChallenge] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null || pendingFeature !== null);
    }
  }, [activeFeature, pendingFeature, onSubFeatureOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft !== null && timeLeft > 0 && activeFeature === "read-answer") {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && activeFeature === "read-answer") {
      setShowQuestions(true);
      setTimeLeft(null);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, activeFeature]);

  const loadDynamicReading = async (diff?: string | any) => {
    setIsReadingLoading(true);
    setDynamicReadingChallenge(null);
    reset();
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-reading-mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setDynamicReadingChallenge(data);
        setShowQuestions(false);
        const timeLimit = targetDiff === "HARD" ? 30 : targetDiff === "MEDIUM" ? 60 : 80;
        setTimeLeft(timeLimit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReadingLoading(false);
    }
  };

  const {
    answers,
    handleOptionSelect,
    submitAnswers,
    isSubmitting,
    result,
    error,
    reset,
  } = useMCQ(dynamicReadingChallenge);

  if (pendingFeature) {
    return (
      <DifficultyPicker
        title="Read & Answer"
        onSelect={(diff) => {
          setSelectedDifficulty(diff);
          setActiveFeature(pendingFeature);
          setPendingFeature(null);
          loadDynamicReading(diff);
        }}
        onBack={() => {
          setPendingFeature(null);
          onSubFeatureOpen?.(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* FEATURE SELECTOR GRID */}
      {!activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {READING_FEATURES.map((feature) => {
            return (
              <button
                key={feature.id}
                onClick={() => {
                  setPendingFeature(feature.id);
                  onSubFeatureOpen?.(true);
                }}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl shadow-indigo-500/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-indigo-500/10 dark:bg-indigo-950/30 border-2 border-indigo-400/20 transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-400/50 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <Image 
                      src="/images/communication/reading.png" 
                      alt={feature.label}
                      fill
                      className="object-contain mix-blend-screen filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]"
                      sizes="(max-width: 768px) 64px, 80px"
                      priority
                    />
                  </div>
                </div>
                <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
                  {feature.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center">
            <button
              onClick={() => {
                setActiveFeature(null);
                onSubFeatureOpen?.(false);
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
              aria-label="Back to Reading Options"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* RENDER FEATURE: READ & ANSWER */}
          {activeFeature === "read-answer" && (
            <div className="space-y-6">
              {isReadingLoading ? (
                <ChallengeSkeleton variant="reading" />
              ) : dynamicReadingChallenge ? (
                <div className="space-y-6 animate-in fade-in">
                  {!showQuestions ? (
                    <LiquidGlassCard className="p-6 border-indigo-500/20 text-center relative" accentColor="#6366f1">
                      {timeLeft !== null && (
                        <div className="absolute top-4 right-6 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full font-bold shadow-sm flex items-center gap-2">
                          <span className="animate-pulse">⏳</span> {timeLeft}s
                        </div>
                      )}
                      <h2 className="text-[22px] font-bold text-indigo-600 dark:text-indigo-400 mb-6 mt-4 md:mt-0 text-left">
                        {dynamicReadingChallenge.title || "Read & Answer"}
                      </h2>
                      <div className="prose dark:prose-invert max-w-none text-left mb-8">
                        <p className="text-zinc-700 dark:text-gray-200 leading-relaxed text-[17px] font-medium whitespace-pre-wrap">
                          {dynamicReadingChallenge.content || ""}
                        </p>
                      </div>
                      <button 
                        onClick={() => { setShowQuestions(true); setTimeLeft(null); }}
                        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px]"
                      >
                        I'm Ready to Answer
                      </button>
                    </LiquidGlassCard>
                  ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                      <h3 className="text-[17px] font-semibold text-foreground">Comprehension Questions</h3>
                      {dynamicReadingChallenge.questions?.map((q: Question, qIndex: number) => (
                        <LiquidGlassCard key={q.id} className="p-5 border-indigo-500/10" accentColor="#6366f1">
                          <div className="text-foreground mb-4 font-medium text-[17px]">
                            Q{qIndex + 1}: {q.question}
                          </div>
                          <div className="space-y-3">
                            {q.options?.map((opt: string, idx: number) => {
                              const isSelected = answers[q.id] === idx;
                              const isSubmitted = result !== null;
                              const isCorrect = isSubmitted && idx === q.correctIndex;
                              const isWrongSelection = isSubmitted && isSelected && idx !== q.correctIndex;

                              let btnClass = "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-300";
                              
                              if (isSelected && !isSubmitted) {
                                btnClass = "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[inset_0_0_10px_rgba(59,130,246,0.3)]";
                              } else if (isCorrect) {
                                btnClass = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 shadow-[inset_0_0_10px_rgba(34,197,94,0.1)] dark:shadow-[inset_0_0_10px_rgba(34,197,94,0.3)]";
                              } else if (isWrongSelection) {
                                btnClass = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)] dark:shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]";
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => !isSubmitted && handleOptionSelect(q.id, idx)}
                                  disabled={isSubmitted}
                                  className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${btnClass} text-[15px] font-medium`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </LiquidGlassCard>
                      ))}

                      {error && (
                        <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>
                      )}

                      {result ? (
                        <LiquidGlassCard className="p-6 border-indigo-500/30 bg-indigo-500/5 animate-in slide-in-from-bottom-4" accentColor="#6366f1">
                          <h3 className="text-[22px] font-bold text-foreground mb-2">Results</h3>
                          <p className="text-zinc-700 dark:text-gray-200 mb-2 text-[17px] font-medium">{result.feedback}</p>
                          {result.tamilFeedback && (
                            <p className="text-indigo-600 dark:text-indigo-400 text-[15px] mb-4 italic">{result.tamilFeedback}</p>
                          )}
                          <div className="flex items-center gap-4 mt-6">
                            <span className="px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold border border-indigo-500/50 shadow-sm">
                              Score: {result.score}%
                            </span>
                            <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 font-bold border border-yellow-500/50 shadow-sm">
                              +{result.xpAwarded} XP
                            </span>
                            <div className="flex-1" />
                            <button
                              onClick={loadDynamicReading}
                              className="px-6 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] text-white font-medium shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                            >
                              Next
                            </button>
                          </div>
                        </LiquidGlassCard>
                      ) : (
                        <button
                          onClick={submitAnswers}
                          disabled={isSubmitting}
                          className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? "Evaluating..." : "Submit"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400 text-center py-10">Failed to load reading challenge. Please try again.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
