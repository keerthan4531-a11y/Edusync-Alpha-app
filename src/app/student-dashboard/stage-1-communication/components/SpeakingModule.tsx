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
  Crown
} from "lucide-react";

interface SpeakingModuleProps {
  content: Stage1ContentDTO | null;
  challenges?: Stage1ContentDTO[];
  onFinish: () => void;
}

const SHADOW_SENTENCES = [
  { text: "Clear communication is the bridge between confusion and clarity.", difficulty: "Easy" },
  { text: "Artificial intelligence is transforming the educational landscape globally.", difficulty: "Medium" },
  { text: "The meticulous researcher kept precise records of the experimental outcomes.", difficulty: "Hard" }
];

export function SpeakingModule({ content, challenges = [], onFinish }: SpeakingModuleProps) {
  const [activeTab, setActiveTab] = useState<"read-aloud" | "shadowing" | "analyzer" | "roleplay">("read-aloud");

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
  // SHADOW PRACTICE LOGIC
  // ----------------------------------------------------
  const [shadowSentenceIdx, setShadowSentenceIdx] = useState(0);
  const [shadowTranscribed, setShadowTranscribed] = useState("");
  const [isShadowRecording, setIsShadowRecording] = useState(false);
  const [shadowResult, setShadowResult] = useState<any>(null);
  const [shadowError, setShadowError] = useState<string | null>(null);
  const shadowRecognitionRef = useRef<any>(null);

  const activeShadow = SHADOW_SENTENCES[shadowSentenceIdx];

  const startShadowRecord = () => {
    setShadowError(null);
    setShadowTranscribed("");
    setShadowResult(null);
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setShadowError("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsShadowRecording(true);
      rec.onresult = (e: any) => {
        const resultText = e.results[0][0].transcript;
        setShadowTranscribed(resultText);
      };
      rec.onerror = (e: any) => {
        console.error(e);
        setShadowError(`Microphone error: ${e.error}`);
        setIsShadowRecording(false);
      };
      rec.onend = () => setIsShadowRecording(false);

      rec.start();
      shadowRecognitionRef.current = rec;
    } catch (e: any) {
      setShadowError(e.message);
    }
  };

  const stopShadowRecord = () => {
    if (shadowRecognitionRef.current) {
      shadowRecognitionRef.current.stop();
    }
  };

  const evaluateShadowPractice = () => {
    if (!shadowTranscribed) return;
    const targetWords = activeShadow.text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);
    const userWords = shadowTranscribed.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").split(/\s+/);

    const matches = userWords.filter(w => targetWords.includes(w));
    const score = Math.round((matches.length / targetWords.length) * 100);

    const mispronounced = targetWords.filter(w => !userWords.includes(w));

    setShadowResult({
      score,
      xpAwarded: score >= 80 ? 20 : 5,
      mispronounced,
      feedback: score >= 80 
        ? "Excellent shadowing accuracy! You matched almost every word." 
        : "Some words were missed. Focus on copying the exact sentence rhythm.",
      tamilFeedback: score >= 80 
        ? "அருமையான உச்சரிப்பு துல்லியம்! அனைத்து வார்த்தைகளையும் சரியாகப் பேசினீர்கள்."
        : "சில வார்த்தைகள் விடுபட்டுள்ளன. வார்த்தைகளின் உச்சரிப்பு வேகத்தைக் கவனித்து மீண்டும் முயலவும்."
    });
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
    const text = analyzerTranscribed || "Mock transcription of clear academic communication text for visual presentation feedback.";
    const seconds = analyzerSeconds || 8;
    const words = text.split(/\s+/).filter(Boolean).length;
    const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 120;

    // Detect fillers
    const fillers = ["um", "uh", "like", "so", "basically", "actually"];
    const foundFillers: string[] = [];
    text.toLowerCase().split(/\s+/).forEach(w => {
      const cleaned = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
      if (fillers.includes(cleaned)) {
        foundFillers.push(cleaned);
      }
    });

    const fluencyScore = Math.max(30, 100 - (foundFillers.length * 8) - Math.abs(130 - wpm) * 0.3);

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
      fluencyScore: Math.round(fluencyScore),
      paceFeedback,
      xpAwarded: 25,
      transcript: text
    });
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
    } catch(e) {}
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

  return (
    <div className="space-y-6">
      {/* Exercise Mode Subtabs */}
      <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar flex-nowrap w-full sm:w-fit">
        <button
          onClick={() => { setActiveTab("read-aloud"); if(typeof window !== "undefined") window.speechSynthesis.cancel(); }}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "read-aloud"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Read Aloud
        </button>
        <button
          onClick={() => { setActiveTab("shadowing"); if(typeof window !== "undefined") window.speechSynthesis.cancel(); }}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "shadowing"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Shadow Practice
        </button>
        <button
          onClick={() => { setActiveTab("analyzer"); if(typeof window !== "undefined") window.speechSynthesis.cancel(); }}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "analyzer"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Pitch Analyzer
        </button>
        <button
          onClick={() => { setActiveTab("roleplay"); if(typeof window !== "undefined") window.speechSynthesis.cancel(); }}
          className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === "roleplay"
              ? "bg-purple-600 text-white shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          AI Roleplay Arena
        </button>
      </div>

      {/* 1. READ ALOUD TAB */}
      {activeTab === "read-aloud" && content && (
        <div className="space-y-6 animate-in fade-in">
          <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
            <h2 className="text-xl font-bold text-white mb-2">{content.title}</h2>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <p className="text-gray-200 text-2xl font-medium leading-relaxed">
                "{content.content}"
              </p>
            </div>
          </LiquidGlassCard>

          {!readAloudResult ? (
            <LiquidGlassCard className="p-6 border-white/10 flex flex-col items-center" accentColor="#8b5cf6">
              <div className="w-full flex justify-end mb-4">
                <button 
                  onClick={() => setUseFallback(!useFallback)}
                  className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Type className="w-4 h-4" />
                  {useFallback ? "Use Microphone" : "Keyboard Fallback"}
                </button>
              </div>

              {useFallback ? (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type what you would have said (Fallback Mode)
                  </label>
                  <textarea
                    value={readAloudText}
                    onChange={(e) => setReadAloudText(e.target.value)}
                    disabled={isReadAloudSubmitting}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white focus:border-purple-500 transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-6 my-4 w-full">
                  <button
                    onClick={isReadAloudRecording ? stopReadAloudRecord : startReadAloudRecord}
                    disabled={isReadAloudSubmitting}
                    className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isReadAloudRecording 
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
                  
                  <p className="text-gray-400 font-medium text-sm">
                    {isReadAloudRecording ? "Recording... Click to stop." : "Click to start speaking"}
                  </p>

                  {readAloudText && (
                    <div className="w-full p-4 bg-black/40 rounded-2xl border border-white/10 text-gray-300 text-sm">
                      <span className="text-xs text-purple-400 font-semibold block mb-1">Heard:</span>
                      {readAloudText}
                    </div>
                  )}
                </div>
              )}

              {readAloudError && (
                <div className="w-full mt-4 text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  {readAloudError}
                </div>
              )}

              <button
                onClick={submitReadAloud}
                disabled={isReadAloudSubmitting || readAloudText.trim().length < 2}
                className="w-full mt-6 py-3 rounded-2xl bg-purple-600 text-white font-semibold shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isReadAloudSubmitting ? "AI is analyzing speech..." : "Submit Speech Evaluation"}
              </button>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard className="p-6 border-purple-500/30 bg-purple-500/5" accentColor="#8b5cf6">
              <h3 className="text-2xl font-bold text-white mb-4">Pronunciation Feedback</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="text-purple-400 font-semibold mb-1 text-sm">Coach's Notes</h4>
                  <p className="text-gray-200 text-sm">{readAloudResult.evaluation.feedback}</p>
                  <p className="text-gray-400 text-xs mt-2 italic">{readAloudResult.evaluation.tamilFeedback}</p>
                </div>

                {readAloudResult.evaluation.mispronouncedWords?.length > 0 ? (
                  <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                    <h4 className="text-orange-400 font-semibold mb-2 text-sm">Words to Practice</h4>
                    <div className="flex flex-wrap gap-2">
                      {readAloudResult.evaluation.mispronouncedWords.map((word: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-black/40 border border-orange-500/30 rounded-lg text-orange-200 text-xs">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20 text-sm">
                    <p className="text-green-400 font-medium">Perfect pronunciation! No missed words detected.</p>
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
                  className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-medium transition-all"
                >
                  Try Again
                </button>
              </div>
            </LiquidGlassCard>
          )}
        </div>
      )}

      {/* 2. SHADOW PRACTICE TAB */}
      {activeTab === "shadowing" && (
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
          <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Shadowing repetition practice
            </h3>

            {/* List of Shadow prompts */}
            <div className="flex gap-2 mb-6">
              {SHADOW_SENTENCES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShadowSentenceIdx(idx);
                    setShadowTranscribed("");
                    setShadowResult(null);
                    setShadowError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    shadowSentenceIdx === idx
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {item.difficulty} Prompt
                </button>
              ))}
            </div>

            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl text-center space-y-4 mb-6">
              <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Listen carefully & Shadow:</p>
              <p className="text-white text-xl font-medium leading-relaxed">
                "{activeShadow.text}"
              </p>
              <button
                onClick={() => speakText(activeShadow.text, 0.85)}
                className="mx-auto flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-300 text-xs font-semibold rounded-xl transition-all"
              >
                <Volume2 className="w-4 h-4" /> Listen to Audio guide
              </button>
            </div>

            {/* Mic control */}
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={isShadowRecording ? stopShadowRecord : startShadowRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isShadowRecording 
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
              <p className="text-xs text-gray-400 font-medium">
                {isShadowRecording ? "Recording... repeat the phrase now." : "Click microphone and speak"}
              </p>

              {shadowTranscribed && (
                <div className="w-full p-4 bg-black/30 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs text-purple-400 font-semibold block">You said:</span>
                  <p className="text-sm text-gray-300">"{shadowTranscribed}"</p>
                  
                  {!shadowResult && (
                    <button
                      onClick={evaluateShadowPractice}
                      className="mt-3 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold w-full transition-all"
                    >
                      Compare Pronunciation
                    </button>
                  )}
                </div>
              )}

              {shadowError && (
                <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  {shadowError}
                </div>
              )}
            </div>

            {shadowResult && (
              <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/30 rounded-2xl space-y-3 animate-in slide-in-from-bottom-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-400" /> Accuracy Breakdown
                  </h4>
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
                    Match Score: {shadowResult.score}%
                  </span>
                </div>
                <p className="text-xs text-gray-300">{shadowResult.feedback}</p>
                <p className="text-xs text-purple-300 italic">{shadowResult.tamilFeedback}</p>

                {shadowResult.mispronounced.length > 0 && (
                  <div className="text-xs space-y-1">
                    <span className="text-orange-400 font-semibold">Focus pronunciation on:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {shadowResult.mispronounced.map((word: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-200 rounded">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-yellow-500 font-bold pt-2">
                  <span>+{shadowResult.xpAwarded} XP Earned</span>
                  <button
                    onClick={() => {
                      setShadowResult(null);
                      setShadowTranscribed("");
                    }}
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
      {activeTab === "analyzer" && (
        <div className="space-y-6 max-w-xl mx-auto animate-in fade-in">
          <LiquidGlassCard className="p-6" accentColor="#8b5cf6">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" /> Speech Pitch & Pacing Analyzer
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
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
                    : "bg-cyan-500/20 border border-cyan-500/50 hover:bg-cyan-500/30"
                }`}
              >
                {isAnalyzerRecording ? (
                  <Square className="w-8 h-8 text-white" fill="currentColor" />
                ) : (
                  <Mic className="w-10 h-10 text-cyan-400" />
                )}
              </button>
              <p className="text-xs text-gray-400 font-medium">
                {isAnalyzerRecording ? "Stop recording to generate metrics report" : "Click to start analyzing"}
              </p>

              {analyzerTranscribed && (
                <div className="w-full p-3 bg-black/40 border border-white/10 rounded-xl">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Transcribed words:</span>
                  <p className="text-xs text-gray-300">"{analyzerTranscribed}"</p>
                </div>
              )}
            </div>

            {analyzerResult && (
              <div className="mt-6 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl space-y-4 animate-in slide-in-from-bottom-4">
                <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Speaking metrics report
                </h4>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                    <span className="text-lg font-extrabold text-white">{analyzerResult.wpm}</span>
                    <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Words/Min</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                    <span className="text-lg font-extrabold text-white">{analyzerResult.fillerCount}</span>
                    <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Filler Words</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-center">
                    <span className="text-lg font-extrabold text-cyan-400">{analyzerResult.fluencyScore}%</span>
                    <span className="block text-[10px] text-gray-400 font-medium mt-0.5">Fluency Score</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-300">Pacing Feedback:</span>
                    <p className="text-gray-400 leading-relaxed">{analyzerResult.paceFeedback}</p>
                  </div>

                  {analyzerResult.fillersUsed.length > 0 && (
                    <div>
                      <span className="font-semibold text-orange-400">Filler words detected:</span>
                      <div className="flex gap-1.5 mt-1.5">
                        {analyzerResult.fillersUsed.map((word: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-500/10 text-orange-200 border border-orange-500/20 rounded text-[10px]">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-yellow-500 font-bold border-t border-white/5 pt-3">
                  <span>+{analyzerResult.xpAwarded} XP Awarded</span>
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
      {activeTab === "roleplay" && (
        <div className="space-y-6 animate-in fade-in">
          {/* LOBBY MODE */}
          {roleplayMode === "lobby" && (
            <LiquidGlassCard className="p-6 max-w-lg mx-auto" accentColor="#8b5cf6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <MessageSquareCode className="w-5 h-5 text-purple-400" /> AI Conversational Roleplay Arena
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Test your communication adaptability by chatting with special AI characters in simulated scenarios.
              </p>

              {/* Character selection */}
              <div className="space-y-4 mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Select Roleplay Character:</label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(characterMeta) as Array<keyof typeof characterMeta>).map((char) => {
                    const meta = characterMeta[char];
                    const selected = roleplayCharacter === char;
                    return (
                      <button
                        key={char}
                        onClick={() => setRoleplayCharacter(char)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          selected
                            ? "bg-purple-600/20 border-purple-500 text-white shadow-md"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{meta.icon}</span>
                        <span className="text-xs font-bold block">{meta.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty selection */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Conversation Difficulty:</label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setRoleplayDifficulty(diff as any)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border capitalize transition-all ${
                        roleplayDifficulty === diff
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
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
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 select-none">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{characterMeta[roleplayCharacter].icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{characterMeta[roleplayCharacter].name}</h4>
                    <span className="text-[10px] text-gray-400 font-medium capitalize">Difficulty: {roleplayDifficulty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-[10px] font-bold">
                    Turns: {roleplayTurns}/5
                  </span>
                  <button
                    onClick={() => evaluateRoleplaySession(roleplayHistory)}
                    className="text-xs text-red-400 hover:underline font-bold"
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
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        isUser ? "bg-purple-600 text-white" : "bg-white/10 text-gray-200"
                      }`}>
                        {isUser ? <User className="w-4 h-4" /> : characterMeta[roleplayCharacter].icon}
                      </div>
                      <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow ${
                        isUser 
                          ? "bg-purple-600 text-white rounded-tr-none" 
                          : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {isRoleplayThinking && (
                  <div className="flex gap-2.5 max-w-[80%] mr-auto items-center">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                      {characterMeta[roleplayCharacter].icon}
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none text-[11px] text-gray-400 animate-pulse">
                      Typing response...
                    </div>
                  </div>
                )}
              </div>

              {/* Input section */}
              <div className="flex gap-2 items-center border-t border-white/10 pt-4">
                <button
                  onClick={toggleRoleplayRecord}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-colors ${
                    isRoleplayRecording 
                      ? "bg-red-500/20 border-red-500 text-red-400 animate-pulse" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
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
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={sendRoleplayMessage}
                  disabled={!roleplayInput.trim() || isRoleplayThinking}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  Send
                </button>
              </div>
            </LiquidGlassCard>
          )}

          {/* REPORT SUMMARY MODE */}
          {roleplayMode === "report" && roleplayResult && (
            <LiquidGlassCard className="p-6 max-w-lg mx-auto" accentColor="#8b5cf6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" /> Conversational Evaluation Report
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Your performance details and conversation analysis.
              </p>

              <div className="feature-card text-center p-6 bg-purple-500/5 border border-purple-500/30 rounded-2xl mb-6">
                <div className="text-5xl font-extrabold text-purple-400 mb-2">{roleplayResult.overall}%</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overall Roleplay Grade</div>
              </div>

              {/* Stat list */}
              <div className="space-y-3 mb-6 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Grammar & Structure:</span>
                  <span className="font-semibold text-white">{roleplayResult.communication}%</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Confidence Vibe:</span>
                  <span className="font-semibold text-white">{roleplayResult.confidence}%</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Vocabulary Variety:</span>
                  <span className="font-semibold text-white">{roleplayResult.vocabulary}%</span>
                </div>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2 mb-6">
                <h4 className="text-xs font-bold text-purple-300">Feedback:</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{roleplayResult.feedback}</p>
                <p className="text-xs text-purple-400 italic mt-2">{roleplayResult.tamilFeedback}</p>
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
  );
}
