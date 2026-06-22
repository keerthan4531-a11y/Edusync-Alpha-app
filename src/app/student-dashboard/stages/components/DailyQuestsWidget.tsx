"use client"

import React, { useState } from "react"
import { Flame, Coins, Zap, CheckCircle2, Circle } from "lucide-react"

interface Quest {
  id: string
  title: string
  type: string
  xpReward: number
  coinReward: number
  isCompleted?: boolean
}

interface DailyQuestsWidgetProps {
  initialQuests?: Quest[]
}

const defaultQuests: Quest[] = [
  {
    id: "quest-1",
    title: "Complete 1 Audio Challenge",
    type: "Communication",
    xpReward: 150,
    coinReward: 50,
    isCompleted: true,
  },
  {
    id: "quest-2",
    title: "Solve 1 Array Coding Quiz",
    type: "Coding",
    xpReward: 200,
    coinReward: 100,
    isCompleted: false,
  },
  {
    id: "quest-3",
    title: "Create 1 Project outline draft",
    type: "Projects",
    xpReward: 250,
    coinReward: 150,
    isCompleted: false,
  },
]

export function DailyQuestsWidget({ initialQuests }: DailyQuestsWidgetProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests || defaultQuests)

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isCompleted: !q.isCompleted } : q))
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-slate-950/20 p-5 sm:p-6 backdrop-blur-lg w-full flex flex-col h-full">
      <div className="glass-noise" />
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl">
            <Flame className="w-5 h-5 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">Daily Quests</h3>
        </div>
        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
          Refreshes In 12h
        </span>
      </div>

      {/* Quest Checklist */}
      <div className="flex flex-col gap-3 relative z-10 flex-1 justify-center">
        {quests.map((quest) => {
          const completed = quest.isCompleted
          return (
            <div 
              key={quest.id}
              onClick={() => toggleQuest(quest.id)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                completed 
                  ? "bg-emerald-500/5 border-emerald-500/25 opacity-75"
                  : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-3 mr-2">
                {/* Custom Tick indicator */}
                <div className="shrink-0 transition-transform duration-300 active:scale-95">
                  {completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-xs font-bold leading-tight ${
                    completed ? "line-through text-muted-foreground/75" : "text-foreground"
                  }`}>
                    {quest.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold mt-0.5">
                    {quest.type}
                  </span>
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center gap-2 shrink-0 text-[10px] font-bold">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Coins className="w-3.5 h-3.5" /> +{quest.coinReward}
                </span>
                <span className="flex items-center gap-0.5 text-indigo-400">
                  <Zap className="w-3.5 h-3.5" /> +{quest.xpReward} XP
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
