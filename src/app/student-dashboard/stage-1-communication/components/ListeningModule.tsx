"use client";

import { useState, useEffect, useRef } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { ChallengeSkeleton } from "./ChallengeSkeleton";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { DifficultyPicker, Difficulty } from "./DifficultyPicker";
import Image from "next/image";
import { useMCQ } from "../hooks/useMCQ";
import { Stage1ContentDTO } from "@/types/communication";
import { 
  Volume2, 
  VolumeX, 
  Compass, 
  Smile, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Undo2, 
  CheckCircle2, 
  XCircle,
  Play,
  Check,
  PenTool,
  ChevronLeft,
  Mic,
  ArrowUp, ArrowDown, ArrowLeft, MapPin, Flag, Navigation
} from "lucide-react";

interface ListeningModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onNext: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
  difficulty?: string;
  onComplete?: (score: number, timeSec: number) => void;
}

export function ListeningModule({ content, challenges = [], onNext, onSubFeatureOpen, onComplete }: ListeningModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"mcq" | "fill" | "directions" | "tone" | null>(null);
  const [pendingFeature, setPendingFeature] = useState<"mcq" | "fill" | "directions" | "tone" | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedMcqAudio, setHasPlayedMcqAudio] = useState(false);
  const [showMcqQuestions, setShowMcqQuestions] = useState(false);

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null || pendingFeature !== null);
    }
  }, [activeFeature, pendingFeature, onSubFeatureOpen]);

  // Find corresponding seeded challenges
  const fallbackChallenge = challenges.find(c => {
    try {
      const q = typeof c.questions === "string" ? JSON.parse(c.questions) : c.questions;
      return Array.isArray(q) && q.length > 0 && !q[0].isDirection && !q[0].isToneAnalysis;
    } catch { return false; }
  }) || content;

  const [dynamicMcqChallenge, setDynamicMcqChallenge] = useState<any>(null);
  const [isLoadingMcq, setIsLoadingMcq] = useState(false);

  const directionsChallenge = challenges.find(c => {
    try {
      const q = typeof c.questions === "string" ? JSON.parse(c.questions) : c.questions;
      return q && q.isDirection === true;
    } catch { return false; }
  });

  const toneChallenge = challenges.find(c => {
    try {
      const q = typeof c.questions === "string" ? JSON.parse(c.questions) : c.questions;
      return q && q.isToneAnalysis === true;
    } catch { return false; }
  });

  // MCQ Hook state
  const {
    answers: mcqAnswers,
    handleOptionSelect: handleMCQOptionSelect,
    submitAnswers: submitMCQAnswers,
    isSubmitting: isMCQSubmitting,
    result: mcqResult,
    error: mcqError,
    reset: resetMCQ
  } = useMCQ(dynamicMcqChallenge);

  const loadDynamicMcq = async () => {
    setIsLoadingMcq(true);
    setDynamicMcqChallenge(null);
    setHasPlayedMcqAudio(false);
    setShowMcqQuestions(false);
    resetMCQ();
    try {
      const res = await fetch("/api/communication/generate-listening-mcq", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data && data.questions) {
        setDynamicMcqChallenge(data);
      } else {
        setDynamicMcqChallenge(fallbackChallenge);
      }
    } catch (e) {
      console.error("Failed to load dynamic MCQ:", e);
      setDynamicMcqChallenge(fallbackChallenge);
    } finally {
      setIsLoadingMcq(false);
    }
  };

  // Audio speech synthesis helper
  const speakText = (text: string, onEnd?: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // ----------------------------------------------------
  // LISTEN & GO GAME LOGIC
  // ----------------------------------------------------
  const [isListenGoLoading, setIsListenGoLoading] = useState(false);
  const [dynamicListenGoData, setDynamicListenGoData] = useState<any>(null);
  const [playerPos, setPlayerPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [pathTrail, setPathTrail] = useState<{ x: number, y: number }[]>([]);
  const [isListenGoSubmitted, setIsListenGoSubmitted] = useState(false);
  const [listenGoResult, setListenGoResult] = useState<any>(null);
  const [hasPlayedGoAudio, setHasPlayedGoAudio] = useState(false);
  const [showGoQuestions, setShowGoQuestions] = useState(false);

  const loadListenGo = async () => {
    setIsListenGoLoading(true);
    setDynamicListenGoData(null);
    setListenGoResult(null);
    setIsListenGoSubmitted(false);
    setPathTrail([]);
    setHasPlayedGoAudio(false);
    setShowGoQuestions(false);
    
    try {
      const res = await fetch("/api/communication/generate-listen-go", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setDynamicListenGoData(data);
        setPlayerPos(data.startPos);
        setPathTrail([data.startPos]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsListenGoLoading(false);
    }
  };

  const movePlayer = (dx: number, dy: number) => {
    if (!dynamicListenGoData || isListenGoSubmitted) return;
    
    const { gridSize } = dynamicListenGoData;
    const nextX = playerPos.x + dx;
    const nextY = playerPos.y + dy;

    if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
      const newPos = { x: nextX, y: nextY };
      setPlayerPos(newPos);
      setPathTrail(prev => [...prev, newPos]);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeFeature !== "directions" || !dynamicListenGoData || isListenGoSubmitted) return;
      
      switch(e.key) {
        case "ArrowUp": movePlayer(0, -1); break;
        case "ArrowDown": movePlayer(0, 1); break;
        case "ArrowLeft": movePlayer(-1, 0); break;
        case "ArrowRight": movePlayer(1, 0); break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFeature, dynamicListenGoData, isListenGoSubmitted, playerPos]);

  const verifyListenGo = async () => {
    if (!dynamicListenGoData) return;
    
    setIsListenGoSubmitted(true);
    
    const { endPos } = dynamicListenGoData;
    const isCorrect = playerPos.x === endPos.x && playerPos.y === endPos.y;
    
    // Simple local evaluation for this game
    if (isCorrect) {
      setListenGoResult({
        success: true,
        feedback: "Awesome! You arrived at the exact correct destination.",
        tamilFeedback: "அருமை! நீங்கள் சரியான இடத்தை அடைந்துவிட்டீர்கள்.",
        xpAwarded: 15,
        score: 100
      });
    } else {
      setListenGoResult({
        success: false,
        feedback: "Oops! That's not the right destination. Let's try another route.",
        tamilFeedback: "ஐயோ! இது சரியான இடமல்ல. மீண்டும் முயற்சி செய்யலாம்.",
        xpAwarded: 5,
        score: 0
      });
    }
  };

  const undoListenGo = () => {
    if (pathTrail.length > 1) {
      const newTrail = [...pathTrail];
      newTrail.pop();
      setPathTrail(newTrail);
      setPlayerPos(newTrail[newTrail.length - 1]);
    }
  };

  // Ensure game is loaded when opened
  useEffect(() => {
    if (activeFeature === "directions" && !dynamicListenGoData && !isListenGoLoading) {
      loadListenGo();
    }
  }, [activeFeature]);

  // ----------------------------------------------------
  // VOICE TONE ANALYSIS LOGIC
  // ----------------------------------------------------
  const [toneSelectedIdx, setToneSelectedIdx] = useState<number | null>(null);
  const [isToneSubmitted, setIsToneSubmitted] = useState(false);
  const [toneResult, setToneResult] = useState<any>(null);
  const [isEvaluatingTone, setIsEvaluatingTone] = useState(false);

  const parsedTone = toneChallenge
    ? (typeof toneChallenge.questions === "string" ? JSON.parse(toneChallenge.questions) : toneChallenge.questions)
    : null;

  const submitToneChoice = async () => {
    if (toneSelectedIdx === null || !toneChallenge || !parsedTone) return;

    setIsEvaluatingTone(true);
    try {
      const selectedTone = parsedTone.options[toneSelectedIdx];
      const correctTone = parsedTone.options[parsedTone.correctIndex];

      const res = await fetch("/api/communication/evaluate-tone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: toneChallenge.id,
          selectedTone,
          correctTone
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsToneSubmitted(true);
        setToneResult({
          correct: data.correct,
          score: data.score,
          xpAwarded: data.xpAwarded,
          feedback: data.feedback,
          tamilFeedback: data.tamilFeedback
        });
      }
    } catch (e) {
      console.error("Failed to evaluate tone selection:", e);
    } finally {
      setIsEvaluatingTone(false);
    }
  };

  // ----------------------------------------------------
  // GAP FILL / FILL THE BEATS LOGIC
  // ----------------------------------------------------
  const [gapAnswers, setGapAnswers] = useState<Record<number, string>>({});
  const [isGapSubmitted, setIsGapSubmitted] = useState(false);
  const [gapResult, setGapResult] = useState<any>(null);
  const [isEvaluatingGap, setIsEvaluatingGap] = useState(false);
  const [dynamicGapChallenge, setDynamicGapChallenge] = useState<any>(null);
  const [isLoadingGap, setIsLoadingGap] = useState(false);
  const [hasPlayedGapAudio, setHasPlayedGapAudio] = useState(false);
  const [showGapQuestions, setShowGapQuestions] = useState(false);

  const loadDynamicGap = async () => {
    setIsLoadingGap(true);
    setDynamicGapChallenge(null);
    setGapAnswers({});
    setIsGapSubmitted(false);
    setGapResult(null);
    setHasPlayedGapAudio(false);
    setShowGapQuestions(false);
    try {
      const res = await fetch("/api/communication/generate-gap-fill", {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data && data.displaySegments) {
        setDynamicGapChallenge(data);
      }
    } catch (e) {
      console.error("Failed to load dynamic gap fill:", e);
    } finally {
      setIsLoadingGap(false);
    }
  };

  const handleGapAnswerChange = (qIndex: number, val: string) => {
    setGapAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const submitGapAnswers = async () => {
    if (!fallbackChallenge || !dynamicGapChallenge) return;
    setIsEvaluatingGap(true);

    try {
      const correctAnswers = dynamicGapChallenge.correctAnswers || [];
      const userAnswers = correctAnswers.map((_: any, idx: number) => gapAnswers[idx] || "");

      const res = await fetch("/api/communication/evaluate-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: fallbackChallenge.id,
          userAnswers,
          correctAnswers
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsGapSubmitted(true);
        const newResult: any = {
          score: data.score,
          xpAwarded: data.xpAwarded,
          feedback: data.feedback,
          tamilFeedback: data.tamilFeedback,
          correctStatus: []
        };
        for (let i = 0; i < correctAnswers.length; i++) {
          const ans = (gapAnswers[i] || "").toLowerCase().trim();
          const corr = (correctAnswers[i] || "").toLowerCase().trim();
          newResult.correctStatus.push(ans === corr || corr.includes(ans) || ans.includes(corr));
        }
        setGapResult(newResult);
      }
    } catch (e) {
      console.error("Failed to evaluate gap fill:", e);
    } finally {
      setIsEvaluatingGap(false);
    }
  };

  // Difficulty Picker
  if (pendingFeature) {
    const titles: Record<string, string> = {
      "mcq": "Listen and Answer",
      "fill": "Fill in the Blanks",
      "directions": "Follow Directions",
      "tone": "Emotion & Tone"
    };
    return (
      <DifficultyPicker 
        title={titles[pendingFeature] || "Select Difficulty"}
        onSelect={(diff) => {
          setDifficulty(diff);
          setActiveFeature(pendingFeature);
          setPendingFeature(null);
          // Trigger loads if needed
          if (pendingFeature === "mcq") {
            loadDynamicMcq();
          } else if (pendingFeature === "fill") {
            loadDynamicGap();
          }
        }}
        onBack={() => setPendingFeature(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Feature Menu: 1. Listen & Go, 2. Words fill in, 3. Listen & Answer */}
      {!activeFeature && !pendingFeature && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {/* Module 1: Listen & Go */}
          <button
            onClick={() => { setPendingFeature("directions"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <Image 
                  src="/images/communication/listening.png" 
                  alt="Listen & Go"
                  fill
                  className="object-contain dark:mix-blend-screen filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]"
                  sizes="(max-width: 768px) 64px, 80px"
                  priority
                />
              </div>
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Listen & Go
            </span>
          </button>
          
          {/* Module 2: Words fill in */}
          <button
            onClick={() => { setPendingFeature("fill"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <Image 
                  src="/images/communication/listening.png" 
                  alt="Words fill in"
                  fill
                  className="object-contain dark:mix-blend-screen filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]"
                  sizes="(max-width: 768px) 64px, 80px"
                  priority
                />
              </div>
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Words fill in
            </span>
          </button>

          {/* Module 3: Listen & Answer */}
          <button
            onClick={() => { setPendingFeature("mcq"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 neu-convex rounded-[2rem] hover:scale-[1.02] transition-all duration-300 dark:bg-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center neu-raised-sm dark:bg-indigo-950/30 dark:border-2 dark:border-indigo-400/20 transition-all duration-300 group-hover:scale-110 shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                <Image 
                  src="/images/communication/listening.png" 
                  alt="Listen & Answer"
                  fill
                  className="object-contain dark:mix-blend-screen filter drop-shadow-[0_4px_12px_rgba(129,140,248,0.4)]"
                  sizes="(max-width: 768px) 64px, 80px"
                  priority
                />
              </div>
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Listen & Answer
            </span>
          </button>
        </div>
      )}

      {activeFeature && (
        <div>
          <div className="mb-6 flex items-center">
            <button
              onClick={() => { setActiveFeature(null); stopAudio(); }}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
              aria-label="Back to Listening Options"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* RENDER FEATURE: PASSAGE MCQ (Listen & Answer) */}
          {activeFeature === "mcq" && (
            <div className="space-y-6">
              {isLoadingMcq ? (
                <ChallengeSkeleton variant="listening-mcq" />
              ) : dynamicMcqChallenge ? (
                <div className="space-y-6 animate-in fade-in">
                  {/* Step 1: Play Audio Card - Only visible before user clicks Take Test */}
                  {!showMcqQuestions ? (
                    <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center text-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
                      <h2 className="text-[24px] font-bold text-foreground mb-8 text-center w-full">
                        {dynamicMcqChallenge.title || "Listen & Answer"}
                      </h2>
                      
                      <div className="flex flex-col items-center justify-center w-full my-2">
                        <button
                          onClick={() => {
                            speakText(dynamicMcqChallenge.content || "", () => setHasPlayedMcqAudio(true));
                          }}
                          disabled={isPlaying || hasPlayedMcqAudio}
                          className={`h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center transition-all duration-500 mx-auto ${
                            isPlaying 
                              ? "bg-indigo-600 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(139,92,246,0.6)] scale-110" 
                              : hasPlayedMcqAudio
                                ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-60"
                                : "bg-indigo-500/20 hover:bg-indigo-500/30 hover:scale-105 border border-indigo-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                          }`}
                          aria-label="Play Audio"
                        >
                          {isPlaying ? (
                            <div className="flex gap-1.5 items-center justify-center">
                              <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
                              <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
                              <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
                            </div>
                          ) : (
                            <Play className={`h-12 w-12 ml-1 ${hasPlayedMcqAudio ? "text-zinc-400 dark:text-zinc-500" : "text-indigo-400"}`} />
                          )}
                        </button>
                        <p className="mt-5 text-zinc-500 dark:text-gray-400 font-medium text-[15px] text-center w-full">
                          {isPlaying 
                            ? "Playing audio passage..." 
                            : hasPlayedMcqAudio 
                              ? "Audio finished! You can only play it once. Click Take Test below." 
                              : "Click to play audio"}
                        </p>
                      </div>

                      {/* Take Test Button - Appears once audio has played */}
                      {hasPlayedMcqAudio && (
                        <button
                          onClick={() => {
                            stopAudio();
                            setShowMcqQuestions(true);
                          }}
                          className="mt-8 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[16px] shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 mx-auto"
                        >
                          <span>Take Test</span>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      )}
                    </LiquidGlassCard>
                  ) : (
                    /* Step 2: 3 Questions Box - Shown when Take Test is clicked */
                    <div className="space-y-6 animate-in fade-in">
                      <div className="space-y-6">
                        <h3 className="text-[19px] font-bold text-foreground">Answer the Questions</h3>
                        {Array.isArray(dynamicMcqChallenge.questions) && dynamicMcqChallenge.questions.map((q: any, qIndex: number) => {
                          const isSubmitted = mcqResult !== null;
                          
                          return (
                            <LiquidGlassCard key={q.id || qIndex} className="p-5 border-black/10 dark:border-white/10 animate-in fade-in" accentColor="#6366f1">
                              <div className="text-foreground mb-4 font-medium text-[17px]">
                                Q{qIndex + 1}: {q.question}
                              </div>
                              <div className="space-y-3">
                                {q.options?.map((opt: string, idx: number) => {
                                  const isOptionSelected = mcqAnswers[q.id] === idx;
                                  const isCorrect = isSubmitted && idx === q.correctIndex;
                                  const isWrong = isSubmitted && isOptionSelected && idx !== q.correctIndex;

                                  let btnStyle = "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-300";
                                  if (isOptionSelected && !isSubmitted) {
                                    btnStyle = "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-white font-semibold";
                                  } else if (isCorrect) {
                                    btnStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-300 font-semibold";
                                  } else if (isWrong) {
                                    btnStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300";
                                  }

                                  return (
                                    <button
                                      key={idx}
                                      disabled={isSubmitted}
                                      onClick={() => handleMCQOptionSelect(q.id, idx)}
                                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 ${btnStyle} text-[15px]`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </LiquidGlassCard>
                          );
                        })}
                      </div>

                      {mcqError && <div className="text-red-400 text-sm">{mcqError}</div>}

                      {mcqResult ? (
                        <LiquidGlassCard className="p-6 border-indigo-500 bg-indigo-500/5 animate-in slide-in-from-bottom" accentColor="#6366f1">
                          <h3 className="text-[22px] font-bold text-foreground mb-2">Results</h3>
                          <p className="text-zinc-600 dark:text-gray-300 mb-2 text-[17px]">{mcqResult.feedback}</p>
                          {mcqResult.tamilFeedback && (
                            <p className="text-indigo-600 dark:text-indigo-300 text-[15px] italic mb-4">{mcqResult.tamilFeedback}</p>
                          )}
                          <div className="flex items-center gap-4 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 font-bold">
                              Score: {mcqResult.score}%
                            </span>
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 font-bold">
                              +{mcqResult.xpAwarded} XP
                            </span>
                            <div className="flex-1" />
                            <button
                              onClick={loadDynamicMcq}
                              className="px-6 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#5254cc] text-white font-medium shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                            >
                              Next Passage
                            </button>
                          </div>
                        </LiquidGlassCard>
                      ) : (
                        <button
                          onClick={submitMCQAnswers}
                          disabled={isMCQSubmitting}
                          className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isMCQSubmitting ? "Evaluating..." : "Submit Answers"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-red-400 text-center py-10">Failed to load dynamic lesson. Please go back and try again.</div>
              )}
            </div>
          )}


      {/* RENDER FEATURE 2: WORDS FILL IN / GAP FILL */}
      {activeFeature === "fill" && (
        <div className="space-y-6">
          {isLoadingGap ? (
            <ChallengeSkeleton variant="listening-fill" />
          ) : dynamicGapChallenge ? (
            <div className="space-y-6 animate-in fade-in">
              {!showGapQuestions ? (
                <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center text-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
                  <h2 className="text-[24px] font-bold text-foreground mb-8 text-center w-full">
                    Words fill in
                  </h2>
                  
                  <div className="flex flex-col items-center justify-center w-full my-2">
                    <button
                      onClick={() => {
                        speakText(dynamicGapChallenge.fullText || "", () => setHasPlayedGapAudio(true));
                      }}
                      disabled={isPlaying || hasPlayedGapAudio}
                      className={`h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center transition-all duration-500 mx-auto ${
                        isPlaying 
                          ? "bg-indigo-600 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(139,92,246,0.6)] scale-110" 
                          : hasPlayedGapAudio
                            ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-60"
                            : "bg-indigo-500/20 hover:bg-indigo-500/30 hover:scale-105 border border-indigo-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      }`}
                      aria-label="Play Audio"
                    >
                      {isPlaying ? (
                        <div className="flex gap-1.5 items-center justify-center">
                          <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
                          <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
                          <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Play className={`h-12 w-12 ml-1 ${hasPlayedGapAudio ? "text-zinc-400 dark:text-zinc-500" : "text-indigo-400"}`} />
                      )}
                    </button>
                    <p className="mt-5 text-zinc-500 dark:text-gray-400 font-medium text-[15px] text-center w-full">
                      {isPlaying 
                        ? "Playing audio passage..." 
                        : hasPlayedGapAudio 
                          ? "Audio finished! You can only play it once. Click Take Test below." 
                          : "Click to play audio"}
                    </p>
                  </div>

                  {/* Take Test Button - Appears once audio has played */}
                  {hasPlayedGapAudio && (
                    <button
                      onClick={() => {
                        stopAudio();
                        setShowGapQuestions(true);
                      }}
                      className="mt-8 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[16px] shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 mx-auto"
                    >
                      <span>Take Test</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </LiquidGlassCard>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <LiquidGlassCard className="p-6 border-black/10 dark:border-white/10" accentColor="#6366f1">
                    <div className="space-y-6">
                      <div className="text-[17px] text-foreground leading-relaxed text-center">
                        {dynamicGapChallenge.displaySegments.map((seg: any, idx: number) => {
                          if (seg.type === "text") {
                            return <span key={idx}>{seg.value}</span>;
                          } else {
                            // Segments have sequential gap IDs
                            const gapIndex = dynamicGapChallenge.displaySegments.filter((s:any) => s.type === "gap").findIndex((s:any) => s === seg);
                            return (
                              <input 
                                key={idx}
                                type="text" 
                                value={gapAnswers[gapIndex] || ""} 
                                onChange={(e) => handleGapAnswerChange(gapIndex, e.target.value)} 
                                disabled={isGapSubmitted} 
                                className="w-24 bg-black/5 dark:bg-white/5 border-b-2 border-indigo-500 focus:outline-none text-center mx-2 py-1 font-semibold text-indigo-600 dark:text-indigo-300" 
                              />
                            );
                          }
                        })}
                      </div>
                      {isGapSubmitted && (
                        <div className="mt-4 flex flex-col gap-2 items-center text-sm font-medium">
                          {dynamicGapChallenge.correctAnswers.map((corr: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-1.5">
                               <span>Blank {idx + 1} ("{corr}"):</span>
                               {gapResult.correctStatus[idx] ? <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Correct</span> : <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4"/> Incorrect</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </LiquidGlassCard>

                  {isGapSubmitted ? (
                    <LiquidGlassCard className="p-6 border-green-500/30 bg-green-500/5" accentColor="#22c55e">
                      <h3 className="text-[17px] font-bold text-foreground mb-2">Quiz Summary</h3>
                      <p className="text-zinc-500 dark:text-gray-300 text-[15px] mb-2">{gapResult.feedback}</p>
                      {gapResult.tamilFeedback && (
                        <p className="text-indigo-600 dark:text-indigo-300 text-[14px] italic mb-4">{gapResult.tamilFeedback}</p>
                      )}
                      <div className="flex gap-4 items-center">
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-300 rounded-full text-[13px] font-bold">
                          Score: {gapResult.score}%
                        </span>
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                          +{gapResult.xpAwarded} XP
                        </span>
                        <div className="flex-1" />
                        <button
                          onClick={loadDynamicGap}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </LiquidGlassCard>
                  ) : (
                    <button
                      onClick={submitGapAnswers}
                      disabled={dynamicGapChallenge.correctAnswers.some((_:any, idx:number) => !gapAnswers[idx]) || isEvaluatingGap}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
                    >
                      {isEvaluatingGap ? "Evaluating..." : "Submit"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-400 text-center py-10">Failed to load dynamic lesson. Please try again.</div>
          )}
        </div>
      )}

      {/* RENDER FEATURE 3: LISTEN & GO GAME */}
      {activeFeature === "directions" && (
        <div className="space-y-6">
          {isListenGoLoading ? (
            <ChallengeSkeleton variant="listening-go" />
          ) : dynamicListenGoData ? (
            <div className="space-y-6 animate-in fade-in">
              {!showGoQuestions ? (
                <LiquidGlassCard className="p-8 md:p-12 flex flex-col items-center justify-center text-center border-indigo-500/20 max-w-xl mx-auto w-full" accentColor="#6366f1">
                  <h2 className="text-[24px] font-bold text-foreground mb-8 text-center w-full flex items-center justify-center gap-2">
                    <Navigation className="w-6 h-6 text-indigo-400" /> Listen & Go
                  </h2>
                  
                  <div className="flex flex-col items-center justify-center w-full my-2">
                    <button
                      onClick={() => {
                        speakText(dynamicListenGoData.audioText || "", () => setHasPlayedGoAudio(true));
                      }}
                      disabled={isPlaying || hasPlayedGoAudio}
                      className={`h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center transition-all duration-500 mx-auto ${
                        isPlaying 
                          ? "bg-indigo-600 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(139,92,246,0.6)] scale-110" 
                          : hasPlayedGoAudio
                            ? "bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-60"
                            : "bg-indigo-500/20 hover:bg-indigo-500/30 hover:scale-105 border border-indigo-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      }`}
                      aria-label="Play Navigation Audio"
                    >
                      {isPlaying ? (
                        <div className="flex gap-1.5 items-center justify-center">
                          <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
                          <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
                          <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Play className={`h-12 w-12 ml-1 ${hasPlayedGoAudio ? "text-zinc-400 dark:text-zinc-500" : "text-indigo-400"}`} />
                      )}
                    </button>
                    <p className="mt-5 text-zinc-500 dark:text-gray-400 font-medium text-[15px] text-center w-full">
                      {isPlaying 
                        ? "Playing navigation directions..." 
                        : hasPlayedGoAudio 
                          ? "Audio finished! You can only play it once. Click Take Test below." 
                          : "Click to play navigation directions"}
                    </p>
                  </div>

                  {/* Take Test Button - Appears once audio has played */}
                  {hasPlayedGoAudio && (
                    <button
                      onClick={() => {
                        stopAudio();
                        setShowGoQuestions(true);
                      }}
                      className="mt-8 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[16px] shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95 mx-auto"
                    >
                      <span>Take Test</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </LiquidGlassCard>
              ) : (
                <LiquidGlassCard className="p-6 md:p-8 animate-in fade-in" accentColor="#6366f1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[17px] font-bold text-foreground flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-indigo-400" /> Listen & Go
                    </h3>
                  </div>

                  <p className="text-[15px] text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Navigate your way on the grid map to the correct destination!
                  </p>

                  <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 justify-center">
                    {/* 5x5 Game Grid */}
                    <div 
                      className="grid gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 shadow-inner"
                      style={{ gridTemplateColumns: `repeat(${dynamicListenGoData.gridSize}, minmax(0, 1fr))` }}
                    >
                      {Array.from({ length: dynamicListenGoData.gridSize * dynamicListenGoData.gridSize }).map((_, index) => {
                        const x = index % dynamicListenGoData.gridSize;
                        const y = Math.floor(index / dynamicListenGoData.gridSize);
                        
                        const isPlayerHere = playerPos.x === x && playerPos.y === y;
                        const isStart = dynamicListenGoData.startPos.x === x && dynamicListenGoData.startPos.y === y;
                        const isVisited = pathTrail.some(pt => pt.x === x && pt.y === y);

                        // If submitted, show the endPos with a flag
                        const isEndPos = isListenGoSubmitted && dynamicListenGoData.endPos.x === x && dynamicListenGoData.endPos.y === y;
                        
                        return (
                          <div 
                            key={index}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${
                              isPlayerHere 
                                ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)] scale-110 z-10" 
                                : isVisited 
                                  ? "bg-indigo-500/20 border-indigo-500/30 border" 
                                  : "bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5"
                            }`}
                          >
                            {isPlayerHere && <Navigation className="w-6 h-6 animate-pulse" />}
                            {!isPlayerHere && isStart && <MapPin className="w-5 h-5 text-green-500 opacity-50" />}
                            {isEndPos && <Flag className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* D-Pad Controls */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-sm font-semibold text-zinc-500 dark:text-gray-400 mb-2">Navigation</div>
                      <button onClick={() => movePlayer(0, -1)} disabled={isListenGoSubmitted} className="w-14 h-14 bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50">
                        <ArrowUp className="w-6 h-6 text-foreground" />
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => movePlayer(-1, 0)} disabled={isListenGoSubmitted} className="w-14 h-14 bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50">
                          <ArrowLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <button onClick={undoListenGo} disabled={pathTrail.length <= 1 || isListenGoSubmitted} className="w-14 h-14 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-30">
                          <Undo2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => movePlayer(1, 0)} disabled={isListenGoSubmitted} className="w-14 h-14 bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50">
                          <ArrowRight className="w-6 h-6 text-foreground" />
                        </button>
                      </div>
                      <button onClick={() => movePlayer(0, 1)} disabled={isListenGoSubmitted} className="w-14 h-14 bg-black/5 dark:bg-white/5 hover:bg-indigo-500/20 border border-black/10 dark:border-white/10 rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50">
                        <ArrowDown className="w-6 h-6 text-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Status and Action Buttons */}
                  <div className="mt-10">
                    {listenGoResult ? (
                      <LiquidGlassCard className={`p-5 ${listenGoResult.success ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5'} animate-in slide-in-from-bottom`} accentColor={listenGoResult.success ? "#22c55e" : "#ef4444"}>
                        <h3 className="text-[18px] font-bold text-foreground mb-2">{listenGoResult.success ? "Mission Accomplished!" : "Wrong Destination"}</h3>
                        <p className="text-zinc-600 dark:text-gray-300 mb-2 text-[15px]">{listenGoResult.feedback}</p>
                        {listenGoResult.tamilFeedback && (
                          <p className="text-indigo-600 dark:text-indigo-300 text-[14px] italic mb-4">{listenGoResult.tamilFeedback}</p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {listenGoResult.success && (
                            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 font-bold text-sm">
                              +{listenGoResult.xpAwarded} XP
                            </span>
                          )}
                          <div className="flex-1" />
                          <button
                            onClick={loadListenGo}
                              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm"
                          >
                            Next
                          </button>
                        </div>
                      </LiquidGlassCard>
                    ) : (
                      <button
                        onClick={verifyListenGo}
                        disabled={isListenGoSubmitted}
                        className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        Verify Location
                      </button>
                    )}
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          ) : (
            <div className="text-red-400 text-center py-10">Failed to load mission. Please go back and try again.</div>
          )}
        </div>
      )}

      {/* RENDER FEATURE 4: VOICE TONE ANALYSIS */}
      {activeFeature === "tone" && toneChallenge && (
        <div className="space-y-6 max-w-lg mx-auto">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#6366f1">
            <h3 className="text-[17px] font-bold text-foreground mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-indigo-400" /> Speech Tone analysis
            </h3>

            <p className="text-zinc-500 dark:text-gray-400 text-[15px] mb-6">
              Listen to the speech statement below. Can you identify the emotional tone of the speaker?
            </p>

            <button
              onClick={() => speakText(toneChallenge.content)}
              disabled={isPlaying}
              className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
                isPlaying ? "bg-indigo-600 animate-pulse" : "bg-indigo-500/20 hover:bg-indigo-500/30"
              }`}
            >
              <Play className="w-8 h-8 text-indigo-400" />
            </button>

            <div className="grid grid-cols-1 gap-3">
              {parsedTone.options.map((option: string, idx: number) => {
                let btnStyle = "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-300";
                
                if (isToneSubmitted) {
                  if (idx === parsedTone.correctIndex) {
                    btnStyle = "bg-green-500/10 border-green-500 text-green-600 dark:text-green-300 pointer-events-none";
                  } else if (idx === toneSelectedIdx) {
                    btnStyle = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-300 pointer-events-none";
                  } else {
                    btnStyle = "border-black/5 dark:border-white/5 text-zinc-400 dark:text-gray-500 pointer-events-none opacity-45";
                  }
                } else if (toneSelectedIdx === idx) {
                  btnStyle = "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-300";
                }

                return (
                  <button
                    key={idx}
                    disabled={isToneSubmitted}
                    onClick={() => setToneSelectedIdx(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

             {!isToneSubmitted ? (
              <button
                onClick={submitToneChoice}
                disabled={toneSelectedIdx === null || isEvaluatingTone}
                className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all"
              >
                {isEvaluatingTone ? "Evaluating..." : "Submit Selection"}
              </button>
            ) : (
              <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl space-y-3">
                <p className="text-[13.5px] text-gray-900 dark:text-gray-100 leading-relaxed font-medium">{toneResult.feedback}</p>
                {toneResult.tamilFeedback && (
                  <p className="text-[13.5px] text-blue-700 dark:text-indigo-300 leading-relaxed font-medium italic">{toneResult.tamilFeedback}</p>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-400">XP Awarded: +{toneResult.xpAwarded}</span>
                  <button 
                    onClick={() => { setIsToneSubmitted(false); setToneSelectedIdx(null); setToneResult(null); }}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
                  >
                    Next
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
