"use client";

import { useState, useEffect } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useWriting } from "../hooks/useWriting";
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
  ChevronLeft
} from "lucide-react";

interface WritingModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onNext: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
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
  { id: "tutor" as const, label: "AI Writing Tutor", icon: PenTool, color: "text-emerald-400", bgColor: "bg-emerald-400/10", borderColor: "border-emerald-400/20" },
  { id: "image" as const, label: "Image Describer", icon: ImageIcon, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/20" },
  { id: "filter" as const, label: "No-Filter Rewrite", icon: ShieldAlert, color: "text-orange-400", bgColor: "bg-orange-400/10", borderColor: "border-orange-400/20" },
];

export function WritingModule({ content, challenges = [], onNext, onSubFeatureOpen }: WritingModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"tutor" | "image" | "filter" | null>(null);
  const [tutorChallenge, setTutorChallenge] = useState<Stage1ContentDTO | null>(null);
  const [imageChallenge, setImageChallenge] = useState<Stage1ContentDTO | null>(null);
  const [rewriteChallenge, setRewriteChallenge] = useState<Stage1ContentDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChallenges() {
      try {
        setLoading(true);
        const [tutorRes, imageRes, rewriteRes] = await Promise.all([
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "WRITING" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "WRITING_IMAGE" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "WRITING_REWRITE" })
          }).then(r => r.json())
        ]);

        if (tutorRes.success) setTutorChallenge(tutorRes.challenge);
        if (imageRes.success) setImageChallenge(imageRes.challenge);
        if (rewriteRes.success) setRewriteChallenge(rewriteRes.challenge);
      } catch (err) {
        console.error("Failed to generate writing challenges", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllChallenges();
  }, []);

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null);
    }
  }, [activeFeature, onSubFeatureOpen]);

  // Filter writing challenges from challenges array (kept for compatibility)
  const writingChallenges = tutorChallenge ? [tutorChallenge] : [];
  const [tutorChallengeIdx, setTutorChallengeIdx] = useState(0);
  const activeTutorChallenge = writingChallenges[tutorChallengeIdx];

  // AI Writing Tutor speech Hook
  const {
    submissionText: tutorText,
    setSubmissionText: setTutorText,
    submitWriting: submitTutor,
    isSubmitting: isTutorSubmitting,
    result: tutorResult,
    error: tutorError,
    reset: resetTutor
  } = useWriting(tutorChallenge);

  // ----------------------------------------------------
  // IMAGE DESCRIBER LOGIC
  // ----------------------------------------------------
  const [imageText, setImageText] = useState("");
  const [isImageSubmitting, setIsImageSubmitting] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const submitImageDescription = async () => {
    setImageError(null);
    const words = imageText.trim().split(/\s+/).filter(Boolean);
    if (words.length < 15) {
      setImageError("Please write a descriptive summary of at least 15 words to describe the details.");
      return;
    }

    setIsImageSubmitting(true);

    try {
      const res = await fetch("/api/communication/evaluate-picture-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userDescription: imageText,
          actualPrompt: imageChallenge?.imagePrompt || imageChallenge?.content || ""
        })
      });
      const data = await res.json();
      if (res.ok) {
        setImageResult({
          score: data.score,
          xpAwarded: data.score >= 80 ? 25 : (data.score >= 50 ? 15 : 5),
          feedback: data.feedback,
          tamilFeedback: data.tamilFeedback,
          improvedVersion: data.improvedVersion
        });
      } else {
        setImageError(data.error || "Failed to evaluate image description.");
      }
    } catch (e) {
      console.error(e);
      setImageError("Connection error. Please try again.");
    } finally {
      setIsImageSubmitting(false);
    }
  };

  const resetImageDescriber = () => {
    setImageText("");
    setImageResult(null);
    setImageError(null);
  };

  // ----------------------------------------------------
  // NO-FILTER REWRITE LOGIC
  // ----------------------------------------------------
  const [filterText, setFilterText] = useState("");
  const [filterResult, setFilterResult] = useState<any>(null);
  const [isFilterSubmitting, setIsFilterSubmitting] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);

  const parsedRewrite = rewriteChallenge
    ? (typeof rewriteChallenge.questions === "string" ? JSON.parse(rewriteChallenge.questions) : rewriteChallenge.questions)
    : null;

  const bannedWords = parsedRewrite?.banned || rewriteChallenge?.banned || [];
  const hints = parsedRewrite?.hints || rewriteChallenge?.hints || {};

  // Helper to find which banned words are typed in real-time
  const getViolatedBannedWords = (text: string) => {
    const words = text.toLowerCase().split(/\s+/).map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""));
    return bannedWords.filter((bannedWord: string) => words.includes(bannedWord.toLowerCase()));
  };

  const violatedWords = getViolatedBannedWords(filterText);
  const hasTextLength = filterText.trim().length >= 15;
  const isFilterValid = violatedWords.length === 0 && hasTextLength;

  const submitFilterRewrite = async () => {
    if (!isFilterValid || !rewriteChallenge) return;
    setIsFilterSubmitting(true);
    setFilterError(null);
    try {
      const res = await fetch("/api/communication/evaluate-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: rewriteChallenge.id,
          userRewrite: filterText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFilterResult({
          score: data.score,
          xpAwarded: data.xpAwarded,
          feedback: data.feedback,
          tamilFeedback: data.tamilFeedback
        });
      } else {
        setFilterError(data.error || "Failed to evaluate rewrite.");
      }
    } catch (e) {
      console.error(e);
      setFilterError("Connection error. Please try again.");
    } finally {
      setIsFilterSubmitting(false);
    }
  };

  const resetFilterRewrite = () => {
    setFilterText("");
    setFilterResult(null);
    setFilterError(null);
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <LiquidGlassCard className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-gray-400 font-medium">Inixa AI is generating your writing challenge...</p>
        </LiquidGlassCard>
      ) : !activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WRITING_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
              >
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${feature.bgColor} ${feature.borderColor} border transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-10 h-10 ${feature.color}`} strokeWidth={1.5} />
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

          {/* 1. RENDER TAB: AI WRITING TUTOR */}
          {activeFeature === "tutor" && activeTutorChallenge && (
            <div className="space-y-6 animate-in fade-in">
              {/* Challenge list switcher */}
              {writingChallenges.length > 1 && (
                <div className="flex gap-2">
                  {writingChallenges.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setTutorChallengeIdx(i);
                        resetTutor();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${tutorChallengeIdx === i
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                    >
                      Prompt {i + 1}: {c.title}
                    </button>
                  ))}
                </div>
              )}

              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <h2 className="text-[22px] font-bold text-foreground mb-2">{activeTutorChallenge.title}</h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-zinc-600 dark:text-gray-300 text-[17px]">{activeTutorChallenge.content}</p>
                </div>
              </LiquidGlassCard>

              {!tutorResult ? (
                <LiquidGlassCard className="p-6 border-black/10 dark:border-white/10" accentColor="#8b5cf6">
                  <label className="block text-[15px] font-medium text-zinc-600 dark:text-gray-300 mb-2">
                    Your Paragraph Submission
                  </label>
                  <textarea
                    value={tutorText}
                    onChange={(e) => setTutorText(e.target.value)}
                    disabled={isTutorSubmitting}
                    rows={6}
                    placeholder="Start typing your paragraph response here..."
                    className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-[17px] text-foreground placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                  />

                  {tutorError && (
                    <div className="mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {tutorError}
                    </div>
                  )}

                  <button
                    onClick={submitTutor}
                    disabled={isTutorSubmitting || tutorText.trim().length < 5}
                    className="w-full mt-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold text-[17px] shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isTutorSubmitting ? "AI is grading..." : "Submit for AI Evaluation"}
                  </button>
                </LiquidGlassCard>
              ) : (
                <LiquidGlassCard className="p-6 border-purple-500 bg-purple-500/5 animate-in slide-in-from-bottom" accentColor="#8b5cf6">
                  <h3 className="text-[28px] font-bold text-foreground mb-4">AI Feedback</h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                      <h4 className="text-purple-600 dark:text-purple-400 font-semibold mb-1 text-[15px]">General Review</h4>
                      <p className="text-zinc-600 dark:text-gray-200 text-[15px]">{tutorResult.evaluation.feedback}</p>
                      <p className="text-zinc-500 dark:text-gray-400 text-[13px] mt-2 italic">{tutorResult.evaluation.tamilFeedback}</p>
                    </div>

                    {tutorResult.evaluation.grammarIssues?.length > 0 && (
                      <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                        <h4 className="text-red-400 font-semibold mb-2 text-sm">Grammar & Syntax</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                          {tutorResult.evaluation.grammarIssues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tutorResult.evaluation.vocabularySuggestions?.length > 0 && (
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <h4 className="text-blue-400 font-semibold mb-2 text-sm">Vocabulary Improvements</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-300 text-xs">
                          {tutorResult.evaluation.vocabularySuggestions.map((sug: string, idx: number) => (
                            <li key={idx}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/50">
                      Score: {tutorResult.score}%
                    </span>
                    <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/50">
                      +{tutorResult.xpAwarded} XP
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={onNext}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-md transition-all"
                    >
                      Continue to Speaking
                    </button>
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          )}

          {/* 2. RENDER TAB: IMAGE DESCRIBER */}
          {activeFeature === "image" && imageChallenge && (
            <div className="space-y-6 animate-in fade-in">
              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <h3 className="text-[17px] font-bold text-foreground mb-2 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" /> Creative Scene Describer
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6">
                  {imageChallenge.content || "Study the scenery image below. Write a creative summary describing its mood, weather, lights, and items in at least 15 words."}
                </p>

                <div className="flex justify-center mb-6">
                  <img
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(imageChallenge.imagePrompt || imageChallenge.content || "A cozy library cafe")}`}
                    alt={imageChallenge.title || "Creative Scene to Describe"}
                    className="w-full max-w-md h-auto rounded-3xl border border-white/10 shadow-xl object-cover max-h-[220px]"
                  />
                </div>

                {!imageResult ? (
                  <div className="space-y-4">
                    <textarea
                      value={imageText}
                      onChange={(e) => setImageText(e.target.value)}
                      disabled={isImageSubmitting}
                      rows={4}
                      placeholder="Describe the cozy library cafe room, rainy streets, coffee cup details..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-[13px] text-foreground placeholder:text-zinc-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                    />

                    {imageError && (
                      <div className="text-[13px] text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                        {imageError}
                      </div>
                    )}

                    <button
                      onClick={submitImageDescription}
                      disabled={isImageSubmitting || !imageText.trim()}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow"
                    >
                      {isImageSubmitting ? "AI analyzing descriptions..." : "Verify Description"}
                    </button>
                  </div>
                ) : (
                  <div className="p-5 bg-purple-500/5 border border-purple-500/25 rounded-2xl space-y-3 animate-in fade-in">
                    <h4 className="font-bold text-[15px] text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" /> Summary Grade
                    </h4>
                    <p className="text-[13px] text-zinc-600 dark:text-gray-300 leading-relaxed">{imageResult.feedback}</p>
                    {imageResult.tamilFeedback && (
                      <p className="text-[13px] text-purple-600 dark:text-purple-300 italic">{imageResult.tamilFeedback}</p>
                    )}

                    {imageResult.improvedVersion && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1">
                        <span className="text-blue-400 font-semibold block">Improved AI Version:</span>
                        <p className="text-gray-300 italic">"{imageResult.improvedVersion}"</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-yellow-500 font-bold pt-3 border-t border-white/5">
                      <span>Score: {imageResult.score}% (+{imageResult.xpAwarded} XP)</span>
                      <button onClick={resetImageDescriber} className="text-purple-400 hover:underline">
                        Rewrite Summary
                      </button>
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            </div>
          )}

          {/* 3. RENDER TAB: NO-FILTER REWRITE */}
          {activeFeature === "filter" && rewriteChallenge && (
            <div className="space-y-6 max-w-lg mx-auto animate-in fade-in">
              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[17px] font-bold text-foreground flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-400 animate-pulse" /> No-Filter Constraints
                  </h3>
                </div>

                <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Rewrite the simple sentence below. Make it engaging, but you <strong className="text-orange-500 dark:text-orange-400 font-semibold">cannot use basic filter words</strong>.
                </p>

                <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl space-y-2 mb-6">
                  <span className="text-[10px] text-zinc-500 dark:text-gray-400 font-bold uppercase tracking-wider block">Boring Sentence:</span>
                  <p className="text-foreground text-[15px] font-semibold">"{rewriteChallenge.content}"</p>
                </div>

                {/* Banned word tokens */}
                <div className="mb-6 space-y-2">
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">Banned Filter Words:</span>
                  <div className="flex flex-wrap gap-2">
                    {bannedWords.map((w: string) => (
                      <span key={w} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-xs font-bold">
                        🚫 {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hints list */}
                {Object.keys(hints).length > 0 && (
                  <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl mb-6 space-y-2">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Vocab Suggestions (Hints):</span>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {Object.entries(hints).map(([key, words]: [string, any]) => (
                        <div key={key} className="flex items-start gap-1">
                          <span className="text-gray-400 font-bold capitalize select-none">{key} alternatives:</span>
                          <span className="text-purple-200">{Array.isArray(words) ? words.join(", ") : String(words)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filterError && (
                  <div className="text-[13px] text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 mb-4">
                    {filterError}
                  </div>
                )}

                {!filterResult ? (
                  <div className="space-y-4">
                    <textarea
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      rows={3}
                      placeholder="Enter your advanced rewrite here..."
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-[13px] text-foreground focus:outline-none focus:border-purple-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                    />

                    {/* Real time validations */}
                    <div className="space-y-2 p-3 bg-black/5 dark:bg-black/30 rounded-xl border border-black/10 dark:border-white/5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {violatedWords.length === 0 ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={violatedWords.length === 0 ? "text-green-300" : "text-red-400"}>
                          {violatedWords.length === 0
                            ? "Does not contain banned words"
                            : `Contains banned word(s): ${violatedWords.join(", ")}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {hasTextLength ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={hasTextLength ? "text-green-300" : "text-gray-500"}>
                          Length is at least 15 characters
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={submitFilterRewrite}
                      disabled={!isFilterValid || isFilterSubmitting}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow"
                    >
                      {isFilterSubmitting ? "AI verifying rewrite..." : "Verify Rewrite"}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 border border-green-500/25 rounded-2xl space-y-3 animate-in fade-in">
                    <h4 className="font-bold text-[15px] text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Rewrite Evaluated!
                    </h4>
                    <p className="text-[13px] text-zinc-600 dark:text-gray-200 leading-relaxed">
                      {filterResult.feedback}
                    </p>
                    {filterResult.tamilFeedback && (
                      <p className="text-[13px] text-purple-600 dark:text-purple-300 italic">{filterResult.tamilFeedback}</p>
                    )}

                    <div className="flex justify-between items-center text-[13px] text-yellow-600 dark:text-yellow-500 font-bold pt-3 border-t border-black/5 dark:border-white/5">
                      <span>Score: {filterResult.score}% (+{filterResult.xpAwarded} XP Earned)</span>
                      <button onClick={resetFilterRewrite} className="text-purple-400 hover:underline">
                        Try another sentence
                      </button>
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
