"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Brain, Clock, ChevronRight, CheckCircle2, Award, Loader2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export function AptitudeTests() {
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  
  const [evaluation, setEvaluation] = useState<{ advice: string; isCorrect: boolean } | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  
  const [result, setResult] = useState<any>(null);
  const [score, setScore] = useState(0);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-aptitude");
      const data = await res.json();
      if (Array.isArray(data)) {
        setQuestions(data);
        setSelectedAnswers(new Array(data.length).fill(-1));
        setIsActive(true);
        setCurrentIndex(0);
        setScore(0);
        setEvaluation(null);
      }
    } catch (e) {
      console.error("Failed to generate questions");
    }
    setLoading(false);
  };

  const handleSelect = (optionIndex: number) => {
    if (evaluation) return; // Don't allow changing answer after checking
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleCheckAnswer = async () => {
    if (selectedAnswers[currentIndex] === -1) return;
    
    setEvaluating(true);
    const q = questions[currentIndex];
    
    try {
      const res = await fetch("/api/ai/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: q.text,
          options: q.options,
          userAnswerIndex: selectedAnswers[currentIndex],
          correctAnswerIndex: q.correctIndex
        })
      });
      const data = await res.json();
      setEvaluation(data);
      if (data.isCorrect) setScore(prev => prev + 1);
    } catch (e) {
      console.error(e);
      // Fallback
      const isCorrect = selectedAnswers[currentIndex] === q.correctIndex;
      setEvaluation({ advice: "AI evaluation unavailable.", isCorrect });
      if (isCorrect) setScore(prev => prev + 1);
    }
    setEvaluating(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setEvaluation(null);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    try {
      const res = await fetch("/api/career/aptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: "ai-generated-test", score, maxScore: questions.length }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ score: Math.round((score / questions.length) * 100), xpAwarded: score * 10 });
    }
    setIsActive(false);
  };

  if (result) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h2 className="text-[22px] font-semibold text-foreground flex items-center gap-2">
            <Award className="text-stage4 w-5 h-5" /> Test Evaluation
          </h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Check your quantitative reasoning score.</p>
        </div>

        <LiquidGlassCard className="p-8 text-center" accentColor="#f59e0b">
          <div className="w-20 h-20 bg-stage4/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-stage4/20">
            <Award className="w-10 h-10 text-stage4" />
          </div>
          <h2 className="text-[28px] font-semibold text-foreground mb-2">Test Completed!</h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mb-8">Excellent effort. Here are your results</p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
            <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl p-5">
              <div className="text-[28px] font-semibold text-foreground mb-1">{result.score}%</div>
              <div className="text-[12px] text-zinc-500 dark:text-gray-505 font-semibold">Score</div>
            </div>
            <div className="bg-stage4/10 border border-stage4/20 rounded-2xl p-5">
              <div className="text-[28px] font-semibold text-stage4 mb-1">+{result.xpAwarded}</div>
              <div className="text-[12px] text-stage4 font-semibold">XP Earned</div>
            </div>
          </div>

          <button 
            onClick={() => setResult(null)}
            className="bg-stage4 hover:bg-amber-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm"
          >
            Return to Dashboard
          </button>
        </LiquidGlassCard>
      </div>
    );
  }

  if (isActive && questions.length > 0) {
    const q = questions[currentIndex];
    return (
      <LiquidGlassCard className="p-6 space-y-6" accentColor="#f59e0b">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-zinc-500 dark:text-gray-400">Question {currentIndex + 1} of {questions.length}</span>
          <span className="flex items-center gap-2 text-stage4">
            <Clock className="w-4 h-4" /> 15:00
          </span>
        </div>

        <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
          <div 
            className="h-full bg-stage4 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h3 className="text-[17px] md:text-[22px] font-semibold text-foreground">{q.text}</h3>

        <div className="space-y-3">
          {q.options.map((opt, idx) => {
            let btnClass = "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10";
            
            if (selectedAnswers[currentIndex] === idx) {
              btnClass = "bg-stage4/20 border-stage4 text-foreground shadow-sm";
            }
            
            if (evaluation) {
              if (idx === q.correctIndex) {
                btnClass = "bg-emerald-500/20 border-emerald-500 text-foreground shadow-sm";
              } else if (selectedAnswers[currentIndex] === idx && !evaluation.isCorrect) {
                btnClass = "bg-red-500/20 border-red-500 text-foreground shadow-sm";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={!!evaluation}
                className={`w-full text-left p-4 rounded-xl border text-[15px] font-medium transition-all ${btnClass}`}
              >
                <span className="inline-block w-6 text-stage4 font-semibold">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {evaluation && (
          <div className={`p-4 rounded-xl border ${evaluation.isCorrect ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"}`}>
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              {evaluation.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <i className="fas fa-times-circle"></i>}
              {evaluation.isCorrect ? "Correct!" : "Incorrect"}
            </h4>
            <p className="text-sm opacity-90">{evaluation.advice}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!evaluation ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedAnswers[currentIndex] === -1 || evaluating}
              className="flex items-center gap-2 bg-stage4 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {evaluating ? <><Loader2 className="w-4 h-4 animate-spin"/> Checking...</> : "Check Answer"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-stage4 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {currentIndex === questions.length - 1 ? "Submit Test" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </LiquidGlassCard>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-stage4/10 border border-stage4/20 rounded-xl shrink-0">
          <Brain className="w-8 h-8 text-stage4" />
        </div>
        <div>
          <h2 className="text-[22px] font-semibold text-foreground">Quantitative Aptitude</h2>
          <p className="text-[15px] text-zinc-500 dark:text-gray-400 mt-1">Quantitative, Logical & Verbal Reasoning.</p>
        </div>
      </div>

      <LiquidGlassCard className="p-6 space-y-6" accentColor="#f59e0b">
        <div className="space-y-4 text-[15px] text-zinc-700 dark:text-gray-300 font-medium">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-stage4 shrink-0" />
            <span>AI Generated Questions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-stage4 shrink-0" />
            <span>Dynamic Time Limit</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-stage4 shrink-0" />
            <span>Instant AI Feedback per question</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-stage4 hover:bg-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
        >
          {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Generating Test...</> : "Start Assessment"}
        </button>
      </LiquidGlassCard>
    </div>
  );
}

