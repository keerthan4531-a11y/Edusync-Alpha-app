"use client";

import { useState, useEffect, useRef } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useMCQ } from "../hooks/useMCQ";
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
  ChevronLeft
} from "lucide-react";

interface ListeningModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onNext: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
}

export function ListeningModule({ content, challenges = [], onNext, onSubFeatureOpen }: ListeningModuleProps) {
  const [mcqChallenge, setMcqChallenge] = useState<Stage1ContentDTO | null>(null);
  const [fillChallenge, setFillChallenge] = useState<Stage1ContentDTO | null>(null);
  const [directionsChallenge, setDirectionsChallenge] = useState<Stage1ContentDTO | null>(null);
  const [toneChallenge, setToneChallenge] = useState<Stage1ContentDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChallenges() {
      try {
        setLoading(true);
        const [mcqRes, fillRes, directionsRes, toneRes] = await Promise.all([
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "LISTENING" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "LISTENING_FILL" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "LISTENING_DIRECTIONS" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "LISTENING_TONE" })
          }).then(r => r.json())
        ]);

        if (mcqRes.success) setMcqChallenge(mcqRes.challenge);
        if (fillRes.success) setFillChallenge(fillRes.challenge);
        if (directionsRes.success) setDirectionsChallenge(directionsRes.challenge);
        if (toneRes.success) setToneChallenge(toneRes.challenge);
      } catch (err) {
        console.error("Failed to generate listening challenges", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllChallenges();
  }, []);

  const [activeFeature, setActiveFeature] = useState<"mcq" | "fill" | "directions" | "tone" | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null);
    }
  }, [activeFeature, onSubFeatureOpen]);

  // MCQ Hook state
  const {
    answers: mcqAnswers,
    handleOptionSelect: handleMCQOptionSelect,
    submitAnswers: submitMCQAnswers,
    isSubmitting: isMCQSubmitting,
    result: mcqResult,
    error: mcqError
  } = useMCQ(mcqChallenge);

  // Tone Analyzer Hook state
  const {
    answers: toneAnswers,
    handleOptionSelect: handleToneOptionSelect,
    submitAnswers: submitToneAnswers,
    isSubmitting: isToneSubmitting,
    result: toneResult,
    error: toneError,
    reset: resetToneAnswers
  } = useMCQ(toneChallenge);

  // Audio speech synthesis helper
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // ----------------------------------------------------
  // GRID DIRECTIONS PANEL LOGIC
  // ----------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tracedPath, setTracedPath] = useState<{ row: number; col: number }[]>([]);
  const [directionsStatus, setDirectionsStatus] = useState<string | null>(null);
  const [directionsResult, setDirectionsResult] = useState<any>(null);
  const [isSubmittingDirections, setIsSubmittingDirections] = useState(false);

  const parsedDirections = directionsChallenge 
    ? (typeof directionsChallenge.questions === "string" ? JSON.parse(directionsChallenge.questions) : directionsChallenge.questions)
    : null;

  const gridSize = parsedDirections?.gridSize || 5;
  const landmarks = parsedDirections?.landmarks || [];
  const correctPath = parsedDirections?.correctPath || [];

  // Canvas drawing effect
  useEffect(() => {
    if (activeFeature !== "directions" || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset and clear canvas
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 40;
    const cellSize = (width - padding * 2) / (gridSize - 1);

    // 1. Draw Grid lines
    ctx.strokeStyle = "rgba(139, 92, 246, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < gridSize; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(padding, padding + i * cellSize);
      ctx.lineTo(width - padding, padding + i * cellSize);
      ctx.stroke();

      // Vertical
      ctx.beginPath();
      ctx.moveTo(padding + i * cellSize, padding);
      ctx.lineTo(padding + i * cellSize, height - padding);
      ctx.stroke();
    }

    // 2. Draw Grid intersections
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 181, 253, 0.4)";
        ctx.fill();
      }
    }

    // 3. Draw Landmarks text labels
    landmarks.forEach((lm: any) => {
      const x = padding + lm.col * cellSize;
      const y = padding + lm.row * cellSize;
      
      ctx.fillStyle = "rgba(167, 139, 250, 0.7)";
      ctx.font = "bold 10px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(lm.name, x, y - 8);
    });

    // 4. Draw Traced Path
    if (tracedPath.length > 0) {
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      tracedPath.forEach((pt, idx) => {
        const x = padding + pt.col * cellSize;
        const y = padding + pt.row * cellSize;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw dots on traced path nodes
      tracedPath.forEach((pt) => {
        const x = padding + pt.col * cellSize;
        const y = padding + pt.row * cellSize;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#8b5cf6";
        ctx.fill();
      });
    }

    // 5. Draw Start (green glow) & End (red glow) nodes
    if (parsedDirections) {
      const startX = padding + parsedDirections.start.col * cellSize;
      const startY = padding + parsedDirections.start.row * cellSize;
      ctx.beginPath();
      ctx.arc(startX, startY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      const endX = padding + parsedDirections.end.col * cellSize;
      const endY = padding + parsedDirections.end.row * cellSize;
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
  }, [activeFeature, tracedPath, gridSize, landmarks, parsedDirections]);

  // Click handler on Canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (directionsResult !== null) return; // quiz completed

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Scale client click positions to canvas coordinates to support high-DPI and responsiveness
    const xClick = (e.clientX - rect.left) * (canvas.width / rect.width);
    const yClick = (e.clientY - rect.top) * (canvas.height / rect.height);

    const padding = 40;
    const cellSize = (canvas.width - padding * 2) / (gridSize - 1);

    // Find closest intersection node
    let closestRow = -1;
    let closestCol = -1;
    let minDistance = 25; // threshold in pixels

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const xNode = padding + c * cellSize;
        const yNode = padding + r * cellSize;
        
        const dist = Math.sqrt((xClick - xNode) ** 2 + (yClick - yNode) ** 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestRow = r;
          closestCol = c;
        }
      }
    }

    if (closestRow !== -1 && closestCol !== -1) {
      // Validate step connection: Must connect to previous point (cardinal step only: N, S, E, W)
      if (tracedPath.length > 0) {
        const lastPt = tracedPath[tracedPath.length - 1];
        
        // Check if double clicking the last point to undo
        if (lastPt.row === closestRow && lastPt.col === closestCol) {
          return;
        }

        const rowDiff = Math.abs(lastPt.row - closestRow);
        const colDiff = Math.abs(lastPt.col - closestCol);
        
        // Ensure distance is exactly 1 block in grid coordinate space
        const isValidStep = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
        
        if (!isValidStep) {
          setDirectionsStatus("Please select adjacent junctions only (1 grid step north/south/east/west).");
          return;
        }
      } else {
        // First point MUST be the start node
        if (closestRow !== parsedDirections.start.row || closestCol !== parsedDirections.start.col) {
          setDirectionsStatus("You must start tracing from the green starting node.");
          return;
        }
      }

      setTracedPath((prev) => [...prev, { row: closestRow, col: closestCol }]);
      setDirectionsStatus(null);
    }
  };

  const undoDirectionStep = () => {
    setTracedPath((prev) => prev.slice(0, -1));
    setDirectionsStatus(null);
  };

  const resetDirections = () => {
    setTracedPath([]);
    setDirectionsStatus(null);
    setDirectionsResult(null);
  };

  const submitDirections = async () => {
    if (tracedPath.length === 0 || !directionsChallenge) return;
    
    // Check if path reaches destination node
    const lastNode = tracedPath[tracedPath.length - 1];
    if (lastNode.row !== parsedDirections.end.row || lastNode.col !== parsedDirections.end.col) {
      setDirectionsStatus("You must complete the path all the way to the red destination node before submitting.");
      return;
    }

    setIsSubmittingDirections(true);
    setDirectionsStatus(null);

    try {
      const res = await fetch("/api/communication/evaluate-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: directionsChallenge.id,
          path: tracedPath
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDirectionsResult(data);
      } else {
        setDirectionsStatus(data.error || "Failed to evaluate directions.");
      }
    } catch (e) {
      console.error(e);
      setDirectionsStatus("Connection error. Please try again.");
    } finally {
      setIsSubmittingDirections(false);
    }
  };

  // ----------------------------------------------------
  // VOICE TONE ANALYSIS LOGIC
  // ----------------------------------------------------
  const parsedTone = toneChallenge
    ? (typeof toneChallenge.questions === "string" ? JSON.parse(toneChallenge.questions) : toneChallenge.questions)
    : null;

  // ----------------------------------------------------
  // GAP FILL / FILL THE BEATS LOGIC
  // ----------------------------------------------------
  const [gapAnswers, setGapAnswers] = useState<Record<string, string>>({});
  const [isGapSubmitted, setIsGapSubmitted] = useState(false);
  const [gapResult, setGapResult] = useState<any>(null);
  const [isSubmittingGap, setIsSubmittingGap] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);

  const handleGapAnswerChange = (qId: number, val: string) => {
    setGapAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const submitGapAnswers = async () => {
    if (!fillChallenge) return;
    setIsSubmittingGap(true);
    setGapError(null);
    try {
      const res = await fetch("/api/communication/evaluate-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: fillChallenge.id,
          answers: gapAnswers
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsGapSubmitted(true);
        setGapResult({
          score: data.score,
          xpAwarded: data.xpAwarded,
          q1Correct: data.q1Correct,
          q2Correct: data.q2Correct,
          feedback: data.feedback,
          tamilFeedback: data.tamilFeedback
        });
      } else {
        setGapError(data.error || "Failed to evaluate answers.");
      }
    } catch (e) {
      console.error(e);
      setGapError("Connection error. Please try again.");
    } finally {
      setIsSubmittingGap(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <LiquidGlassCard className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-gray-400 font-medium">Inixa AI is generating your listening challenge...</p>
        </LiquidGlassCard>
      ) : !activeFeature ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-2">
          <button
            onClick={() => { setActiveFeature("mcq"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-purple-400/10 border-purple-400/20 border transition-transform duration-300 group-hover:scale-110">
              <HelpCircle className="w-10 h-10 text-purple-400" strokeWidth={1.5} />
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Passage MCQ
            </span>
          </button>
          
          <button
            onClick={() => { setActiveFeature("fill"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-emerald-400/10 border-emerald-400/20 border transition-transform duration-300 group-hover:scale-110">
              <PenTool className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Fill the Beats
            </span>
          </button>
          
          <button
            onClick={() => { setActiveFeature("directions"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-blue-400/10 border-blue-400/20 border transition-transform duration-300 group-hover:scale-110">
              <Compass className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Direction Follower
            </span>
          </button>
          
          <button
            onClick={() => { setActiveFeature("tone"); stopAudio(); }}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-orange-400/10 border-orange-400/20 border transition-transform duration-300 group-hover:scale-110">
              <Smile className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
            </div>
            <span className="text-[15px] font-semibold text-zinc-600 dark:text-gray-300 group-hover:text-foreground transition-colors">
              Tone Analyzer
            </span>
          </button>
        </div>
      ) : (
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

          {/* RENDER FEATURE 1: PASSAGE MCQ */}
          {activeFeature === "mcq" && (
        <div className="space-y-6">
          <LiquidGlassCard className="p-8 flex flex-col items-center justify-center border-purple-500/20" accentColor="#8b5cf6">
            <h2 className="text-[22px] font-bold text-foreground mb-6">
              {mcqChallenge?.title || "Daily Routine Listening Practice"}
            </h2>
            
            <button
              onClick={() => speakText(mcqChallenge?.content || "")}
              disabled={isPlaying}
              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                isPlaying 
                  ? "bg-purple-600 shadow-[inset_0_0_20px_rgba(255,255,255,0.4),0_0_40px_rgba(139,92,246,0.6)] scale-110" 
                  : "bg-purple-500/20 hover:bg-purple-500/30 hover:scale-105 border border-purple-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
              }`}
            >
              {isPlaying ? (
                <div className="flex gap-1 items-center">
                  <div className="w-2 h-8 bg-white rounded-full animate-pulse" />
                  <div className="w-2 h-12 bg-white rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-8 bg-white rounded-full animate-pulse delay-150" />
                </div>
              ) : (
                <Play className="h-10 w-10 text-purple-400 ml-1" />
              )}
            </button>
            <p className="mt-4 text-zinc-500 dark:text-gray-400 font-medium">
              {isPlaying ? "Playing audio..." : "Click to play the audio passage"}
            </p>
          </LiquidGlassCard>

          {/* Render MCQ Questions */}
          <div className="space-y-6">
            <h3 className="text-[17px] font-semibold text-foreground">Listen & Answer</h3>
            {Array.isArray(mcqChallenge?.questions) && mcqChallenge.questions.map((q) => {
              const isSelected = mcqAnswers[q.id] !== undefined;
              const isSubmitted = mcqResult !== null;
              
              return (
                <LiquidGlassCard key={q.id} className="p-5 border-black/10 dark:border-white/10 animate-in fade-in" accentColor="#8b5cf6">
                  <p className="text-foreground mb-4 font-medium text-[17px]">{q.question}</p>
                  <div className="space-y-3">
                    {q.options?.map((opt: string, idx: number) => {
                      const isOptionSelected = mcqAnswers[q.id] === idx;
                      const isCorrect = isSubmitted && idx === q.correctIndex;
                      const isWrong = isSubmitted && isOptionSelected && idx !== q.correctIndex;

                      let btnStyle = "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-300";
                      if (isOptionSelected && !isSubmitted) {
                        btnStyle = "border-purple-500 bg-purple-500/10 text-purple-600 dark:text-white";
                      } else if (isCorrect) {
                        btnStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-300";
                      } else if (isWrong) {
                        btnStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-300";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => handleMCQOptionSelect(q.id, idx)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-300 ${btnStyle} text-[15px]`}
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
            <LiquidGlassCard className="p-6 border-purple-500 bg-purple-500/5 animate-in slide-in-from-bottom" accentColor="#8b5cf6">
              <h3 className="text-[22px] font-bold text-foreground mb-2">Results</h3>
              <p className="text-zinc-600 dark:text-gray-300 mb-2 text-[17px]">{mcqResult.feedback}</p>
              {mcqResult.tamilFeedback && (
                <p className="text-purple-600 dark:text-purple-300 text-[15px] italic mb-4">{mcqResult.tamilFeedback}</p>
              )}
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/50">
                  Score: {mcqResult.score}%
                </span>
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">
                  +{mcqResult.xpAwarded} XP
                </span>
                <div className="flex-1" />
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-all"
                >
                  Continue to Writing
                </button>
              </div>
            </LiquidGlassCard>
          ) : (
            <button
              onClick={submitMCQAnswers}
              disabled={isMCQSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-[17px] rounded-xl transition-all shadow-md"
            >
              {isMCQSubmitting ? "Evaluating..." : "Submit MCQ Answers"}
            </button>
          )}
        </div>
      )}

      {/* RENDER FEATURE 2: FILL THE BEATS / GAP FILL */}
      {activeFeature === "fill" && fillChallenge && (
        <div className="space-y-6">
          <LiquidGlassCard className="p-6 text-center" accentColor="#8b5cf6">
            <h2 className="text-[22px] font-bold text-foreground mb-4">{fillChallenge.title || "Transcription practice"}</h2>
            <p className="text-zinc-500 dark:text-gray-400 text-[15px] mb-6">
              Listen to the audio statement and transcribe details to fill the gaps.
            </p>

            <button
              onClick={() => speakText(fillChallenge.content)}
              disabled={isPlaying}
              className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto transition-all ${
                isPlaying ? "bg-purple-600 animate-pulse" : "bg-purple-500/20 hover:bg-purple-500/30"
              }`}
            >
              <Play className="w-8 h-8 text-purple-400" />
            </button>
          </LiquidGlassCard>

          <div className="space-y-4">
            <LiquidGlassCard className="p-6 border-black/10 dark:border-white/10" accentColor="#8b5cf6">
              <div className="space-y-6">
                {Array.isArray(fillChallenge.questions) && fillChallenge.questions.map((q: any, idx: number) => (
                  <div key={q.id}>
                    <label className="block text-[15px] font-semibold text-zinc-600 dark:text-gray-300 mb-2">
                      {idx + 1}. {q.question}
                    </label>
                    <input
                      type="text"
                      disabled={isGapSubmitted}
                      placeholder="Enter details..."
                      value={gapAnswers[q.id] || ""}
                      onChange={(e) => handleGapAnswerChange(q.id, e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-purple-500"
                    />
                    {isGapSubmitted && (
                      <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                        {gapResult?.[`q${idx + 1}Correct`] ? (
                          <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Correct</span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Incorrect (Expected: {q.answer})</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </LiquidGlassCard>

            {gapError && <div className="text-red-400 text-sm">{gapError}</div>}

            {isGapSubmitted && gapResult ? (
              <LiquidGlassCard className="p-6 border-green-500/30 bg-green-500/5" accentColor="#22c55e">
                <h3 className="text-[17px] font-bold text-foreground mb-2">Quiz Summary</h3>
                <p className="text-zinc-500 dark:text-gray-300 text-[15px] mb-2">{gapResult.feedback}</p>
                {gapResult.tamilFeedback && (
                  <p className="text-purple-600 dark:text-purple-300 text-[14px] italic mb-4">{gapResult.tamilFeedback}</p>
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
                    onClick={() => { setIsGapSubmitted(false); setGapAnswers({}); setGapResult(null); }}
                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
                  >
                    Reset Challenge
                  </button>
                </div>
              </LiquidGlassCard>
            ) : (
              <button
                onClick={submitGapAnswers}
                disabled={isSubmittingGap || (Array.isArray(fillChallenge?.questions) && fillChallenge.questions.some((q: any) => !gapAnswers[q.id]))}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
              >
                {isSubmittingGap ? "Evaluating..." : "Submit Gap Answers"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* RENDER FEATURE 3: GRID DIRECTIONS FOLLOWER */}
      {activeFeature === "directions" && directionsChallenge && (
        <div className="space-y-6">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#8b5cf6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[17px] font-bold text-foreground flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-400" /> Direction Follower Map
              </h3>
              <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 rounded-full text-[13px] font-semibold">
                Grid Size: {gridSize}x{gridSize}
              </span>
            </div>

            <p className="text-[15px] text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
              Listen to the directions, then click the grid junctions sequentially to trace the pathway.
            </p>

            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => speakText(directionsChallenge.content)}
                disabled={isPlaying}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
              >
                <Volume2 className="w-4 h-4" /> Play Audio Guide
              </button>
              {isPlaying && (
                <button
                  onClick={stopAudio}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-colors"
                >
                  <VolumeX className="w-4 h-4" /> Stop Playback
                </button>
              )}
              <button
                onClick={undoDirectionStep}
                disabled={tracedPath.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:bg-white/5 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
              <button
                onClick={resetDirections}
                disabled={tracedPath.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 hover:bg-white/5 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Tracing Grid Canvas */}
            <div className="flex flex-col items-center">
              <div 
                id="directionMapContainer" 
                className="relative bg-black/40 border border-purple-500/30 rounded-3xl overflow-hidden shadow-inner w-full max-w-[320px] sm:max-w-[360px] aspect-square"
              >
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  onClick={handleCanvasClick}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                />
              </div>

              <div className="mt-4 flex gap-4 text-xs text-gray-400 select-none">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" /> Start: (1, 1)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" /> Destination: (3, 2)
                </span>
                <span className="font-semibold text-purple-300">
                  Points Traced: {tracedPath.length}
                </span>
              </div>
            </div>

            {directionsStatus && (
              <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center">
                {directionsStatus}
              </div>
            )}

            {directionsResult ? (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/25 rounded-2xl animate-in fade-in duration-300">
                <h4 className="font-bold text-sm text-green-400 flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4" /> Path Verified!
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {directionsResult.feedback}
                </p>
                <span className="inline-block px-3 py-1 bg-yellow-500/15 text-yellow-500 rounded-full text-xs font-bold">
                  +{directionsResult.xpAwarded} XP Awarded
                </span>
              </div>
            ) : (
              tracedPath.length > 0 && (
                <button
                  onClick={submitDirections}
                  disabled={isSubmittingDirections}
                  className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
                >
                  {isSubmittingDirections ? "Verifying Path..." : "Verify Route Path"}
                </button>
              )
            )}
          </LiquidGlassCard>
        </div>
      )}

      {/* RENDER FEATURE 4: VOICE TONE ANALYSIS */}
      {activeFeature === "tone" && toneChallenge && (
        <div className="space-y-6 max-w-lg mx-auto">
          <LiquidGlassCard className="p-6 md:p-8" accentColor="#8b5cf6">
            <h3 className="text-[17px] font-bold text-foreground mb-4 flex items-center gap-2">
              <Smile className="w-5 h-5 text-purple-400" /> Speech Tone analysis
            </h3>

            <p className="text-zinc-500 dark:text-gray-400 text-[15px] mb-6">
              Listen to the speech statement below. Can you identify the emotional tone of the speaker?
            </p>

            <button
              onClick={() => speakText(toneChallenge.content)}
              disabled={isPlaying}
              className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all ${
                isPlaying ? "bg-purple-600 animate-pulse" : "bg-purple-500/20 hover:bg-purple-500/30"
              }`}
            >
              <Play className="w-8 h-8 text-purple-400" />
            </button>

            <div className="grid grid-cols-1 gap-3">
              {Array.isArray(toneChallenge.questions) && toneChallenge.questions.map((q: any) => (
                <div key={q.id} className="space-y-3">
                  <p className="text-foreground font-medium text-[15px] mb-2">{q.question}</p>
                  {q.options?.map((option: string, idx: number) => {
                    const isOptionSelected = toneAnswers[q.id] === idx;
                    const isSubmitted = toneResult !== null;
                    const isCorrect = isSubmitted && idx === q.correctIndex;
                    const isWrong = isSubmitted && isOptionSelected && idx !== q.correctIndex;

                    let btnStyle = "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-zinc-600 dark:text-gray-300";
                    if (isOptionSelected && !isSubmitted) {
                      btnStyle = "bg-purple-600/10 border-purple-500 text-purple-600 dark:text-purple-300";
                    } else if (isCorrect) {
                      btnStyle = "bg-green-500/10 border-green-500 text-green-600 dark:text-green-300 pointer-events-none";
                    } else if (isWrong) {
                      btnStyle = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-300 pointer-events-none";
                    } else if (isSubmitted) {
                      btnStyle = "border-black/5 dark:border-white/5 text-zinc-400 dark:text-gray-500 pointer-events-none opacity-45";
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isSubmitted}
                        onClick={() => handleToneOptionSelect(q.id, idx)}
                        className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition-all ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {toneError && <div className="text-red-400 text-xs mt-2">{toneError}</div>}

            {toneResult ? (
              <div className="mt-6 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl space-y-3">
                <p className="text-[13px] text-zinc-600 dark:text-gray-300 leading-relaxed font-light">{toneResult.feedback}</p>
                {toneResult.tamilFeedback && (
                  <p className="text-[13px] text-purple-400 italic font-light">{toneResult.tamilFeedback}</p>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-purple-300">XP Awarded: +{toneResult.xpAwarded}</span>
                  <button 
                    onClick={resetToneAnswers}
                    className="text-purple-400 hover:underline font-semibold"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={submitToneAnswers}
                disabled={isToneSubmitting || Object.keys(toneAnswers).length === 0}
                className="w-full mt-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all"
              >
                {isToneSubmitting ? "Evaluating..." : "Submit Selection"}
              </button>
            )}
          </LiquidGlassCard>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
