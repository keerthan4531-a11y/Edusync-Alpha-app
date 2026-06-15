"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Brain, Clock, ChevronRight, CheckCircle2, Award } from "lucide-react";

// Mock data to use until the API delivers real tests
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
      <GlassCard className="p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-stage4/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Award className="w-10 h-10 text-stage4" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Test Completed!</h2>
        <p className="text-zinc-400 mb-8">Here are your results</p>

        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">{result.score}%</div>
            <div className="text-sm text-zinc-400">Score</div>
          </div>
          <div className="bg-stage4/10 border border-stage4/20 rounded-xl p-4">
            <div className="text-3xl font-bold text-stage4 mb-1">+{result.xpAwarded}</div>
            <div className="text-sm text-stage4/80">XP Earned</div>
          </div>
        </div>

        <button 
          onClick={() => setResult(null)}
          className="bg-stage4 text-black font-semibold px-8 py-3 rounded-full hover:bg-amber-400 transition-colors"
        >
          Return to Dashboard
        </button>
      </GlassCard>
    );
  }

  if (isActive) {
    const q = MOCK_QUESTIONS[currentIndex];
    return (
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6 text-sm">
          <span className="text-zinc-400">Question {currentIndex + 1} of {MOCK_QUESTIONS.length}</span>
          <span className="flex items-center gap-2 text-stage4 font-medium">
            <Clock className="w-4 h-4" /> 15:00
          </span>
        </div>

        <div className="w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-stage4 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h3 className="text-xl font-medium text-white mb-8">{q.question}</h3>

        <div className="space-y-3 mb-8">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedAnswers[currentIndex] === idx
                  ? "bg-stage4/20 border-stage4 text-white"
                  : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <span className="inline-block w-6 text-stage4 font-medium">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentIndex] === -1}
            className="flex items-center gap-2 bg-stage4 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentIndex === MOCK_QUESTIONS.length - 1 ? "Submit Test" : "Next Question"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-stage4/20 rounded-xl">
          <Brain className="w-8 h-8 text-stage4" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">General Aptitude</h2>
          <p className="text-zinc-400">Quantitative, Logical & Verbal Reasoning</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-zinc-300">
          <CheckCircle2 className="w-5 h-5 text-stage4" />
          <span>30 Questions</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-300">
          <CheckCircle2 className="w-5 h-5 text-stage4" />
          <span>45 Minutes time limit</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-300">
          <CheckCircle2 className="w-5 h-5 text-stage4" />
          <span>+50 XP on completion</span>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-white/10 hover:bg-stage4 hover:text-black text-white border border-white/10 hover:border-transparent font-semibold py-3 rounded-lg transition-all"
      >
        Start Assessment
      </button>
    </GlassCard>
  );
}
