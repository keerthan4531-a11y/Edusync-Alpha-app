"use client";

import { useState, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Mic, Square, Play, Loader2, MessageSquare, Target } from "lucide-react";

export function MockInterviews() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState("Tell me about a challenging technical problem you solved recently.");
  const [result, setResult] = useState<any>(null);
  
  const recognitionRef = useRef<any>(null);

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
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Target className="text-stage4" />
          Interview Evaluation
        </h2>
        
        <div className="text-center mb-8">
          <div className="text-5xl font-bold text-stage4 mb-2">{result.evaluation.score}/100</div>
          <p className="text-zinc-300 max-w-2xl mx-auto">{result.evaluation.feedback}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <h4 className="font-semibold text-emerald-400 mb-2">Strengths</h4>
            <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
              {result.evaluation.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <h4 className="font-semibold text-amber-400 mb-2">Areas for Improvement</h4>
            <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
              {result.evaluation.areasForImprovement.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>

        <button 
          onClick={() => {
            setResult(null);
            setQuestionCount(1);
            setCurrentQuestion("Tell me about a challenging technical problem you solved recently.");
          }}
          className="w-full bg-stage4 text-black font-semibold py-3 rounded-lg hover:bg-amber-400 transition-colors"
        >
          Start New Interview
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="text-stage4" />
          AI Mock Interview
        </h2>
        <span className="px-3 py-1 rounded-full bg-stage4/20 text-stage4 text-sm font-medium">
          Question {questionCount} of 3
        </span>
      </div>

      <div className="bg-black/30 border border-white/10 rounded-xl p-6 mb-8 min-h-[120px] flex items-center justify-center">
        <p className="text-xl text-center text-white font-medium leading-relaxed">
          "{currentQuestion}"
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6">
        {isRecording && (
          <div className="flex items-center gap-2 h-12">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-2 bg-stage4 rounded-full animate-pulse"
                style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        
        {transcript && (
          <div className="w-full p-4 bg-white/5 rounded-lg border border-white/10 text-zinc-300 italic text-sm">
            {transcript}
          </div>
        )}

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3 text-stage4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium">AI is evaluating your response...</p>
          </div>
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isRecording 
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 ring-4 ring-red-500/50" 
                : "bg-stage4/20 text-stage4 hover:bg-stage4/30 ring-4 ring-stage4/20 hover:ring-stage4/50"
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>
        )}
        
        <p className="text-sm text-zinc-500 text-center max-w-sm">
          {isRecording 
            ? "Recording... Tap square to submit your answer" 
            : "Tap the microphone to start answering out loud"}
        </p>
      </div>
    </GlassCard>
  );
}
