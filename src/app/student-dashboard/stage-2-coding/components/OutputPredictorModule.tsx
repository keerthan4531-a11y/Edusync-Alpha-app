"use client"

import { useState } from "react"
import { 
  Cpu, ChevronLeft, RefreshCw, Zap
} from "lucide-react"

interface PredictQuestion {
  id: string
  codeSnippet: string
  options: string[]
  correctIndex: number
  explanation: string
}

const PREDICT_QUESTIONS: PredictQuestion[] = [
  {
    id: "q1",
    codeSnippet: "x = [1, 2, 3]\nprint(x[::-1])",
    options: ["[1, 2, 3]", "[3, 2, 1]", "3", "SyntaxError"],
    correctIndex: 1,
    explanation: "`x[::-1]` is Python list slicing with step -1, which reverses the list to `[3, 2, 1]`."
  },
  {
    id: "q2",
    codeSnippet: "a = '5' + '5'\nprint(int(a) * 2)",
    options: ["10", "55", "110", "25"],
    correctIndex: 2,
    explanation: "'5' + '5' evaluates to string '55'. Converting '55' to int yields 55. 55 * 2 = 110."
  },
  {
    id: "q3",
    codeSnippet: "print(type(1 / 2))",
    options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "0.5"],
    correctIndex: 1,
    explanation: "In Python 3, division `/` always returns a `float`, so type is `<class 'float'>`."
  }
]

export function OutputPredictorModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [streak, setStreak] = useState(0)

  const activeQ = PREDICT_QUESTIONS[currentIdx]

  const handleSelectOption = (idx: number) => {
    if (answered) return
    setSelectedOption(idx)
    setAnswered(true)

    if (idx === activeQ.correctIndex) {
      setStreak(s => s + 1)
      onAwardXP(25, 10)
    } else {
      setStreak(0)
    }
  }

  const handleNext = () => {
    setSelectedOption(null)
    setAnswered(false)
    setCurrentIdx((prev) => (prev + 1) % PREDICT_QUESTIONS.length)
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm mb-3"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-500" /> Output Predictor
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
            Predict code snippet execution outputs without running code — ideal for technical interview prep!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 text-blue-400 font-extrabold text-xs">
          <Zap className="w-4 h-4" /> Streak: {streak} 🔥
        </div>
      </div>

      {/* Main Question Card */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-8 rounded-[2rem] border border-blue-500/20 shadow-2xl space-y-6">
        <div className="flex justify-between items-center text-xs font-extrabold">
          <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Question {currentIdx + 1} of {PREDICT_QUESTIONS.length}
          </span>
          <span className="text-blue-400 font-bold">+25 XP Per Correct Output</span>
        </div>

        {/* Code Snippet Box */}
        <div className="bg-black/60 border border-blue-500/30 rounded-2xl p-6 font-mono text-sm text-blue-300 leading-relaxed overflow-x-auto shadow-inner">
          <pre>{activeQ.codeSnippet}</pre>
        </div>

        {/* Options Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {activeQ.options.map((opt, idx) => {
            let style = "neu-flat dark:bg-white/5 hover:bg-blue-500/10 border-transparent text-foreground"
            if (answered) {
              if (idx === activeQ.correctIndex) {
                style = "bg-blue-500/20 border-blue-500 text-blue-300 font-bold shadow-lg"
              } else if (idx === selectedOption) {
                style = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold"
              }
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={answered}
                className={`p-4 rounded-xl text-xs font-mono font-bold text-left transition-all border ${style}`}
              >
                <span className="text-muted-foreground mr-2 font-sans font-extrabold">{String.fromCharCode(65 + idx)})</span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Explanation & Next */}
        {answered && (
          <div className="space-y-4 pt-4 border-t border-black/10 dark:border-white/10 animate-in fade-in">
            <div className={`p-4 rounded-xl border text-xs font-semibold leading-relaxed ${
              selectedOption === activeQ.correctIndex 
                ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}>
              <strong className="block mb-1 font-bold">
                {selectedOption === activeQ.correctIndex ? "✅ Correct!" : "❌ Incorrect!"}
              </strong>
              {activeQ.explanation}
            </div>

            <button 
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2 ml-auto"
            >
              Next Question <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
