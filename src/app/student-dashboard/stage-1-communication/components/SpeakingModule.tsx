"use client";

import { useState, useEffect, useRef } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useSpeaking } from "../hooks/useSpeaking";
import { ChallengeSkeleton } from "./ChallengeSkeleton";
import { DifficultyPicker, Difficulty } from "./DifficultyPicker";
import Image from "next/image";
import { 
  Mic, 
  Square, 
  Type, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Activity, 
  MessageSquare, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  MessageSquareCode,
  User,
  Crown,
  ChevronLeft
} from "lucide-react";

interface SpeakingModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onFinish: () => void;
  onSubFeatureOpen?: (isOpen: boolean) => void;
  difficulty?: string;
  onComplete?: (score: number, timeSec: number) => void;
}

const SHADOW_SENTENCES = [
  { text: "Clear communication is the bridge between confusion and clarity.", difficulty: "Easy" },
  { text: "Artificial intelligence is transforming the educational landscape globally.", difficulty: "Medium" },
  { text: "The meticulous researcher kept precise records of the experimental outcomes.", difficulty: "Hard" }
];

const SPEAKING_FEATURES = [
  { id: "speak-it" as const, label: "Speak It", icon: Volume2, color: "text-indigo-400", bgColor: "bg-indigo-400/10", borderColor: "border-indigo-400/20" },
  { id: "shadowing" as const, label: "Listen & Speak", icon: Volume2, color: "text-indigo-400", bgColor: "bg-indigo-400/10", borderColor: "border-indigo-400/20" },
  { id: "analyzer" as const, label: "Practice Speaking", icon: Volume2, color: "text-indigo-400", bgColor: "bg-indigo-400/10", borderColor: "border-indigo-400/20" },
];

const WordByWordText = ({ text, delay = 200, isStarted = true }: { text: string, delay?: number, isStarted?: boolean }) => {
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    setWords(text.split(" "));
    setCurrentIndex(0);
    setHasTriggered(false);
  }, [text]);

  useEffect(() => {
    if (isStarted) setHasTriggered(true);
  }, [isStarted]);

  useEffect(() => {
    if (!hasTriggered) return;
    
    if (currentIndex < words.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, words, delay, hasTriggered]);

  if (!hasTriggered && currentIndex === 0) {
    return <span className="inline-block text-zinc-400 dark:text-zinc-600 italic">Click the mic to reveal the text...</span>;
  }

  return (
    <span className="inline-block">
      {words.slice(0, currentIndex).map((word, idx) => (
        <span key={idx} className="mr-1.5 inline-block animate-in fade-in duration-300">
          {word}
        </span>
      ))}
      {currentIndex < words.length && (
         <span className="inline-block w-1.5 h-[0.8em] ml-0.5 bg-indigo-500 animate-pulse align-middle rounded-sm" />
      )}
    </span>
  );
};

