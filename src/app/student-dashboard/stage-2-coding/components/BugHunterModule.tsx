"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { 
  Bug, Search, Wrench, Play, CheckCircle2, ChevronLeft, Loader2, Sparkles, HelpCircle
} from "lucide-react"

interface BugChallenge {
  id: string
  title: string
  buggyCode: string
  correctCode: string
  bugLine: number
  bugExplanation: string
  hint: string
  language: "python"
  testCases: { input: string; output: string }[]
}

const BUG_CHALLENGES: BugChallenge[] = [
  {
    id: "find-max",
    title: "Find Maximum Element in Array",
    buggyCode: "def find_max(arr):\n    max = 0\n    for i in arr:\n        if i < max:\n            max = i\n    return max\n\nprint(find_max([3, 7, 2, 9, 4]))",
    correctCode: "def find_max(arr):\n    max_val = arr[0]\n    for i in arr:\n        if i > max_val:\n            max_val = i\n    return max_val\n\nprint(find_max([3, 7, 2, 9, 4]))",
    bugLine: 4,
    bugExplanation: "The comparison operator `if i < max:` is backwards! It should check `if i > max:` to find maximum, and initial max should handle negative numbers.",
    hint: "Check the comparison operator inside the for loop: `<` vs `>`.",
    language: "python",
    testCases: [{ input: "", output: "9" }]
  },
  {
    id: "count-vowels",
    title: "Count Vowels in Sentence",
    buggyCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 2\n    return count\n\nprint(count_vowels('hello world'))",
    correctCode: "def count_vowels(s):\n    vowels = 'aeiou'\n    count = 0\n    for char in s:\n        if char in vowels:\n            count += 1\n    return count\n\nprint(count_vowels('hello world'))",
    bugLine: 5,
    bugExplanation: "The counter is incrementing by 2 instead of 1 (`count += 2`).",
    hint: "Check how much `count` increases per vowel found.",
    language: "python",
    testCases: [{ input: "", output: "3" }]
  }
]

export function BugHunterModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const activeChallenge = BUG_CHALLENGES[selectedIdx]

  const [code, setCode] = useState(activeChallenge.buggyCode)
  const [bugFound, setBugFound] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [passed, setPassed] = useState(false)

  const handleSelectChallenge = (idx: number) => {
    setSelectedIdx(idx)
    setCode(BUG_CHALLENGES[idx].buggyCode)
    setBugFound(false)
    setHintUsed(false)
    setAttempts(0)
    setOutput("")
    setError("")
    setPassed(false)
  }

  const handleFindBug = () => {
    setBugFound(true)
  }

  const handleRunCode = async () => {
    setRunning(true)
    setOutput("")
    setError("")
    setPassed(false)
    setAttempts(prev => prev + 1)

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: "71",
          testCases: activeChallenge.testCases
        })
      })
      const data = await res.json()
      if (res.ok && data.success && data.results) {
        const stdout = (data.results[0].stdout || "").trim()
        const stderr = data.results[0].stderr || ""
        setOutput(stdout)
        if (stderr) setError(stderr)

        const expected = activeChallenge.testCases[0].output.trim()
        if (stdout.includes(expected)) {
          setPassed(true)
          let totalXP = 50 // Base correct fix
          if (bugFound) totalXP += 20 // Bug found bonus
          if (attempts === 0) totalXP += 20 // First attempt bonus
          if (hintUsed) totalXP -= 10 // Hint penalty
          onAwardXP(Math.max(totalXP, 30), 25)
        } else if (!stderr) {
          setError(`Output produced: "${stdout}", but expected: "${expected}"`)
        }
      } else {
        setError(data.message || "Compilation error.")
      }
    } catch (e) {
      setError("Network timeout.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto text-foreground">
      {/* Header */}
      <div>
        <button 
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-sm mb-3"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Bug className="w-8 h-8 text-blue-500" /> Bug Hunter
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Inspect intentionally buggy code snippets, locate defects & fix them for XP bonuses.
        </p>
      </div>

      {/* Challenge Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {BUG_CHALLENGES.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => handleSelectChallenge(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
              selectedIdx === idx
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "neu-flat dark:bg-white/5 text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            🐛 {ch.title}
          </button>
        ))}
      </div>

      {/* Scoring Legend Card */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl border border-blue-500/20 flex flex-wrap gap-4 items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2 text-blue-400">
          <Search className="w-4 h-4" /> Bug Found: <span className="text-foreground">+20 XP</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <Wrench className="w-4 h-4" /> Correct Fix: <span className="text-foreground">+50 XP</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <Sparkles className="w-4 h-4" /> First Attempt: <span className="text-foreground">+20 XP</span>
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <HelpCircle className="w-4 h-4" /> Hint Used: <span className="text-foreground">-10 XP</span>
        </div>
      </div>

      {/* Main Bug Hunting Workspace */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Code Editor & Fix Tool */}
        <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
          <div className="p-3 bg-black/40 border-b border-blue-500/20 flex justify-between items-center text-xs font-bold">
            <span className="text-blue-400 font-mono">buggy_snippet.py</span>
            <div className="flex gap-2">
              <button 
                onClick={handleFindBug}
                disabled={bugFound}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-extrabold text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {bugFound ? "🔍 Bug Located" : "Find Bug (+20 XP)"}
              </button>
              <button 
                onClick={handleRunCode}
                disabled={running}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[11px] flex items-center gap-1.5 hover:scale-105 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run & Test Fix
              </button>
            </div>
          </div>

          <div className="h-80">
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={v => setCode(v || "")}
              options={{ fontSize: 13, minimap: { enabled: false } }}
            />
          </div>
        </div>

        {/* Right: Inspection & Console */}
        <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 p-5 shadow-2xl justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Bug Diagnostic Panel</h3>

            {bugFound && (
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold leading-relaxed animate-in fade-in">
                <strong className="text-foreground block mb-1">🔍 Bug Diagnostic:</strong>
                {activeChallenge.bugExplanation}
              </div>
            )}

            {hintUsed ? (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                <strong>💡 Hint:</strong> {activeChallenge.hint}
              </div>
            ) : (
              <button 
                onClick={() => setHintUsed(true)}
                className="text-xs font-bold text-blue-400 underline hover:text-blue-300 transition-colors"
              >
                Need a hint? (-10 XP penalty)
              </button>
            )}

            {/* Test Results */}
            {passed ? (
              <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 mx-auto text-blue-400" />
                <h4 className="text-lg font-extrabold">BUG SLAIN!</h4>
                <p className="text-xs">Correct logic restored! Output matches expected value.</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                <strong className="block font-bold mb-1">❌ Test Failed:</strong>
                {error}
              </div>
            ) : output ? (
              <div className="p-4 rounded-xl bg-black/40 border border-blue-500/10 text-xs font-mono text-blue-400">
                {output}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
                Inspect the buggy code on the left, locate the issue, and click <strong className="text-blue-400">Run & Test Fix</strong>.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[11px] text-muted-foreground flex justify-between">
            <span>Expected Output: <code className="text-foreground bg-blue-500/10 px-2 py-0.5 rounded font-mono">{activeChallenge.testCases[0].output}</code></span>
          </div>
        </div>
      </div>
    </div>
  )
}
