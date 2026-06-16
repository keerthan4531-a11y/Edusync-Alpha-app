"use client";

import { useState } from "react";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { Brain, Clock, ChevronRight, CheckCircle2, Award } from "lucide-react";

const MOCK_QUESTIONS = [
  { id: "1", question: "If a train travels 120 km in 2 hours, what is its speed?", options: ["50 km/h", "60 km/h", "70 km/h", "80 km/h"], correctIndex: 1 },
  { id: "2", question: "Which word doesn't belong?", options: ["Apple", "Banana", "Carrot", "Orange"], correctIndex: 2 },
  { id: "3", question: "Find the next number in the series: 2, 4, 8, 16, ___", options: ["24", "32", "64", "20"], correctIndex: 1 },
];

export function AptitudeTests() {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);

  const handleStart = () => {
    setIsActive(true);
    setCurrentIndex(0);
    setSelectedAnswers(new Array(MOCK_QUESTIONS.length).fill(-1));
  };

  const handleSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    let score = 0;
    selectedAnswers.forEach((ans, idx) => {
      if (ans === MOCK_QUESTIONS[idx].correctIndex) score++;
    });

    try {
      const res = await fetch("/api/career/aptitude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId: "mock-test-1", score, maxScore: MOCK_QUESTIONS.length }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
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

  if (isActive) {
    const q = MOCK_QUESTIONS[currentIndex];
    return (
      <LiquidGlassCard className="p-6 space-y-6" accentColor="#f59e0b">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-zinc-500 dark:text-gray-400">Question {currentIndex + 1} of {MOCK_QUESTIONS.length}</span>
          <span className="flex items-center gap-2 text-stage4">
            <Clock className="w-4 h-4" /> 15:00
          </span>
        </div>

        <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
          <div 
            className="h-full bg-stage4 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h3 className="text-[17px] md:text-[22px] font-semibold text-foreground">{q.question}</h3>

        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border text-[15px] font-medium transition-all ${
                selectedAnswers[currentIndex] === idx
                  ? "bg-stage4/20 border-stage4 text-foreground shadow-sm"
                  : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-zinc-700 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              <span className="inline-block w-6 text-stage4 font-semibold">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentIndex] === -1}
            className="flex items-center gap-2 bg-stage4 hover:bg-amber-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex === MOCK_QUESTIONS.length - 1 ? "Submit Test" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </button>
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
            <span>30 Questions</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-stage4 shrink-0" />
            <span>45 Minutes time limit</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-stage4 shrink-0" />
            <span>+50 XP on completion</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-stage4 hover:bg-amber-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2"
        >
          Start Assessment
        </button>
      </LiquidGlassCard>
    </div>
  );
}
