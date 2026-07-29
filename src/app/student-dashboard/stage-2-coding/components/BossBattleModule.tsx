"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { 
  Flame, Crown, Ghost, ChevronLeft, Loader2
} from "lucide-react"

export function BossBattleModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [bossHP, setBossHP] = useState(100)
  const [code, setCode] = useState("def find_second_largest(arr):\n    # Find the second largest number in array\n    unique_sorted = sorted(list(set(arr)))\n    if len(unique_sorted) < 2:\n        return None\n    return unique_sorted[-2]\n\nprint(find_second_largest([4, 7, 2, 9, 1]))")
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [bossDefeated, setBossDefeated] = useState(false)

  const testCases = [
    { input: "[4, 7, 2, 9, 1]", output: "7" },
    { input: "[10, 20, 30, 40, 50]", output: "40" },
    { input: "[5, 5, 5, 10]", output: "5" },
    { input: "[1, 2]", output: "1" },
    { input: "[100, 99, 98]", output: "99" }
  ]

  const handleFightBoss = async () => {
    setRunning(true)
    setOutput("")
    setError("")

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: code,
          languageId: "71",
          testCases
        })
      })
      const data = await res.json()
      if (res.ok && data.success && data.results) {
        const passedCount = data.results.filter((r: any) => (r.stdout || "").trim() !== "").length
        const damage = passedCount * 20
        const newHP = Math.max(100 - damage, 0)
        setBossHP(newHP)
        setOutput(`Attacked Boss! Passed ${passedCount}/${testCases.length} test cases! Dealt ${damage} HP damage!`)

        if (newHP === 0) {
          setBossDefeated(true)
          onAwardXP(250, 100)
        }
      } else {
        setError(data.message || "Boss spell reflected back! Code execution error.")
      }
    } catch (e) {
      setError("Network timeout fighting boss.")
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
          <Crown className="w-8 h-8 text-blue-500" /> Logic Boss Battles 👑
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          Defeat Boss Monsters by passing test cases to deal HP damage & claim epic rewards!
        </p>
      </div>

      {/* Boss Health Bar Card */}
      <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-6 rounded-[2rem] border border-blue-500/20 shadow-2xl space-y-4 text-center">
        <div className="flex items-center justify-center gap-3">
          <Ghost className="w-12 h-12 text-blue-400 animate-pulse" />
          <div className="text-left">
            <h2 className="text-2xl font-extrabold text-foreground">👹 BOSS: Array Monster</h2>
            <p className="text-xs text-muted-foreground">Find the second largest number in input array [4, 7, 2, 9, 1]</p>
          </div>
        </div>

        {/* HP Bar */}
        <div className="max-w-xl mx-auto space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold text-blue-400">
            <span>HEALTH BAR</span>
            <span>❤️ {bossHP} / 100 HP</span>
          </div>
          <div className="w-full h-4 bg-black/40 rounded-full border border-blue-500/30 overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" 
              style={{ width: `${bossHP}%` }} 
            />
          </div>
        </div>

        <div className="flex justify-center gap-4 text-xs font-bold text-muted-foreground pt-1">
          <span className="text-blue-400">⚡ 5 Test Cases</span>
          <span>💥 -20 HP Per Passed Case</span>
          <span className="text-blue-400">🏆 +250 XP Rewards</span>
        </div>
      </div>

      {/* Code Workspace */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="flex flex-col neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
          <div className="p-3 bg-black/40 border-b border-blue-500/20 flex justify-between items-center text-xs font-bold">
            <span className="text-blue-400 font-mono">boss_slayer.py</span>
            <button 
              onClick={handleFightBoss}
              disabled={running || bossDefeated}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
              Attack Boss Monster!
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
            <h3 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">Battle Combat Log</h3>

            {bossDefeated ? (
              <div className="p-8 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center space-y-3 animate-in fade-in zoom-in-95">
                <Crown className="w-16 h-16 mx-auto text-blue-400 animate-bounce" />
                <h4 className="text-2xl font-extrabold text-blue-300">💥 BOSS DEFEATED!</h4>
                <p className="text-xs">You passed all test cases and completely depleted the Array Monster's HP!</p>
                <div className="flex justify-center gap-3 pt-2">
                  <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full font-extrabold text-xs">+250 XP</span>
                  <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full font-extrabold text-xs">+100 Coins</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {error}
              </div>
            ) : output ? (
              <div className="p-4 rounded-xl bg-black/40 border border-blue-500/10 text-xs font-mono text-blue-400">
                {output}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground text-xs font-semibold">
                Write Python solution to find the second largest number and click <strong className="text-blue-400">Attack Boss Monster</strong>.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 text-[11px] text-muted-foreground flex justify-between">
            <span>Expected Result for [4, 7, 2, 9, 1]: <code className="text-foreground font-mono">7</code></span>
          </div>
        </div>
      </div>
    </div>
  )
}
