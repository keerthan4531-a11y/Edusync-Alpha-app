"use client";

import { useState, useRef, useEffect } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Mic, Square, Loader2, MessageSquare, Target, Volume2, VolumeX } from "lucide-react";

export function MockInterviews() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about a challenging technical problem you solved recently.");
  const [result, setResult] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  // Text to Speech Logic (Adapted from g4f voice assistant)
  const speakText = (text: string) => {
    if (!soundEnabled || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // Slightly slower for clarity
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (result) {
      speakText(`Interview complete. You scored ${result.evaluation.score} out of 100. ${result.evaluation.feedback}`);
    } else {
      speakText(currentQuestion);
    }
    
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, result, soundEnabled]);

  const startRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser. Try Chrome.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setTranscript("");
      
      // Stop AI speaking if user starts talking
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      const action = questionCount >= 3 ? "evaluate_final" : "next_question";
      
      const res = await fetch("/api/ai/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, transcript, sessionId: "session-123" }),
      });
      const data = await res.json();
      
      if (action === "evaluate_final") {
        setResult(data);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-3">
            <Target className="text-stage4 w-6 h-6" />
            Interview Evaluation
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Review your AI-generated feedback and metrics.</p>
        </div>

        <LiquidGlassCard className="p-8 text-center" accentColor="#f59e0b">
          <div className="text-[50px] font-semibold tracking-tight text-stage4 mb-2 drop-shadow-sm">
            {result.evaluation.score}/100
          </div>
          <p className="text-[15px] text-foreground max-w-2xl mx-auto leading-relaxed">
            {result.evaluation.feedback}
          </p>
        </LiquidGlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LiquidGlassCard className="p-6" accentColor="#10b981">
            <h4 className="font-semibold text-[17px] text-emerald-500 mb-3 flex items-center gap-2">
              <i className="fas fa-check-circle"></i> Strengths
            </h4>
            <ul className="text-[15px] text-zinc-600 dark:text-gray-300 space-y-2.5">
              {result.evaluation.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </LiquidGlassCard>

          <LiquidGlassCard className="p-6" accentColor="#ef4444">
            <h4 className="font-semibold text-[17px] text-red-500 mb-3 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i> Areas for Improvement
            </h4>
            <ul className="text-[15px] text-zinc-600 dark:text-gray-300 space-y-2.5">
              {result.evaluation.areasForImprovement.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </LiquidGlassCard>
        </div>

        <button 
          onClick={() => {
            setResult(null);
            setQuestionCount(1);
            setCurrentQuestion("Tell me about a challenging technical problem you solved recently.");
          }}
          className="w-full bg-stage4 hover:bg-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-3">
            <MessageSquare className="text-stage4 w-6 h-6" />
            AI Mock Interview
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Speak your answers clearly. AI will grade your response.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
            }}
            className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
            title={soundEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-stage4" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
          </button>
          <span className="px-3 py-1 bg-stage4/10 text-stage4 border border-stage4/20 rounded-full text-xs font-semibold shadow-sm">
            Question {questionCount} of 3
          </span>
        </div>
      </div>

      <LiquidGlassCard className="p-8 text-center relative" accentColor="#f59e0b">
        {isSpeaking && (
          <div className="absolute top-4 right-4 flex gap-1">
            <div className="w-1.5 h-3 bg-stage4/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-4 bg-stage4/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-3 bg-stage4/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <p className="text-[17px] md:text-[22px] text-foreground font-semibold leading-relaxed max-w-2xl mx-auto italic">
          "{currentQuestion}"
        </p>
      </LiquidGlassCard>

      <LiquidGlassCard className="p-6 flex flex-col items-center justify-center gap-6">
        {isRecording && (
          <div className="flex items-center gap-2.5 h-12">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-stage4 rounded-full animate-bounce shadow-md"
                style={{ 
                  height: `${24 + Math.random() * 24}px`, 
                  animationDuration: `${0.8 + Math.random() * 0.4}s`,
                  animationDelay: `${i * 0.15}s` 
                }}
              />
            ))}
          </div>
        )}
        
        {transcript && (
          <div className="w-full p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 text-zinc-600 dark:text-gray-300 italic text-[15px] leading-relaxed">
            {transcript}
          </div>
        )}

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3 text-stage4 my-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-[15px] font-semibold">Inixa AI is evaluating your response...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-lg ${
                isRecording 
                  ? "bg-red-500 text-white hover:bg-red-600 ring-4 ring-red-500/20 animate-pulse" 
                  : "bg-stage4 text-white hover:bg-amber-500 ring-4 ring-stage4/20 hover:scale-105"
              }`}
            >
              {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-7 h-7" />}
            </button>
            
            <p className="text-[13px] text-zinc-500 dark:text-gray-400 text-center max-w-sm font-medium">
              {isRecording 
                ? "Recording... Tap square to submit your answer" 
                : "Tap the microphone to start answering out loud"}
            </p>
          </div>
        )}
      </LiquidGlassCard>
    </div>
  );
}
