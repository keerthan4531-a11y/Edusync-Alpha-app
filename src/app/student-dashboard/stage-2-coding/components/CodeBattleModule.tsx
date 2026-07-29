"use client"

import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import { 
  Swords, Trophy, Clock, Play, ChevronLeft, Loader2, User
} from "lucide-react"

export function CodeBattleModule({ onBack, onAwardXP }: { onBack: () => void; onAwardXP: (xp: number, coins: number) => void }) {
  const [matchState, setMatchState] = useState<"lobby" | "matchmaking" | "battle" | "result">("lobby")
  const [opponent, setOpponent] = useState("BATMAN_99")
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [code, setCode] = useState("def reverse_list(head):\n    # Reverse linked list elements\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr['next']\n        curr['next'] = prev\n        prev = curr\n        curr = nxt\n    return prev\n\nprint('SUCCESS')")
  const [running, setRunning] = useState(false)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [battleWinner, setBattleWinner] = useState<string | null>(null)

  // Timer countdown
  useEffect(() => {
    if (matchState !== "battle" || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishMatch()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [matchState, timeLeft])

  const handleStartMatchmaking = () => {
    setMatchState("matchmaking")
    setTimeout(() => {
      const opps = ["BATMAN_99", "Student_42", "AlgoNinja", "CyberCoder"]
      setOpponent(opps[Math.floor(Math.random() * opps.length)])
      setMatchState("battle")
      setTimeLeft(600)
      setPlayerScore(0)
      setOpponentScore(0)
    }, 2500)
  }

  const handleRunCode = async () => {
    setRunning(true)
    setTimeout(() => {
      setRunning(false)
      setPlayerScore(100)
      setOpponentScore(85)
      setBattleWinner("YOU")
      setMatchState("result")
      onAwardXP(150, 50)
    }, 2000)
  }

  const handleFinishMatch = () => {
    setMatchState("result")
    setBattleWinner(playerScore >= opponentScore ? "YOU" : opponent)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
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
          <Swords className="w-8 h-8 text-blue-500" /> Code Battle Arena
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">
          2 students match real-time in a 1v1 PvP coding duel for rank points & XP!
        </p>
      </div>

      {matchState === "lobby" && (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-[2rem] text-center border border-blue-500/20 shadow-2xl space-y-6">
          <Swords className="w-16 h-16 mx-auto text-blue-500 animate-pulse" />
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">1v1 Realtime PvP Arena</h2>
            <p className="text-xs text-muted-foreground mt-1">Match with opponents online and solve data structure problems in 10 minutes.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto text-xs font-bold">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              ⚡ Speed & Correctness
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              ⏱️ 10:00 Duel Timer
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              🏆 +150 XP & Rank Points
            </div>
          </div>

          <button 
            onClick={handleStartMatchmaking}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-all"
          >
            Find Opponent Matchmaking ⚔️
          </button>
        </div>
      )}

      {matchState === "matchmaking" && (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-16 rounded-[2rem] text-center border border-blue-500/20 shadow-2xl space-y-4">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          <h2 className="text-xl font-extrabold text-foreground">Finding Matchmaking Opponent...</h2>
          <p className="text-xs text-muted-foreground">Searching active online student queue...</p>
        </div>
      )}

      {matchState === "battle" && (
        <div className="space-y-6">
          {/* Battle Status Banner */}
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-4 rounded-2xl border border-blue-500/20 flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                <User className="w-4 h-4" /> YOU
              </div>
              <span className="text-blue-400 font-bold">VS</span>
              <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                <Swords className="w-4 h-4" /> {opponent}
              </div>
            </div>

            <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-xl border border-blue-500/20 text-sm">
              <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
            </div>
          </div>

          {/* Problem Statement */}
          <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-5 rounded-2xl border border-blue-500/10 space-y-2">
            <h3 className="text-sm font-extrabold text-foreground">Problem: Reverse Linked List</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              Given the head of a singly linked list, reverse the list and return the reversed list head.
            </p>
          </div>

          {/* Code Editor */}
          <div className="neu-flat dark:bg-[#0b0f19] rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">
            <div className="p-3 bg-black/40 border-b border-blue-500/20 flex justify-between items-center text-xs font-bold">
              <span className="text-blue-400 font-mono">solution.py</span>
              <button 
                onClick={handleRunCode}
                disabled={running}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Submit Duel Code
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
        </div>
      )}

      {matchState === "result" && (
        <div className="neu-flat dark:bg-white/5 dark:border-white/10 p-12 rounded-[2rem] text-center border border-blue-500/20 shadow-2xl space-y-6">
          <Trophy className="w-16 h-16 mx-auto text-blue-500 animate-bounce" />
          <div>
            <h2 className="text-3xl font-extrabold text-blue-400">VICTORY IS YOURS!</h2>
            <p className="text-xs text-muted-foreground mt-1">You defeated {opponent} with faster execution time and 100% test case accuracy!</p>
          </div>

          <div className="flex justify-center gap-4 text-xs font-extrabold">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">+150 XP</span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">+50 Coins</span>
            <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">+25 Rank Points</span>
          </div>

          <button 
            onClick={() => setMatchState("lobby")}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs hover:scale-105 transition-all shadow-md shadow-blue-500/20"
          >
            Play Another Battle
          </button>
        </div>
      )}
    </div>
  )
}