export function SpeakingModule({ content, challenges = [], onFinish, onSubFeatureOpen, difficulty, onComplete }: SpeakingModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"speak-it" | "shadowing" | "analyzer" | null>(null);
  const [pendingFeature, setPendingFeature] = useState<"speak-it" | "shadowing" | "analyzer" | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("MEDIUM");

  useEffect(() => {
    if (onSubFeatureOpen) {
      onSubFeatureOpen(activeFeature !== null || pendingFeature !== null);
    }
  }, [activeFeature, pendingFeature, onSubFeatureOpen]);

  // Read Aloud Speech Hook
  const {
    transcribedText: readAloudText,
    setTranscribedText: setReadAloudText,
    startRecording: startReadAloudRecord,
    stopRecording: stopReadAloudRecord,
    isRecording: isReadAloudRecording,
    submitSpeaking: submitReadAloud,
    isSubmitting: isReadAloudSubmitting,
    result: readAloudResult,
    error: readAloudError,
    reset: resetReadAloud,
  } = useSpeaking(content);

  const [useFallback, setUseFallback] = useState(false);

  // Dynamic Speak It Content
  const [dynamicSpeakItContent, setDynamicSpeakItContent] = useState<Stage1ContentDTO | null>(null);
  const [isGeneratingSpeakIt, setIsGeneratingSpeakIt] = useState(false);

  const loadDynamicSpeakIt = async (diff?: string | any) => {
    setIsGeneratingSpeakIt(true);
    setDynamicSpeakItContent(null);
    resetReadAloud();
    setReadAloudText(""); // explicitly clear to prevent race conditions
    
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-speaking-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff })
      });
      const data = await res.json();
      if (data.success) {
        setDynamicSpeakItContent(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSpeakIt(false);
    }
  };

  useEffect(() => {
    if (activeFeature === "speak-it" && !dynamicSpeakItContent && !isGeneratingSpeakIt) {
      loadDynamicSpeakIt();
    }
  }, [activeFeature]);

  // Stop any speechSynthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, rate = 0.9) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  };

  // ----------------------------------------------------
  // LISTEN & SPEAK LOGIC
  // ----------------------------------------------------
  const [listenSpeakContent, setListenSpeakContent] = useState<Stage1ContentDTO | null>(null);
  const [isGeneratingListenSpeak, setIsGeneratingListenSpeak] = useState(false);
  const [listenSpeakTranscribed, setListenSpeakTranscribed] = useState("");
  const [isListenSpeakRecording, setIsListenSpeakRecording] = useState(false);
  const [listenSpeakResult, setListenSpeakResult] = useState<any>(null);
  const [listenSpeakError, setListenSpeakError] = useState<string | null>(null);
  const [isListenSpeakSubmitting, setIsListenSpeakSubmitting] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const listenSpeakRecognitionRef = useRef<any>(null);

  const loadListenSpeakContent = async (diff?: string | any) => {
    setIsGeneratingListenSpeak(true);
    setListenSpeakContent(null);
    setListenSpeakTranscribed("");
    setListenSpeakResult(null);
    setListenSpeakError(null);
    try {
      const targetDiff = (typeof diff === "string" ? diff : undefined) || selectedDifficulty || "MEDIUM";
      const res = await fetch("/api/communication/generate-listen-speak-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: targetDiff })
      });
      const data = await res.json();
      if (data.success) setListenSpeakContent(data.content);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingListenSpeak(false);
    }
  };

  useEffect(() => {
    if (activeFeature === "shadowing" && !listenSpeakContent && !isGeneratingListenSpeak) {
      loadListenSpeakContent();
    }
  }, [activeFeature]);

  const playListenSpeakAudio = () => {
    if (!listenSpeakContent || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(listenSpeakContent.content);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onstart = () => setIsAudioPlaying(true);
    utterance.onend = () => setIsAudioPlaying(false);
    utterance.onerror = () => setIsAudioPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListenSpeakRecord = () => {
    setListenSpeakError(null);
    setListenSpeakTranscribed("");
    setListenSpeakResult(null);
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setListenSpeakError("Speech recognition is not supported in your browser.");
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.onstart = () => setIsListenSpeakRecording(true);
      rec.onresult = (e: any) => {
        let t = '';
        for (let i = 0; i < e.results.length; ++i) t += e.results[i][0].transcript;
        setListenSpeakTranscribed(t);
      };
      rec.onerror = (e: any) => {
        setListenSpeakError(`Microphone error: ${e.error}`);
        setIsListenSpeakRecording(false);
      };
      rec.onend = () => setIsListenSpeakRecording(false);
      rec.start();
      listenSpeakRecognitionRef.current = rec;
    } catch (e: any) {
      setListenSpeakError(e.message);
    }
  };

  const stopListenSpeakRecord = () => {
    if (listenSpeakRecognitionRef.current) {
      listenSpeakRecognitionRef.current.stop();
    }
    setIsListenSpeakRecording(false);
  };

  const submitListenSpeak = async () => {
    if (!listenSpeakContent || listenSpeakTranscribed.trim().length < 2) return;
    setIsListenSpeakSubmitting(true);
    setListenSpeakError(null);
    try {
      const res = await fetch("/api/communication/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: listenSpeakContent.id,
          transcribedText: listenSpeakTranscribed.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");
      setListenSpeakResult(data);
    } catch (err: any) {
      setListenSpeakError(err.message || "An unexpected error occurred");
    } finally {
      setIsListenSpeakSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // SPEECH PITCH ANALYZER LOGIC
  // ----------------------------------------------------
  const [analyzerTranscribed, setAnalyzerTranscribed] = useState("");
  const [isAnalyzerRecording, setIsAnalyzerRecording] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<any>(null);
  const [analyzerSeconds, setAnalyzerSeconds] = useState(0);
  const pitchCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyzerRecognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const startPitchAnalyzer = async () => {
    setAnalyzerResult(null);
    setAnalyzerTranscribed("");
    setAnalyzerSeconds(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // smaller buffer for smooth wide bars
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsAnalyzerRecording(true);

      // Web Speech recognition in parallel
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setAnalyzerTranscribed(text);
        };
        rec.start();
        analyzerRecognitionRef.current = rec;
      }

      // Timing count
      timerIntervalRef.current = setInterval(() => {
        setAnalyzerSeconds(prev => prev + 1);
      }, 1000);

      // Drawing Waveform Loop
      const canvas = pitchCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const draw = () => {
            if (!analyserRef.current) return;
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Make backing store coordinates match client size dynamically for high-DPI scaling
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
              canvas.width = canvas.clientWidth;
              canvas.height = canvas.clientHeight;
            }
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = "rgba(15, 23, 42, 0.4)"; // matches slate-900 background glass
            ctx.fillRect(0, 0, w, h);

            const barWidth = (w / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * h * 0.8;
              
              // Cyan-to-purple gradient bars
              const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
              grad.addColorStop(0, "#a78bfa"); // light purple
              grad.addColorStop(0.5, "#6366f1"); // primary indigo
              grad.addColorStop(1, "#6366f1"); // cyan

              ctx.fillStyle = grad;
              ctx.fillRect(x, h - barHeight, barWidth - 4, barHeight);
              x += barWidth;
            }
          };
          draw();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopPitchAnalyzer = () => {
    setIsAnalyzerRecording(false);
    
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    if (analyzerRecognitionRef.current) {
      try { analyzerRecognitionRef.current.stop(); } catch(e){}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Evaluate speech pacing & fillers
    setTimeout(() => {
      evaluateAnalyzerResults();
    }, 800);
  };

  const evaluateAnalyzerResults = () => {
    const text = analyzerTranscribed.trim();
    if (!text) {
      setAnalyzerResult({
        wpm: 0,
        fillerCount: 0,
        fillersUsed: [],
        confidenceScore: 0,
        accuracyScore: 0,
        paceFeedback: "No speech detected. Please check your microphone and speak clearly.",
        transcript: ""
      });
      return;
    }

    const seconds = analyzerSeconds || 1;
    const words = text.split(/\s+/).filter(Boolean).length;
    const wpm = Math.round((words / seconds) * 60);

    // Detect fillers
    const fillers = ["um", "uh", "like", "so", "basically", "actually"];
    const foundFillers: string[] = [];
    text.toLowerCase().split(/\s+/).forEach(w => {
      const cleaned = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (fillers.includes(cleaned)) {
        foundFillers.push(cleaned);
      }
    });

    // Confidence Level: High pacing (near 130wpm) and low fillers = high confidence
    const confidenceScore = Math.max(30, 100 - (foundFillers.length * 8) - Math.abs(130 - wpm) * 0.3);
    
    // Accuracy Level: Estimated based on fluency and fewer filler distractions
    const accuracyScore = Math.max(65, Math.min(98, 100 - (foundFillers.length * 2) - Math.floor(Math.random() * 5)));

    let paceFeedback = "Perfect rhythm! Your communication flow is clear and dynamic.";
    if (wpm < 100) {
      paceFeedback = "Speaking rate is a bit slow. Try to connect words more smoothly to build speech momentum.";
    } else if (wpm > 150) {
      paceFeedback = "Speaking rate is relatively high. Pause at commas and periods to help listeners capture key facts.";
    }

    setAnalyzerResult({
      wpm,
      fillerCount: foundFillers.length,
      fillersUsed: Array.from(new Set(foundFillers)),
      confidenceScore: Math.round(confidenceScore),
      accuracyScore: Math.round(accuracyScore),
      paceFeedback,
      transcript: text
    });
  };


  const handleBackToOptions = () => {
    setActiveFeature(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (isReadAloudRecording) stopReadAloudRecord();
    if (isListenSpeakRecording) stopListenSpeakRecord();
    if (isAnalyzerRecording) stopPitchAnalyzer();
  };

  const titles = {
    "speak-it": "Speak It",
    shadowing: "Listen & Speak",
    analyzer: "Practice Speaking",
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
          if (feat === "speak-it") loadDynamicSpeakIt(diff);
          else if (feat === "shadowing") loadListenSpeakContent(diff);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {SPEAKING_FEATURES.map((feature) => {
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
                      src="/images/communication/speaking.png" 
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
              onClick={handleBackToOptions}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
              aria-label="Back to Speaking Options"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* 1. SPEAK IT TAB */}
          {activeFeature === "speak-it" && (
            <div className="space-y-6 animate-in fade-in">
              {isGeneratingSpeakIt ? (
                <ChallengeSkeleton variant="speaking-speak-it" />
              ) : dynamicSpeakItContent && (
                <>
                  <LiquidGlassCard className="p-6" accentColor="#6366f1">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-[22px] font-bold text-foreground">Speak It</h2>
                    </div>
                    <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 text-center shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] min-h-[120px] flex items-center justify-center">
                      <p className="text-zinc-600 dark:text-gray-200 text-[22px] font-medium leading-relaxed max-w-xl mx-auto">
                        <WordByWordText text={`"${dynamicSpeakItContent.content}"`} delay={800} isStarted={isReadAloudRecording} />
                      </p>
                    </div>
                  </LiquidGlassCard>

                  {!readAloudResult ? (
                    <div className="flex flex-col items-center pt-2">
                        <div className="flex flex-col items-center space-y-6 my-4 w-full">
                          <button
                            onClick={isReadAloudRecording ? stopReadAloudRecord : startReadAloudRecord}
                            disabled={isReadAloudSubmitting}
                            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isReadAloudRecording 
                                ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                                : "bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                            }`}
                          >
                            {isReadAloudRecording ? (
                              <Square className="w-10 h-10 text-white" fill="currentColor" />
                            ) : (
                              <Mic className="w-12 h-12 text-indigo-400" />
                            )}
                          </button>
                          
                          <p className="text-zinc-500 dark:text-gray-400 font-medium text-[15px]">
                            {isReadAloudRecording ? "Recording... Click to stop." : "Click to start speaking"}
                          </p>

                          {readAloudText && (
                            <div className="w-full p-4 bg-black/5 dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-gray-300 text-[15px]">
                              <span className="text-[13px] text-indigo-600 dark:text-indigo-400 font-semibold block mb-1">Heard:</span>
                              {readAloudText}
                            </div>
                          )}
                        </div>

                      {readAloudError && (
                        <div className="w-full mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                          {readAloudError}
                        </div>
                      )}

                      <button
                        onClick={() => submitReadAloud(dynamicSpeakItContent || undefined)}
                        disabled={isReadAloudSubmitting || readAloudText.trim().length < 2}
                        className="w-full mt-6 py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isReadAloudSubmitting ? "Evaluating..." : "Submit"}
                      </button>
                    </div>
                  ) : (
                    <LiquidGlassCard className="p-6 border-indigo-500/30 bg-indigo-500/5" accentColor="#6366f1">
              <h3 className="text-[28px] font-bold text-foreground mb-4">Pronunciation Feedback</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                  <h4 className="text-indigo-600 dark:text-indigo-400 font-semibold mb-1 text-[15px]">Coach's Notes</h4>
                  <p className="text-zinc-600 dark:text-gray-200 text-[15px]">{readAloudResult.evaluation.feedback}</p>
                  <p className="text-zinc-500 dark:text-gray-400 text-[13px] mt-2 italic">{readAloudResult.evaluation.tamilFeedback}</p>
                </div>

                {readAloudResult.evaluation.mispronouncedWords?.length > 0 ? (
                  <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <h4 className="text-indigo-600 dark:text-indigo-400 font-semibold mb-2 text-[15px]">Words to Practice</h4>
                    <div className="flex flex-wrap gap-2">
                      {readAloudResult.evaluation.mispronouncedWords.map((word: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-black/5 dark:bg-black/40 border border-indigo-500/30 rounded-lg text-indigo-600 dark:text-indigo-200 text-[13px]">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-[15px]">
                    <p className="text-green-600 dark:text-green-400 font-medium">Perfect pronunciation! No missed words detected.</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm">
                  Accuracy: {readAloudResult.score}%
                </span>
                <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20 shadow-sm">
                  +{readAloudResult.xpAwarded} XP
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => loadDynamicSpeakIt()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  Next
                </button>
              </div>
            </LiquidGlassCard>
          )}
                </>
              )}
            </div>
          )}

      {/* 2. LISTEN & SPEAK TAB */}
      {activeFeature === "shadowing" && (
        <div className="space-y-6 animate-in fade-in">
          {isGeneratingListenSpeak ? (
            <ChallengeSkeleton variant="speaking-listen-speak" />
          ) : listenSpeakContent && (
            <>
              {!listenSpeakResult ? (
                <>
                  {/* Sentence Card */}
                  <LiquidGlassCard className="p-6" accentColor="#6366f1">
                    <h2 className="text-[22px] font-bold text-foreground mb-4">Listen & Speak</h2>
                    <div className="text-center">
                      {/* Play Button */}
                      <button
                        onClick={playListenSpeakAudio}
                        disabled={isAudioPlaying}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[14px] transition-all ${
                          isAudioPlaying
                            ? "bg-indigo-500/30 text-indigo-300 cursor-not-allowed"
                            : "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/40 text-indigo-600 dark:text-indigo-300"
                        }`}
                      >
                        <Volume2 className={`w-4 h-4 ${isAudioPlaying ? "animate-pulse" : ""}`} />
                        {isAudioPlaying ? "Playing..." : "Listen"}
                      </button>
                    </div>
                  </LiquidGlassCard>

                  {/* Mic + Submit */}
                  <div className="flex flex-col items-center pt-2">
                    <div className="flex flex-col items-center space-y-6 my-4 w-full">
                      <button
                        onClick={isListenSpeakRecording ? stopListenSpeakRecord : startListenSpeakRecord}
                        disabled={isListenSpeakSubmitting}
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isListenSpeakRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                            : "bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                        }`}
                      >
                        {isListenSpeakRecording ? (
                          <Square className="w-10 h-10 text-white" fill="currentColor" />
                        ) : (
                          <Mic className="w-12 h-12 text-indigo-400" />
                        )}
                      </button>

                      <p className="text-zinc-500 dark:text-gray-400 font-medium text-[15px]">
                        {isListenSpeakRecording ? "Recording... Click to stop." : "Listen first, then click to speak"}
                      </p>

                      {listenSpeakTranscribed && (
                        <div className="w-full p-4 bg-black/5 dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-gray-300 text-[15px]">
                          <span className="text-[13px] text-indigo-600 dark:text-indigo-400 font-semibold block mb-1">Heard:</span>
                          {listenSpeakTranscribed}
                        </div>
                      )}
                    </div>

                    {listenSpeakError && (
                      <div className="w-full mb-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        {listenSpeakError}
                      </div>
                    )}

                    <button
                      onClick={submitListenSpeak}
                      disabled={isListenSpeakSubmitting || listenSpeakTranscribed.trim().length < 2}
                      className="w-full py-4 rounded-2xl bg-[#6366f1] text-white font-semibold text-[17px] shadow-[0_4px_16px_rgba(99,102,241,0.25)] hover:bg-[#5254cc] hover:shadow-[0_6px_22px_rgba(99,102,241,0.35)] hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isListenSpeakSubmitting ? "Evaluating..." : "Submit"}
                    </button>
                  </div>
                </>
              ) : (
                /* Result Card */
                <LiquidGlassCard className="p-6 border-indigo-500/30 bg-indigo-500/5" accentColor="#6366f1">
                  <h3 className="text-[28px] font-bold text-gray-900 dark:text-white mb-4">Pronunciation Feedback</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                      <h4 className="text-blue-600 dark:text-indigo-400 font-semibold mb-1 text-[15px]">Coach's Notes</h4>
                      <p className="text-gray-900 dark:text-gray-100 text-[15px] font-medium">{listenSpeakResult.evaluation?.feedback}</p>
                      <p className="text-gray-700 dark:text-gray-300 text-[13.5px] mt-2 italic font-medium">{listenSpeakResult.evaluation?.tamilFeedback}</p>
                    </div>

                    {listenSpeakResult.evaluation?.mispronouncedWords?.length > 0 ? (
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <h4 className="text-blue-600 dark:text-indigo-400 font-semibold mb-2 text-[15px]">Words to Practice</h4>
                        <div className="flex flex-wrap gap-2">
                          {listenSpeakResult.evaluation.mispronouncedWords.map((word: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-700 dark:text-blue-300 text-[13px] font-semibold">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-[15px]">
                        <p className="text-green-600 dark:text-green-400 font-medium">Perfect pronunciation! No missed words detected.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center gap-4">
                    <span className="px-4 py-2 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20 shadow-sm">
                      Accuracy: {listenSpeakResult.score}%
                    </span>
                    <span className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20 shadow-sm">
                      +{listenSpeakResult.xpAwarded} XP
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={() => {
                        setListenSpeakResult(null);
                        setListenSpeakTranscribed("");
                        loadListenSpeakContent();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      Next
                    </button>
                  </div>
                </LiquidGlassCard>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. PRACTICE SPEAKING TAB */}
      {activeFeature === "analyzer" && (
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
          <LiquidGlassCard className="p-6" accentColor="#6366f1">
            <h3 className="text-[17px] font-bold text-foreground mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" /> Practice Speaking
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
              Read any academic or work sentence aloud. We will trace your voice frequency variations on the visualizer and analyze words-per-minute pacing.
            </p>

            <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-slate-900/50 mb-6">
              <canvas
                ref={pitchCanvasRef}
                width={500}
                height={120}
                className="w-full block bg-slate-950/80"
              />
              {isAnalyzerRecording && (
                <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-red-600/30 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  ANALYZING MIC ({analyzerSeconds}s)
                </div>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={isAnalyzerRecording ? stopPitchAnalyzer : startPitchAnalyzer}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isAnalyzerRecording 
                    ? "bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]" 
                    : "bg-indigo-500/20 border border-indigo-500/50 hover:bg-indigo-500/30"
                }`}
              >
                {isAnalyzerRecording ? (
                  <Square className="w-8 h-8 text-white" fill="currentColor" />
                ) : (
                  <Mic className="w-10 h-10 text-indigo-400" />
                )}
              </button>
              <p className="text-[13px] text-zinc-500 dark:text-gray-400 font-medium">
                {isAnalyzerRecording ? "Stop recording to generate metrics report" : "Click to start analyzing"}
              </p>

              {analyzerTranscribed && (
                <div className="w-full p-3 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider block mb-1">Transcribed words:</span>
                  <p className="text-[13px] text-zinc-600 dark:text-gray-300">"{analyzerTranscribed}"</p>
                </div>
              )}
            </div>

            {analyzerResult && (
              <div className="mt-6 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4">
                <h4 className="font-bold text-[15px] text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Speaking metrics report
                </h4>

                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                    <span className="text-[22px] font-extrabold text-foreground">{analyzerResult.wpm}</span>
                    <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Words/Min</span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                    <span className="text-[22px] font-extrabold text-foreground">{analyzerResult.fillerCount}</span>
                    <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Filler Words</span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                    <span className="text-[22px] font-extrabold text-indigo-600 dark:text-indigo-400">{analyzerResult.confidenceScore}%</span>
                    <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Confidence</span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                    <span className="text-[22px] font-extrabold text-indigo-600 dark:text-indigo-400">{analyzerResult.accuracyScore}%</span>
                    <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Accuracy</span>
                  </div>
                </div>

                <div className="space-y-2 text-[13px]">
                  <div>
                    <span className="font-semibold text-zinc-600 dark:text-gray-300">Pacing Feedback:</span>
                    <p className="text-zinc-500 dark:text-gray-400 leading-relaxed">{analyzerResult.paceFeedback}</p>
                  </div>

                  {analyzerResult.fillersUsed.length > 0 && (
                    <div>
                      <span className="font-semibold text-indigo-500 dark:text-indigo-400">Filler words detected:</span>
                      <div className="flex gap-1.5 mt-1.5">
                        {analyzerResult.fillersUsed.map((word: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 border border-indigo-500/20 rounded text-[10px]">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs border-t border-black/10 dark:border-white/5 pt-3">
                  <span className="text-zinc-500 dark:text-gray-400 font-medium flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Practice Mode (No XP)</span>
                  <button
                    onClick={() => {
                      setAnalyzerResult(null);
                      setAnalyzerTranscribed("");
                    }}
                    className="text-indigo-400 hover:underline"
                  >
                    Record New Analysis
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
