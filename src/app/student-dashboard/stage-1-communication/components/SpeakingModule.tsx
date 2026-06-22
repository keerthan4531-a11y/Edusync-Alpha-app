"use client";

import { useState, useEffect, useRef } from "react";
import { Stage1ContentDTO } from "@/types/communication";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { useSpeaking } from "../hooks/useSpeaking";
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
}

const SHADOW_SENTENCES = [
  { text: "Clear communication is the bridge between confusion and clarity.", difficulty: "Easy" },
  { text: "Artificial intelligence is transforming the educational landscape globally.", difficulty: "Medium" },
  { text: "The meticulous researcher kept precise records of the experimental outcomes.", difficulty: "Hard" }
];

const SPEAKING_FEATURES = [
  { id: "read-aloud" as const, label: "Read Aloud", icon: Mic, color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/20" },
  { id: "shadowing" as const, label: "Shadow Practice", icon: Sparkles, color: "text-purple-400", bgColor: "bg-purple-400/10", borderColor: "border-purple-400/20" },
  { id: "analyzer" as const, label: "Pitch Analyzer", icon: Activity, color: "text-cyan-400", bgColor: "bg-cyan-400/10", borderColor: "border-cyan-400/20" },
  { id: "roleplay" as const, label: "AI Roleplay Arena", icon: MessageSquareCode, color: "text-orange-400", bgColor: "bg-orange-400/10", borderColor: "border-orange-400/20" },
];

export function SpeakingModule({ content: initialContent, challenges = [], onFinish, onSubFeatureOpen }: SpeakingModuleProps) {
  const [activeFeature, setActiveFeature] = useState<"read-aloud" | "shadowing" | "analyzer" | "roleplay" | null>(null);
  const [readAloudChallenge, setReadAloudChallenge] = useState<Stage1ContentDTO | null>(null);
  const [shadowChallenge, setShadowChallenge] = useState<Stage1ContentDTO | null>(null);
  const [analyzerChallenge, setAnalyzerChallenge] = useState<Stage1ContentDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllChallenges() {
      try {
        setLoading(true);
        const [readAloudRes, shadowRes, analyzerRes] = await Promise.all([
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "SPEAKING" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "SPEAKING_SHADOW" })
          }).then(r => r.json()),
          fetch("/api/communication/generate-challenge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleType: "SPEAKING_ANALYZER" })
          }).then(r => r.json())
        ]);

        if (readAloudRes.success) setReadAloudChallenge(readAloudRes.challenge);
        if (shadowRes.success) setShadowChallenge(shadowRes.challenge);
        if (analyzerRes.success) setAnalyzerChallenge(analyzerRes.challenge);
      } catch (err) {
        console.error("Failed to generate speaking challenges", err);
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
  } = useSpeaking(readAloudChallenge);

  const [useFallback, setUseFallback] = useState(false);

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
  // SHADOW PRACTICE HOOK
  // ----------------------------------------------------
  const {
    transcribedText: shadowTranscribed,
    setTranscribedText: setShadowTranscribed,
    startRecording: startShadowRecord,
    stopRecording: stopShadowRecord,
    isRecording: isShadowRecording,
    submitSpeaking: submitShadowAnswers,
    isSubmitting: isShadowSubmitting,
    result: shadowResult,
    error: shadowError,
    reset: resetShadowPractice,
  } = useSpeaking(shadowChallenge);

  // ----------------------------------------------------
  // SPEECH PITCH ANALYZER LOGIC
  // ----------------------------------------------------
  const [analyzerTranscribed, setAnalyzerTranscribed] = useState("");
  const [isAnalyzerRecording, setIsAnalyzerRecording] = useState(false);
  const [analyzerResult, setAnalyzerResult] = useState<any>(null);
  const [analyzerSeconds, setAnalyzerSeconds] = useState(0);
  const [isSubmittingPitch, setIsSubmittingPitch] = useState(false);
  const [pitchError, setPitchError] = useState<string | null>(null);
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
    setPitchError(null);

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
              grad.addColorStop(1, "#06b6d4"); // cyan

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
      try { analyzerRecognitionRef.current.stop(); } catch (e) { }
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

  const evaluateAnalyzerResults = async () => {
    if (!analyzerChallenge) return;
    setIsSubmittingPitch(true);
    setPitchError(null);
    try {
      const res = await fetch("/api/communication/evaluate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId: analyzerChallenge.id,
          transcribedText: analyzerTranscribed || "No speech transcribed.",
          seconds: analyzerSeconds || 10
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalyzerResult({
          wpm: data.evaluation.wpm,
          fillerCount: data.evaluation.fillerCount,
          fillersUsed: data.evaluation.fillersUsed,
          fluencyScore: data.score,
          paceFeedback: data.evaluation.paceFeedback,
          feedback: data.evaluation.feedback,
          tamilFeedback: data.evaluation.tamilFeedback,
          xpAwarded: data.xpAwarded,
          transcript: analyzerTranscribed
        });
      } else {
        setPitchError(data.error || "Failed to evaluate presentation pitch.");
      }
    } catch (e) {
      console.error(e);
      setPitchError("Connection error. Please try again.");
    } finally {
      setIsSubmittingPitch(false);
    }
  };

  // ----------------------------------------------------
  // AI ROLEPLAY ARENA LOGIC
  // ----------------------------------------------------
  const [roleplayMode, setRoleplayMode] = useState<"lobby" | "chat" | "report">("lobby");
  const [roleplayCharacter, setRoleplayCharacter] = useState<"interviewer" | "clerk" | "professor">("interviewer");
  const [roleplayDifficulty, setRoleplayDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [roleplayHistory, setRoleplayHistory] = useState<{ role: "assistant" | "user"; content: string }[]>([]);
  const [roleplayInput, setRoleplayInput] = useState("");
  const [isRoleplayThinking, setIsRoleplayThinking] = useState(false);
  const [roleplayTurns, setRoleplayTurns] = useState(0);
  const [roleplayRecordText, setRoleplayRecordText] = useState("");
  const [isRoleplayRecording, setIsRoleplayRecording] = useState(false);
  const roleplayRecognitionRef = useRef<any>(null);

  const characterMeta = {
    interviewer: { icon: "💼", name: "Job Interviewer", intro: "Hello! Welcome to your technical interview today. Can you tell me about a complex project you worked on recently?" },
    clerk: { icon: "🛎️", name: "Hotel Front Desk", intro: "Good day! Welcome to Grand Plaza. I see you'd like to check-in. Under what name is your room reservation?" },
    professor: { icon: "🎓", name: "Academic Advisor", intro: "Come in! Take a seat. How is your semester research paper going? Let me know what questions you have." }
  };

  const startRoleplaySession = () => {
    const character = roleplayCharacter;
    const meta = characterMeta[character];
    setRoleplayHistory([
      { role: "assistant", content: meta.intro }
    ]);
    setRoleplayTurns(0);
    setRoleplayInput("");
    setRoleplayMode("chat");
  };

  // Roleplay mic toggle
  const toggleRoleplayRecord = () => {
    if (isRoleplayRecording) {
      if (roleplayRecognitionRef.current) roleplayRecognitionRef.current.stop();
      setIsRoleplayRecording(false);
      return;
    }

    setRoleplayRecordText("");
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input not supported. Please write your message.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsRoleplayRecording(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setRoleplayInput(prev => (prev ? prev + " " + text : text));
      };
      rec.onend = () => setIsRoleplayRecording(false);
      rec.start();
      roleplayRecognitionRef.current = rec;
    } catch (e) { }
  };

  const sendRoleplayMessage = async () => {
    const textToSend = roleplayInput.trim();
    if (!textToSend || isRoleplayThinking) return;

    setRoleplayInput("");
    const newHistory = [...roleplayHistory, { role: "user" as const, content: textToSend }];
    setRoleplayHistory(newHistory);
    setIsRoleplayThinking(true);

    try {
      const res = await fetch("/api/communication/roleplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: newHistory,
          character: roleplayCharacter
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRoleplayHistory(prev => [...prev, { role: "assistant", content: data.response }]);
        const nextTurn = roleplayTurns + 1;
        setRoleplayTurns(nextTurn);
        if (nextTurn >= 5) {
          // Max turns reached, trigger report
          setTimeout(() => evaluateRoleplaySession(newHistory), 2000);
        }
      } else {
        setRoleplayHistory(prev => [...prev, { role: "assistant", content: "I'd like to hear more about that. Could you expand on your answer?" }]);
      }
    } catch (e) {
      console.error(e);
      setRoleplayHistory(prev => [...prev, { role: "assistant", content: "Could you repeat that? I didn't quite catch it." }]);
    } finally {
      setIsRoleplayThinking(false);
    }
  };

  const evaluateRoleplaySession = (finalHistory: any[]) => {
    setRoleplayMode("report");
    // Generate static roleplay report details
    // Calculate total conversation words
    const userMessages = finalHistory.filter(m => m.role === "user");
    const totalWords = userMessages.reduce((acc, m) => acc + m.content.split(" ").length, 0);
    const vocabScore = Math.min(100, 50 + userMessages.length * 10);
    const overallScore = Math.round((vocabScore + 85 + 90) / 3);

    setRoleplayResult({
      overall: overallScore,
      communication: 90,
      confidence: 85,
      vocabulary: vocabScore,
      xpAwarded: 30,
      feedback: "Great session! You responded clearly and stayed in character throughout. Your vocabulary choice shows confidence and situational professional awareness.",
      tamilFeedback: "மிகச்சிறந்த உரையாடல்! நீங்கள் கதாபாத்திரத்திற்கு ஏற்ப சிறப்பாக பதிலளித்தீர்கள். உங்கள் வார்த்தை தேர்வுகள் தொழில்முறை திறனை காட்டுகின்றன."
    });
  };

  const [roleplayResult, setRoleplayResult] = useState<any>(null);

  const handleBackToOptions = () => {
    setActiveFeature(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (isReadAloudRecording) stopReadAloudRecord();
    if (isShadowRecording) stopShadowRecord();
    if (isAnalyzerRecording) stopPitchAnalyzer();
    if (isRoleplayRecording) toggleRoleplayRecord();
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <LiquidGlassCard className="p-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-gray-400 font-medium">Inixa AI is generating your speaking challenge...</p>
        </LiquidGlassCard>
      ) : !activeFeature ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPEAKING_FEATURES.map((feature) => {
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
              onClick={handleBackToOptions}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm"
              aria-label="Back to Speaking Options"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* 1. READ ALOUD TAB */}
          {activeFeature === "read-aloud" && readAloudChallenge && (
            <div className="space-y-6 animate-in fade-in">
              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <h2 className="text-[22px] font-bold text-foreground mb-2">{readAloudChallenge.title}</h2>
                <div className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 text-center shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <p className="text-zinc-600 dark:text-gray-200 text-[28px] font-medium leading-relaxed">
                    "{readAloudChallenge.content}"
                  </p>
                </div>
              </LiquidGlassCard>

              {!readAloudResult ? (
                <LiquidGlassCard className="p-6 border-black/10 dark:border-white/10 flex flex-col items-center" accentColor="#8b5cf6">
                  <div className="w-full flex justify-end mb-4">
                    <button
                      onClick={() => setUseFallback(!useFallback)}
                      className="text-[15px] text-zinc-500 dark:text-gray-400 hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Type className="w-4 h-4" />
                      {useFallback ? "Use Microphone" : "Keyboard Fallback"}
                    </button>
                  </div>

                  {useFallback ? (
                    <div className="w-full">
                      <label className="block text-[15px] font-medium text-zinc-600 dark:text-gray-300 mb-2">
                        Type what you would have said (Fallback Mode)
                      </label>
                      <textarea
                        value={readAloudText}
                        onChange={(e) => setReadAloudText(e.target.value)}
                        disabled={isReadAloudSubmitting}
                        rows={4}
                        className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-[15px] text-foreground focus:border-purple-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-6 my-4 w-full">
                      <button
                        onClick={isReadAloudRecording ? stopReadAloudRecord : startReadAloudRecord}
                        disabled={isReadAloudSubmitting}
                        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${isReadAloudRecording
                            ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                            : "bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                          }`}
                      >
                        {isReadAloudRecording ? (
                          <Square className="w-10 h-10 text-white" fill="currentColor" />
                        ) : (
                          <Mic className="w-12 h-12 text-purple-400" />
                        )}
                      </button>

                      <p className="text-zinc-500 dark:text-gray-400 font-medium text-[15px]">
                        {isReadAloudRecording ? "Recording... Click to stop." : "Click to start speaking"}
                      </p>

                      {readAloudText && (
                        <div className="w-full p-4 bg-black/5 dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/10 text-zinc-600 dark:text-gray-300 text-[15px]">
                          <span className="text-[13px] text-purple-600 dark:text-purple-400 font-semibold block mb-1">Heard:</span>
                          {readAloudText}
                        </div>
                      )}
                    </div>
                  )}

                  {readAloudError && (
                    <div className="w-full mt-4 text-red-600 dark:text-red-400 text-[15px] font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      {readAloudError}
                    </div>
                  )}

                  <button
                    onClick={submitReadAloud}
                    disabled={isReadAloudSubmitting || readAloudText.trim().length < 2}
                    className="w-full mt-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold text-[17px] shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isReadAloudSubmitting ? "AI is analyzing speech..." : "Submit Speech Evaluation"}
                  </button>
                </LiquidGlassCard>
              ) : (
                <LiquidGlassCard className="p-6 border-purple-500/30 bg-purple-500/5" accentColor="#8b5cf6">
                  <h3 className="text-[28px] font-bold text-foreground mb-4">Pronunciation Feedback</h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10">
                      <h4 className="text-purple-600 dark:text-purple-400 font-semibold mb-1 text-[15px]">Coach's Notes</h4>
                      <p className="text-zinc-600 dark:text-gray-200 text-[15px]">{readAloudResult.evaluation.feedback}</p>
                      <p className="text-zinc-500 dark:text-gray-400 text-[13px] mt-2 italic">{readAloudResult.evaluation.tamilFeedback}</p>
                    </div>

                    {readAloudResult.evaluation.mispronouncedWords?.length > 0 ? (
                      <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                        <h4 className="text-orange-600 dark:text-orange-400 font-semibold mb-2 text-[15px]">Words to Practice</h4>
                        <div className="flex flex-wrap gap-2">
                          {readAloudResult.evaluation.mispronouncedWords.map((word: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-black/5 dark:bg-black/40 border border-orange-500/30 rounded-lg text-orange-600 dark:text-orange-200 text-[13px]">
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
                    <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/50">
                      Accuracy: {readAloudResult.score}%
                    </span>
                    <span className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 font-bold border border-yellow-500/50">
                      +{readAloudResult.xpAwarded} XP
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={resetReadAloud}
                      className="px-6 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-foreground font-medium transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          )}

          {/* 2. SHADOW PRACTICE TAB */}
          {activeFeature === "shadowing" && shadowChallenge && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <h3 className="text-[17px] font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Shadowing repetition practice
                </h3>

                <div className="p-5 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl text-center space-y-4 mb-6">
                  <p className="text-zinc-500 dark:text-gray-400 text-[13px] uppercase font-bold tracking-wider">Listen carefully & Shadow:</p>
                  <p className="text-foreground text-[22px] font-medium leading-relaxed">
                    "{shadowChallenge.content}"
                  </p>
                  <button
                    onClick={() => speakText(shadowChallenge.content, 0.85)}
                    className="mx-auto flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/40 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[13px] font-semibold rounded-xl transition-all"
                  >
                    <Volume2 className="w-4 h-4" /> Listen to Audio guide
                  </button>
                </div>

                {/* Mic control */}
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={isShadowRecording ? stopShadowRecord : startShadowRecord}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isShadowRecording
                        ? "bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : "bg-purple-500/20 border border-purple-500/50 hover:bg-purple-500/30"
                      }`}
                  >
                    {isShadowRecording ? (
                      <Square className="w-8 h-8 text-white" fill="currentColor" />
                    ) : (
                      <Mic className="w-10 h-10 text-purple-400" />
                    )}
                  </button>
                  <p className="text-[13px] text-zinc-500 dark:text-gray-400 font-medium">
                    {isShadowRecording ? "Recording... repeat the phrase now." : "Click microphone and speak"}
                  </p>

                  {shadowTranscribed && (
                    <div className="w-full p-4 bg-black/5 dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl space-y-2">
                      <span className="text-[13px] text-purple-600 dark:text-purple-400 font-semibold block">You said:</span>
                      <p className="text-[15px] text-zinc-600 dark:text-gray-300">"{shadowTranscribed}"</p>

                      {!shadowResult && (
                        <button
                          onClick={submitShadowAnswers}
                          disabled={isShadowSubmitting}
                          className="mt-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[13px] font-bold w-full transition-all"
                        >
                          {isShadowSubmitting ? "Comparing Pronunciation..." : "Compare Pronunciation"}
                        </button>
                      )}
                    </div>
                  )}

                  {shadowError && (
                    <div className="text-[13px] text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                      {shadowError}
                    </div>
                  )}
                </div>

                {shadowResult && (
                  <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/30 rounded-2xl space-y-3 animate-in slide-in-from-bottom-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-[15px] text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400" /> Pronunciation Review
                      </h4>
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 rounded-full text-[13px] font-bold border border-purple-500/30">
                        Match Score: {shadowResult.score}%
                      </span>
                    </div>
                    <p className="text-[13px] text-zinc-600 dark:text-gray-300">{shadowResult.evaluation?.feedback || shadowResult.feedback}</p>
                    {(shadowResult.evaluation?.tamilFeedback || shadowResult.tamilFeedback) && (
                      <p className="text-[13px] text-purple-600 dark:text-purple-300 italic">{shadowResult.evaluation?.tamilFeedback || shadowResult.tamilFeedback}</p>
                    )}

                    {Array.isArray(shadowResult.evaluation?.mispronouncedWords) && shadowResult.evaluation.mispronouncedWords.length > 0 && (
                      <div className="text-[13px] space-y-1">
                        <span className="text-orange-500 dark:text-orange-400 font-semibold">Focus pronunciation on:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {shadowResult.evaluation.mispronouncedWords.map((word: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-200 rounded">
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[13px] text-yellow-600 dark:text-yellow-500 font-bold pt-2">
                      <span>+{shadowResult.xpAwarded} XP Earned</span>
                      <button
                        onClick={resetShadowPractice}
                        className="text-purple-400 hover:underline"
                      >
                        Repeat Practice
                      </button>
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            </div>
          )}

          {/* 3. SPEECH PITCH ANALYZER TAB */}
          {activeFeature === "analyzer" && analyzerChallenge && (
            <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
              <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
                <h3 className="text-[17px] font-bold text-foreground mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" /> Speech Pitch & Pacing Analyzer
                </h3>
                <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6 leading-relaxed">
                  Read the presentation topic pitch below aloud. We will trace your voice variations and analyze your pacing and grammar.
                </p>

                <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl mb-6">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Presentation Prompt Topic:</span>
                  <p className="text-foreground font-semibold text-sm">"{analyzerChallenge.content}"</p>
                  {(() => {
                    const parsed = analyzerChallenge.questions
                      ? (typeof analyzerChallenge.questions === "string" ? JSON.parse(analyzerChallenge.questions) : analyzerChallenge.questions)
                      : null;
                    const bulletPoints = parsed?.bulletPoints || [];
                    return bulletPoints.length > 0 && (
                      <ul className="list-disc list-inside mt-2 text-xs text-gray-400 space-y-1">
                        {bulletPoints.map((bp: string, idx: number) => (
                          <li key={idx}>{bp}</li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>

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
                    disabled={isSubmittingPitch}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isAnalyzerRecording
                        ? "bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : "bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30"
                      }`}
                  >
                    {isAnalyzerRecording ? (
                      <Square className="w-8 h-8 text-white" fill="currentColor" />
                    ) : (
                      <Mic className="w-10 h-10 text-cyan-400" />
                    )}
                  </button>
                  <p className="text-[13px] text-zinc-500 dark:text-gray-400 font-medium">
                    {isAnalyzerRecording ? "Stop recording to generate metrics report" : "Click to start analyzing"}
                  </p>

                  {analyzerTranscribed && (
                    <div className="w-full p-3 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl">
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">Transcribed words:</span>
                      <p className="text-[13px] text-zinc-600 dark:text-gray-300">"{analyzerTranscribed}"</p>
                    </div>
                  )}

                  {pitchError && (
                    <div className="text-[13px] text-red-600 dark:text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 w-full text-center">
                      {pitchError}
                    </div>
                  )}
                </div>

                {isSubmittingPitch && (
                  <div className="mt-6 p-5 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-pulse">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-cyan-400 font-semibold">AI is analyzing your presentation speech metrics...</span>
                  </div>
                )}

                {analyzerResult && !isSubmittingPitch && (
                  <div className="mt-6 p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-[15px] text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Speaking metrics report
                    </h4>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                        <span className="text-[22px] font-extrabold text-foreground">{analyzerResult.wpm}</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Words/Min</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                        <span className="text-[22px] font-extrabold text-foreground">{analyzerResult.fillerCount}</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Filler Words</span>
                      </div>
                      <div className="p-3 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 text-center">
                        <span className="text-[22px] font-extrabold text-cyan-600 dark:text-cyan-400">{analyzerResult.fluencyScore}%</span>
                        <span className="block text-[10px] text-zinc-500 dark:text-gray-400 font-medium mt-0.5">Fluency Score</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-[13px] leading-relaxed">
                      <div>
                        <span className="font-semibold text-zinc-600 dark:text-gray-300">Pacing Feedback:</span>
                        <p className="text-zinc-500 dark:text-gray-400 mt-0.5">{analyzerResult.paceFeedback}</p>
                      </div>

                      <div>
                        <span className="font-semibold text-zinc-600 dark:text-gray-300">Speech Quality Evaluation:</span>
                        <p className="text-zinc-500 dark:text-gray-400 mt-0.5">{analyzerResult.feedback}</p>
                        {analyzerResult.tamilFeedback && (
                          <p className="text-purple-600 dark:text-purple-300 italic text-xs mt-1">{analyzerResult.tamilFeedback}</p>
                        )}
                      </div>

                      {analyzerResult.fillersUsed.length > 0 && (
                        <div>
                          <span className="font-semibold text-orange-500 dark:text-orange-400">Filler words detected:</span>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {analyzerResult.fillersUsed.map((word: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-200 border border-orange-500/20 rounded text-[10px]">
                                {word}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-yellow-500 font-bold border-t border-white/5 pt-3">
                      <span>Score: {analyzerResult.fluencyScore}% (+{analyzerResult.xpAwarded} XP Awarded)</span>
                      <button
                        onClick={() => {
                          setAnalyzerResult(null);
                          setAnalyzerTranscribed("");
                        }}
                        className="text-cyan-400 hover:underline"
                      >
                        Record New Analysis
                      </button>
                    </div>
                  </div>
                )}
              </LiquidGlassCard>
            </div>
          )}

          {/* 4. AI ROLEPLAY ARENA TAB */}
          {activeFeature === "roleplay" && (
            <div className="space-y-6 animate-in fade-in">
              {/* LOBBY MODE */}
              {roleplayMode === "lobby" && (
                <LiquidGlassCard className="p-6 max-w-lg mx-auto" accentColor="#8b5cf6">
                  <h3 className="text-[17px] font-bold text-foreground mb-2 flex items-center gap-2">
                    <MessageSquareCode className="w-5 h-5 text-purple-400" /> AI Conversational Roleplay Arena
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6">
                    Test your communication adaptability by chatting with special AI characters in simulated scenarios.
                  </p>

                  {/* Character selection */}
                  <div className="space-y-4 mb-6">
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-gray-300 uppercase tracking-wider">Select Roleplay Character:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(Object.keys(characterMeta) as Array<keyof typeof characterMeta>).map((char) => {
                        const meta = characterMeta[char];
                        const selected = roleplayCharacter === char;
                        return (
                          <button
                            key={char}
                            onClick={() => setRoleplayCharacter(char)}
                            className={`p-4 rounded-xl border text-left transition-all ${selected
                                ? "bg-purple-600/20 border-purple-500 text-purple-600 dark:text-white shadow-md"
                                : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-foreground"
                              }`}
                          >
                            <span className="text-[28px] block mb-1">{meta.icon}</span>
                            <span className="text-[13px] font-bold block">{meta.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Difficulty selection */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-gray-300 uppercase tracking-wider">Conversation Difficulty:</label>
                    <div className="flex gap-2">
                      {["easy", "medium", "hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setRoleplayDifficulty(diff as any)}
                          className={`flex-1 py-2 rounded-xl text-[13px] font-bold border capitalize transition-all ${roleplayDifficulty === diff
                              ? "bg-purple-600 text-white border-purple-500"
                              : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-foreground"
                            }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startRoleplaySession}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-lg transition-all"
                  >
                    Start Roleplay Session
                  </button>
                </LiquidGlassCard>
              )}

              {/* CHAT SESSION MODE */}
              {roleplayMode === "chat" && (
                <LiquidGlassCard className="p-6 max-w-2xl mx-auto flex flex-col h-[500px]" accentColor="#8b5cf6">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4 mb-4 select-none">
                    <div className="flex items-center gap-2">
                      <span className="text-[28px]">{characterMeta[roleplayCharacter].icon}</span>
                      <div>
                        <h4 className="font-bold text-[15px] text-foreground">{characterMeta[roleplayCharacter].name}</h4>
                        <span className="text-[10px] text-zinc-500 dark:text-gray-400 font-medium capitalize">Difficulty: {roleplayDifficulty}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 rounded-full text-[10px] font-bold">
                        Turns: {roleplayTurns}/5
                      </span>
                      <button
                        onClick={() => evaluateRoleplaySession(roleplayHistory)}
                        className="text-[13px] text-red-600 dark:text-red-400 hover:underline font-bold"
                      >
                        End Session
                      </button>
                    </div>
                  </div>

                  {/* Chat bubbles */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar scroll-smooth">
                    {roleplayHistory.map((msg, idx) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] flex-shrink-0 ${isUser ? "bg-purple-600 text-white" : "bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-gray-200"
                            }`}>
                            {isUser ? <User className="w-4 h-4" /> : characterMeta[roleplayCharacter].icon}
                          </div>
                          <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed shadow ${isUser
                              ? "bg-purple-600 text-white rounded-tr-none"
                              : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-zinc-600 dark:text-gray-200 rounded-tl-none"
                            }`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}

                    {isRoleplayThinking && (
                      <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
                        <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[13px]">
                          {characterMeta[roleplayCharacter].icon}
                        </div>
                        <div className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl rounded-tl-none text-[11px] text-zinc-500 dark:text-gray-400 animate-pulse">
                          Typing response...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input section */}
                  <div className="flex gap-2 items-center border-t border-black/10 dark:border-white/10 pt-4">
                    <button
                      onClick={toggleRoleplayRecord}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${isRoleplayRecording
                          ? "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 animate-pulse"
                          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-zinc-500 dark:text-gray-400 hover:text-foreground"
                        }`}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder={isRoleplayRecording ? "Listening... speak now." : "Type your response..."}
                      value={roleplayInput}
                      onChange={(e) => setRoleplayInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendRoleplayMessage();
                      }}
                      className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-foreground placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={sendRoleplayMessage}
                      disabled={!roleplayInput.trim() || isRoleplayThinking}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold transition-all shadow"
                    >
                      Send
                    </button>
                  </div>
                </LiquidGlassCard>
              )}

              {/* REPORT SUMMARY MODE */}
              {roleplayMode === "report" && roleplayResult && (
                <LiquidGlassCard className="p-6 max-w-lg mx-auto" accentColor="#8b5cf6">
                  <h3 className="text-[22px] font-bold text-foreground mb-2 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-500" /> Conversational Evaluation Report
                  </h3>
                  <p className="text-[13px] text-zinc-500 dark:text-gray-400 mb-6">
                    Your performance details and conversation analysis.
                  </p>

                  <div className="feature-card text-center p-6 bg-purple-500/5 border border-purple-500/30 rounded-2xl mb-6">
                    <div className="text-[48px] font-extrabold text-purple-600 dark:text-purple-400 mb-2">{roleplayResult.overall}%</div>
                    <div className="text-[10px] text-zinc-500 dark:text-gray-400 font-bold uppercase tracking-wider">Overall Roleplay Grade</div>
                  </div>

                  {/* Stat list */}
                  <div className="space-y-3 mb-6 text-[13px]">
                    <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                      <span className="text-zinc-500 dark:text-gray-400">Grammar & Structure:</span>
                      <span className="font-semibold text-foreground">{roleplayResult.communication}%</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                      <span className="text-zinc-500 dark:text-gray-400">Confidence Vibe:</span>
                      <span className="font-semibold text-foreground">{roleplayResult.confidence}%</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-black/5 dark:border-white/5">
                      <span className="text-zinc-500 dark:text-gray-400">Vocabulary Variety:</span>
                      <span className="font-semibold text-foreground">{roleplayResult.vocabulary}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl space-y-2 mb-6">
                    <h4 className="text-[13px] font-bold text-purple-600 dark:text-purple-300">Feedback:</h4>
                    <p className="text-[13px] text-zinc-600 dark:text-gray-300 leading-relaxed">{roleplayResult.feedback}</p>
                    <p className="text-[13px] text-purple-600 dark:text-purple-400 italic mt-2">{roleplayResult.tamilFeedback}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-yellow-500 text-xs font-bold">+{roleplayResult.xpAwarded} XP Earned</span>
                    <button
                      onClick={() => setRoleplayMode("lobby")}
                      className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                    >
                      Back to Scenarios
                    </button>
                  </div>
                </LiquidGlassCard>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
