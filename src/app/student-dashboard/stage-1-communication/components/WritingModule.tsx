"use client";

import { useState, useEffect } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useWriting } from "../hooks/useWriting";
import { ChallengeSkeleton } from "./ChallengeSkeleton";
import { DifficultyPicker, Difficulty } from "./DifficultyPicker";
import Image from "next/image";
import { 
  PenTool, 
  Image as ImageIcon, 
  ShieldAlert, 
  Check, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Play
} from "lucide-react";

interface WritingModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onNext: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
  difficulty?: string;
  onComplete?: (score: number, timeSec: number) => void;
}

const NO_FILTER_PROMPTS = [
  {
    original: "The weather was very good and I felt happy.",
    banned: ["good", "happy", "very"],
    hints: {
      good: ["splendid", "pleasant", "delightful", "gorgeous"],
      happy: ["thrilled", "joyful", "ecstatic", "elated"],
      very: ["incredibly", "exceptionally", "exceedingly"]
    }
  },
  {
    original: "The food at the restaurant was nice but the service was bad.",
    banned: ["nice", "bad"],
    hints: {
      nice: ["delicious", "flavorful", "exquisite", "delectable"],
      bad: ["abysmal", "dreadful", "subpar", "disappointing"]
    }
  }
];

const WRITING_FEATURES = [
  { id: "tutor" as const, label: "Write in", icon: PenTool, color: "text-indigo-500", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", borderStyle: "rounded-full border border-indigo-500/30 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
  { id: "image" as const, label: "Write about", icon: PenTool, color: "text-indigo-500", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", borderStyle: "rounded-full border border-indigo-500/30 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
  { id: "filter" as const, label: "Write out", icon: PenTool, color: "text-indigo-500", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", borderStyle: "rounded-full border border-indigo-500/30 group-hover:border-indigo-500/60 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]" },
];

export function WritingModule({ content, challenges = [], onNext, onSubFeatureOpen, difficulty, onComplete }: WritingModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"tutor" | "image" | "filter" | null>(null);
  const [pendingFeature, setPendingFeature] = useState<"tutor" | "image" | "filter" | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");

  // ----------------------------------------------------
  // WRITE IN (DYNAMIC PROMPT) LOGIC
  // ----------------------------------------------------
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [dynamicTutorChallenge, setDynamicTutorChallenge] = useState<any>(null);

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null || pendingFeature !== null);
    }
  }, [activeFeature, pendingFeature, onSubFeatureOpen]);

  // Ensure we load the dynamic challenge when opening the feature
  useEffect(() => {
    if (activeFeature === "tutor" && !dynamicTutorChallenge && !isTutorLoading) {
      loadDynamicTutor();
    }
  }, [activeFeature]);

  const loadDynamicTutor = async (diff?: string | any) => {
    setIsTutorLoading(true);
    setDynamicTutorChallenge(null);
    resetTutor();
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-writing-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setDynamicTutorChallenge(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // AI Writing Tutor speech Hook
  const {
    submissionText: tutorText,
    setSubmissionText: setTutorText,
    submitWriting: submitTutor,
    isSubmitting: isTutorSubmitting,
    result: tutorResult,
    error: tutorError,
    reset: resetTutor
  } = useWriting(dynamicTutorChallenge);

  // ----------------------------------------------------
  // WRITE ABOUT LOGIC (DYNAMIC IMAGE)
  // ----------------------------------------------------
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [dynamicImageChallenge, setDynamicImageChallenge] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (activeFeature === "image" && !dynamicImageChallenge && !isImageLoading) {
      loadDynamicImage();
    }
  }, [activeFeature]);

  const loadDynamicImage = async (diff?: string | any) => {
    setIsImageLoading(true);
    setDynamicImageChallenge(null);
    setImageLoaded(false);
    resetImage();
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setDynamicImageChallenge(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImageLoading(false);
    }
  };

  const {
    submissionText: imageText,
    setSubmissionText: setImageText,
    submitWriting: submitImageDescription,
    isSubmitting: isImageSubmitting,
    result: imageResult,
    error: imageError,
    reset: resetImage
  } = useWriting(dynamicImageChallenge);

  // ----------------------------------------------------
  // WRITE OUT LOGIC (NO-FILTER REWRITE)
  // ----------------------------------------------------
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [dynamicFilterChallenge, setDynamicFilterChallenge] = useState<any>(null);
  const [hintsRevealed, setHintsRevealed] = useState(false);
  const [isDeductingCoins, setIsDeductingCoins] = useState(false);
  const [coinError, setCoinError] = useState<string | null>(null);

  useEffect(() => {
    if (activeFeature === "filter" && !dynamicFilterChallenge && !isFilterLoading) {
      loadDynamicFilter();
    }
  }, [activeFeature]);

  const loadDynamicFilter = async (diff?: string | any) => {
    setIsFilterLoading(true);
    setDynamicFilterChallenge(null);
    setHintsRevealed(false);
    setCoinError(null);
    resetFilter();
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-rewrite-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        setDynamicFilterChallenge(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const revealHints = async () => {
    setIsDeductingCoins(true);
    setCoinError(null);
    try {
      const res = await fetch("/api/gamification/deduct-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 10, reason: "Revealed hints for Write out module" })
      });
      const data = await res.json();
      if (res.ok) {
        setHintsRevealed(true);
      } else {
        setCoinError(data.error || "Failed to reveal hints");
      }
    } catch (e) {
      setCoinError("Failed to deduct coins. Please try again.");
    } finally {
      setIsDeductingCoins(false);
    }
  };

  const {
    submissionText: filterText,
    setSubmissionText: setFilterText,
    submitWriting: submitFilterRewrite,
    isSubmitting: isFilterSubmitting,
    result: filterResult,
    error: filterSubmissionError,
    reset: resetFilter
  } = useWriting(dynamicFilterChallenge);

  const activeFilterData = dynamicFilterChallenge?.questions?.[0] || { bannedWords: [], hints: {} };

  // Helper to find which banned words are typed in real-time
  const getViolatedBannedWords = (text: string) => {
    if (!activeFilterData.bannedWords) return [];
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""));
    return activeFilterData.bannedWords.filter((bannedWord: string) => words.includes(bannedWord.toLowerCase()));
  };

  const violatedWords = getViolatedBannedWords(filterText);
  const isFilterValid = violatedWords.length === 0 && filterText.trim().length >= 10;

  const titles = {
    tutor: "Write in",
    image: "Write about",
    filter: "Write out",
  };

  if (pendingFeature) {
    return (
      <DifficultyPicker
        title={titles[pendingFeature] || "Select Difficulty"}
        onSelect={(diff) => {
          setSelectedDifficulty(diff);
          const feat = pendingFeature;
          setActiveFeature(feat);
          setPendingFeature(null);
          if (feat === "tutor") loadDynamicTutor(diff);
          else if (feat === "image") loadDynamicImage(diff);
          else if (feat === "filter") loadDynamicFilter(diff);
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
      {!activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {WRITING_FEATURES.map((feature) => {
            return (
              <button
                key={feature.id}
                onClick={() => {
                  setPendingFeature(feature.id);
                  onSubFeatureOpen?.(true);
                }}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    <Image 
                      src="/images/communication/writing.png" 
                      alt={feature.label}
                      fill
                      className="object-contain dark:mix-blend-screen filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]"
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
              onClick={() => setActiveFeature(null)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
              aria-label="Back to Writing Options"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* 1. RENDER TAB: WRITE IN */}
          {activeFeature === "tutor" && (
            <div className="space-y-6">
              {isTutorLoading ? (
                <ChallengeSkeleton variant="writing-tutor" />
              ) : dynamicTutorChallenge ? (
                <div className="space-y-6 animate-in fade-in">
                  <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
                    <h2 className="text-[22px] font-bold text-foreground mb-4">
                      {dynamicTutorChallenge.title || "Write in"}
                    </h2>
                    <p className="text-zinc-600 dark:text-gray-300 text-[17px] leading-relaxed">
                      {dynamicTutorChallenge.content}
                    </p>
                  </LiquidGlassCard>

                  {!tutorResult ? (
                    <div className="w-full mt-2">
                      <textarea
                        value={tutorText}
                        onChange={(e) => setTutorText(e.target.value)}
                        disabled={isTutorSubmitting}
                        rows={10}
                        placeholder="Type your opinion...."
                        className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-6 text-[17px] text-foreground placeholder:text-zinc-500 dark:placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                      />
                      
                      {tutorError && (
                        <div className="mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                          {tutorError}
                        </div>
                      )}

                      <button
                        onClick={submitTutor}
                        disabled={isTutorSubmitting || tutorText.trim().length < 5}
                        className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isTutorSubmitting ? "Evaluating..." : "Submit"}
                      </button>
                    </div>
                  ) : (
                    <LiquidGlassCard className="p-6 border-indigo-500 bg-indigo-500/5 animate-in slide-in-from-bottom" accentColor="#6366f1">
                      <h3 className="text-[28px] font-bold text-gray-900 dark:text-white mb-4">AI Feedback</h3>
                      
                      <div className="space-y-6">
                        <div className="bg-black/5 dark:bg-black/40 p-5 rounded-2xl border border-black/10 dark:border-white/10">
                          <p className="text-[17px] text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                            {tutorResult.evaluation?.feedback || "Great writing!"}
                          </p>
                          {tutorResult.evaluation?.tamilFeedback && (
                            <p className="text-[15px] text-blue-700 dark:text-indigo-400 italic mt-3 font-medium">
                              {tutorResult.evaluation.tamilFeedback}
                            </p>
                          )}
                        </div>

                        {(tutorResult.evaluation?.grammarIssues?.length > 0 || tutorResult.evaluation?.vocabularySuggestions?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tutorResult.evaluation.grammarIssues?.length > 0 && (
                              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> Grammar Fixes
                                </h4>
                                <ul className="list-disc pl-4 space-y-1">
                                  {tutorResult.evaluation.grammarIssues.map((issue: string, i: number) => (
                                    <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {tutorResult.evaluation.vocabularySuggestions?.length > 0 && (
                              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" /> Better Words
                                </h4>
                                <ul className="list-disc pl-4 space-y-1">
                                  {tutorResult.evaluation.vocabularySuggestions.map((sug: string, i: number) => (
                                    <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{sug}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-8 flex items-center gap-4 flex-wrap">
                          <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm">
                            Score: {tutorResult.score}%
                          </span>
                          <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20 shadow-sm">
                            +{tutorResult.xpAwarded} XP
                          </span>
                          <div className="flex-1" />
                          <button
                            onClick={loadDynamicTutor}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  )}
                </div>
              ) : (
                <div className="text-red-400 text-center py-10">Failed to load writing prompt. Please try again.</div>
              )}
            </div>
          )}

      {/* 2. RENDER TAB: WRITE ABOUT (DYNAMIC IMAGE) */}
      {activeFeature === "image" && (
        <div className="space-y-6">
          {isImageLoading || (dynamicImageChallenge?.questions?.[0]?.imageUrl && !imageLoaded) ? (
            <>
              <ChallengeSkeleton variant="writing-image" />
              {/* Preload image in background */}
              {dynamicImageChallenge?.questions?.[0]?.imageUrl && !isImageLoading && (
                <img 
                  src={dynamicImageChallenge.questions[0].imageUrl} 
                  className="hidden" 
                  onLoad={() => setImageLoaded(true)}
                  alt="Preload" 
                />
              )}
            </>
          ) : dynamicImageChallenge ? (
            <div className="space-y-6 animate-in fade-in">
              <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
                <h2 className="text-[22px] font-bold text-foreground mb-4">
                  {dynamicImageChallenge.title || "Write about"}
                </h2>
                
                {dynamicImageChallenge.questions?.[0]?.imageUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={dynamicImageChallenge.questions[0].imageUrl}
                      alt="Generated scene"
                      onClick={() => setZoomedImage(dynamicImageChallenge.questions[0].imageUrl)}
                      className="w-full rounded-2xl shadow-lg border border-black/10 dark:border-white/10 cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all"
                    />
                  </div>
                )}
              </LiquidGlassCard>

              {zoomedImage && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
                  onClick={() => setZoomedImage(null)}
                >
                  <div className="relative max-w-5xl w-full">
                    <button 
                      onClick={() => setZoomedImage(null)}
                      className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors text-white border border-white/20"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                    <img
                      src={zoomedImage}
                      alt="Zoomed scene"
                      className="w-full h-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain max-h-[85vh]"
                    />
                  </div>
                </div>
              )}

              {!imageResult ? (
                <div className="w-full mt-2">
                  <textarea
                    value={imageText}
                    onChange={(e) => setImageText(e.target.value)}
                    disabled={isImageSubmitting}
                    rows={10}
                    placeholder="Describe the scene in detail..."
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-6 text-[17px] text-foreground placeholder:text-zinc-500 dark:placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                  />
                  
                  {imageError && (
                    <div className="mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {imageError}
                    </div>
                  )}

                  <button
                    onClick={submitImageDescription}
                    disabled={isImageSubmitting || imageText.trim().length < 5}
                    className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isImageSubmitting ? "Evaluating..." : "Submit"}
                  </button>
                </div>
              ) : (
                <LiquidGlassCard className="p-6 border-indigo-500 bg-indigo-500/5 animate-in slide-in-from-bottom" accentColor="#6366f1">
                  <h3 className="text-[28px] font-bold text-gray-900 dark:text-white mb-4">AI Feedback</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-black/5 dark:bg-black/40 p-5 rounded-2xl border border-black/10 dark:border-white/10">
                      <p className="text-[17px] text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                        {imageResult.evaluation?.feedback || "Great description!"}
                      </p>
                      {imageResult.evaluation?.tamilFeedback && (
                        <p className="text-[15px] text-blue-700 dark:text-indigo-400 italic mt-3 font-medium">
                          {imageResult.evaluation.tamilFeedback}
                        </p>
                      )}
                    </div>

                    {(imageResult.evaluation?.grammarIssues?.length > 0 || imageResult.evaluation?.vocabularySuggestions?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {imageResult.evaluation.grammarIssues?.length > 0 && (
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> Grammar Fixes
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {imageResult.evaluation.grammarIssues.map((issue: string, i: number) => (
                                <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {imageResult.evaluation.vocabularySuggestions?.length > 0 && (
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Better Words
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {imageResult.evaluation.vocabularySuggestions.map((sug: string, i: number) => (
                                <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex items-center gap-4 flex-wrap">
                      <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm">
                        Score: {imageResult.score}%
                      </span>
                      <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20 shadow-sm">
                        +{imageResult.xpAwarded} XP
                      </span>
                      <div className="flex-1" />
                      <button
                        onClick={loadDynamicImage}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          ) : (
            <div className="text-red-400 text-center py-10">Failed to load creative scene. Please try again.</div>
          )}
        </div>
      )}

      {/* 3. RENDER TAB: WRITE OUT (NO-FILTER REWRITE) */}
      {activeFeature === "filter" && (
        <div className="space-y-6">
          {isFilterLoading ? (
            <ChallengeSkeleton variant="writing-filter" />
          ) : dynamicFilterChallenge ? (
            <div className="space-y-6 animate-in fade-in">
              <LiquidGlassCard className="p-6 border-indigo-500/20" accentColor="#6366f1">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[22px] font-bold text-foreground">
                    {dynamicFilterChallenge.title || "Write out"}
                  </h2>
                </div>

                <p className="text-[15px] text-zinc-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Rewrite the simple sentence below. Make it engaging, but you <strong className="text-indigo-500 dark:text-indigo-400 font-semibold">cannot use basic filter words</strong>.
                </p>

                <div className="p-5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl space-y-2 mb-6 shadow-sm">
                  <span className="text-[11px] text-zinc-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Boring Sentence:</span>
                  <p className="text-foreground text-[17px] font-medium leading-relaxed">"{dynamicFilterChallenge.content}"</p>
                </div>

                {/* Banned word tokens */}
                <div className="mb-6 space-y-3">
                  <span className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider block">Banned Filter Words:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeFilterData.bannedWords?.map((w: string) => (
                      <span key={w} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 rounded-lg text-sm font-bold shadow-sm">
                        🚫 {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hints Section */}
                <div className="mb-2">
                  {!hintsRevealed ? (
                    <div className="flex flex-col items-start gap-2">
                      <button 
                        onClick={revealHints}
                        disabled={isDeductingCoins}
                        className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        {isDeductingCoins ? "Revealing..." : "Reveal Hints (Cost: 10 Coins)"}
                      </button>
                      {coinError && <p className="text-red-500 text-xs font-medium">{coinError}</p>}
                    </div>
                  ) : (
                    <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3 animate-in slide-in-from-top-4">
                      <span className="text-[11px] text-indigo-500 font-bold uppercase tracking-wider block flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" /> Vocab Suggestions (Hints):
                      </span>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {Object.entries(activeFilterData.hints || {}).map(([key, words]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-zinc-600 dark:text-gray-300 font-bold capitalize select-none min-w-[120px]">{key} alternatives:</span>
                            <span className="text-indigo-600 dark:text-indigo-300 font-medium">{String(words)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </LiquidGlassCard>

              {!filterResult ? (
                <div className="w-full mt-2">
                  <textarea
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    disabled={isFilterSubmitting}
                    rows={10}
                    placeholder="Enter your advanced rewrite here..."
                    className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-6 text-[17px] text-foreground placeholder:text-zinc-500 dark:placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-sm dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                  />
                  
                  {/* Real time validations */}
                  <div className="mt-4 space-y-3 p-4 bg-black/5 dark:bg-black/30 rounded-2xl border border-black/10 dark:border-white/5 text-[13px] font-medium">
                    <div className="flex items-center gap-2">
                      {violatedWords.length === 0 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className={violatedWords.length === 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {violatedWords.length === 0 
                          ? "Does not contain banned words" 
                          : `Contains banned word(s): ${violatedWords.join(", ")}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {filterText.trim().length >= 10 ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-zinc-400" />
                      )}
                      <span className={filterText.trim().length >= 10 ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-gray-400"}>
                        Length is at least 10 characters
                      </span>
                    </div>
                  </div>

                  {filterSubmissionError && (
                    <div className="mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {filterSubmissionError}
                    </div>
                  )}

                  <button
                    onClick={submitFilterRewrite}
                    disabled={!isFilterValid || isFilterSubmitting}
                    className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isFilterSubmitting ? "Evaluating..." : "Verify Rewrite"}
                  </button>
                </div>
              ) : (
                <LiquidGlassCard className="p-6 border-indigo-500 bg-indigo-500/5 animate-in slide-in-from-bottom" accentColor="#6366f1">
                  <h3 className="text-[28px] font-bold text-gray-900 dark:text-white mb-4">AI Feedback</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-black/5 dark:bg-black/40 p-5 rounded-2xl border border-black/10 dark:border-white/10">
                      <p className="text-[17px] text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                        {filterResult.evaluation?.feedback || "Great rewrite!"}
                      </p>
                      {filterResult.evaluation?.tamilFeedback && (
                        <p className="text-[15px] text-blue-700 dark:text-indigo-400 italic mt-3 font-medium">
                          {filterResult.evaluation.tamilFeedback}
                        </p>
                      )}
                    </div>

                    {(filterResult.evaluation?.grammarIssues?.length > 0 || filterResult.evaluation?.vocabularySuggestions?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filterResult.evaluation.grammarIssues?.length > 0 && (
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> Grammar Fixes
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {filterResult.evaluation.grammarIssues.map((issue: string, i: number) => (
                                <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {filterResult.evaluation.vocabularySuggestions?.length > 0 && (
                          <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <h4 className="text-blue-600 dark:text-indigo-400 font-bold text-[14px] uppercase tracking-wider mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Better Words
                            </h4>
                            <ul className="list-disc pl-4 space-y-1">
                              {filterResult.evaluation.vocabularySuggestions.map((sug: string, i: number) => (
                                <li key={i} className="text-[14px] text-blue-800 dark:text-indigo-300 font-medium">{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-8 flex items-center gap-4 flex-wrap">
                      <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm">
                        Score: {filterResult.score}%
                      </span>
                      <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20 shadow-sm">
                        +{filterResult.xpAwarded} XP
                      </span>
                      <div className="flex-1" />
                      <button
                        onClick={loadDynamicFilter}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          ) : (
            <div className="text-red-400 text-center py-10">Failed to load writing challenge. Please try again.</div>
          )}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
