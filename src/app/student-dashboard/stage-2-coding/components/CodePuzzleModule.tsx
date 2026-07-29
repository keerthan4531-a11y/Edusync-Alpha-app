"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { 
  Puzzle, Lock, Unlock, Key, ChevronLeft, Loader2, XCircle
} from "lucide-react"

interface PuzzleChallenge {
  id: string
  doorTitle: string
  story: string
  clues: string[]
  initialCode: string
  expectedKey: string
}

const PUZZLE_CHALLENGES: PuzzleChallenge[] = [
  {
    id: "fib-lock",
    doorTitle: "🔐 Vault Door #1 — Fibonacci Password",
    story: "The ancient vault door requires a Fibonacci password sequence to release its heavy magnetic lock.",
    clues: [
      "🗝️ Hint 1: Sequence starts with 0, 1",
      "🗝️ Hint 2: Every subsequent number = sum of the previous two numbers",
      "🗝️ Clue 3: The 10th Fibonacci number (0-indexed F(10)) unlocks the door."
    ],
    initialCode: "def fib(n):\n    if n <= 0: return 0\n    if n == 1: return 1\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n\nprint(fib(10))",
    expectedKey: "55"
  },
  {
    id: "cipher-lock",
    doorTitle: "🔐 Secret Gate #2 — Caesar Shift Password",
    story: "Decipher the encrypted password 'KHOOR' shifted backwards by 3 letters in the alphabet.",
    clues: [
      "🗝️ Hint 1: Caesar cipher shifts each character by -3 positions.",
      "🗝️ Hint 2: 'K' -> 'H', 'H' -> 'E', 'O' -> 'L', 'O' -> 'L', 'R' -> 'O'",
      "🗝️ Clue 3: Output the decrypted word in uppercase to unlock the gate."
    ],
    initialCode: "cipher = 'KHOOR'\n# Decrypt with shift -3\ndecrypted = ''.join(chr(ord(c) - 3) for c in cipher)\nprint(decrypted)",
    expectedKey: "HELLO"
  }
]

export function CodePuzzleModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const activePuzzle = PUZZLE_CHALLENGES[selectedIdx]

  const [code, setCode] = useState(activePuzzle.initialCode)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [unlocked, setUnlocked] = useState(false)

  const handleSelectPuzzle = (idx: number) => {
    setSelectedIdx(idx)
    setCode(PUZZLE_CHALLENGES[idx].initialCode)
    setOutput("")
    setError("")
    setUnlocked(false)
  }

  const handleRunCode = async () => {
    setRunning(true)
    setOutput("")
    setError("")
    setUnlocked(false)

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: "71",
          testCases: [{ input: "", output: activePuzzle.expectedKey }]
        })
      })
      const data = await res.json()
      if (res.ok && data.success && data.results) {
        const stdout = (data.results[0].stdout || "").trim()
        const stderr = data.results[0].stderr || ""
        setOutput(stdout)
        if (stderr) setError(stderr)

        if (stdout.toUpperCase().includes(activePuzzle.expectedKey.toUpperCase())) {
          setUnlocked(true)
          onAwardXP(100, 40)
        } else if (!stderr) {
          setError(`Incorrect key "${stdout}". Re-check the clues.`)
        }
      } else {
        setError(data.message || "Execution error.")
      }
    } catch (e) {
      setError("Network error.")
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
          <Puzzle className="w-8 h-8 text-blue-500" /> Code Puzzle
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Crack secret door passwords & vault ciphers using clues and algorithm logic.
        </p>
      </div>

      {/* Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {PUZZLE_CHALLENGES.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => handleSelectPuzzle(idx)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shrink-0 border ${
              selectedIdx === idx
                ? "bg-blue-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10"
                : "neu-flat dark:bg-white/5 text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            🧩 {p.doorTitle}
          </button>
        ))}
      </div>

      {/* Clues Card */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-2xl border border-blue-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
            {unlocked ? <Unlock className="w-5 h-5 text-blue-400" /> : <Lock className="w-5 h-5 text-blue-400" />}
            {activePuzzle.doorTitle}
          </h2>
          <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Clue Puzzle
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{activePuzzle.story}</p>

        <div className="flex flex-col gap-2">
          {activePuzzle.clues.map((clue, i) => (
            <div key={i} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300">
              {clue}
            </div>
          ))}
        </div>
      </div>

      {/* Workspace & Lock Output */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
          <div className="p-3 bg-black/40 border-b border-blue-500/20 flex justify-between items-center text-xs font-bold">
            <span className="text-blue-400 font-mono">cipher_solver.py</span>
            <button 
              onClick={handleRunCode}
              disabled={running}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Execute & Unlock Door
            </button>
          </div>
          <div className="h-72">
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

        <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 p-5 shadow-2xl justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">Door Lock Mechanism</h3>

            {unlocked ? (
              <div className="p-8 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center space-y-3 animate-in fade-in zoom-in-95">
                <Unlock className="w-16 h-16 mx-auto text-blue-400 animate-bounce" />
                <h4 className="text-xl font-extrabold">DOOR UNLOCKED!</h4>
                <p className="text-xs">Password key verified: <code className="font-mono bg-blue-500/20 px-2 py-1 rounded font-bold text-blue-300">{output}</code></p>
                <span className="inline-block px-4 py-1.5 bg-blue-500/20 rounded-full text-xs font-extrabold text-blue-300">
                  +100 XP & +40 Coins Awarded!
                </span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                <XCircle className="w-4 h-4 inline mr-2 text-rose-500" />
                {error}
              </div>
            ) : output ? (
              <div className="p-4 rounded-xl bg-black/40 border border-blue-500/10 text-xs font-mono text-blue-400">
                Key Generated: {output}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground text-xs font-semibold">
                Write Python program to derive the secret key, then click <strong className="text-blue-400">Execute & Unlock Door</strong>.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[11px] text-muted-foreground flex justify-between">
            <span>Required Password Format: <code className="text-foreground font-mono">{activePuzzle.expectedKey}</code></span>
          </div>
        </div>
      </div>
    </div>
  )
}
