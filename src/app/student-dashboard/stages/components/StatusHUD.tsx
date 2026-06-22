"use client"

import React from "react"
import { Flame, Coins, Trophy, Award, Sparkles } from "lucide-react"

interface StatusHUDProps {
  user: {
    name: string
    xp: number
    coins: number
    level: number
    currentStreak: number
  }
}

export function StatusHUD({ user }: StatusHUDProps) {
  // Calculate XP progress in current level
  // Level threshold: levels are roughly level * 1000 XP
  const xpInCurrentLevel = user.xp % 1000
  const xpNeededForNextLevel = 1000
  const xpPercent = Math.min(Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100), 100)

  // Get initials for profile picture fallback
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "ST"

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-slate-950/20 p-5 sm:p-6 md:p-8 backdrop-blur-lg w-full">
      {/* Specular highlight & Noise */}
      <div className="glass-noise" />
      <div className="glass-specular" />

      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] rounded-full blur-[80px] bg-indigo-500/10" />
        <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] rounded-full blur-[80px] bg-emerald-500/10" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
        {/* Profile Avatar & Level Shield */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            {/* Glowing neon ring */}
            <div className="absolute inset-0 -m-1 rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 opacity-80 blur-sm animate-pulse" />
            <div className="relative h-16 w-16 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-2xl">
              {initials}
            </div>
            {/* Level Shield badge overlay */}
            <div className="absolute -bottom-2 -right-2 flex items-center justify-center bg-gradient-to-r from-yellow-500 to-amber-600 border border-yellow-400 text-white rounded-lg px-1.5 py-0.5 text-[10px] font-extrabold shadow-[0_0_10px_rgba(234,179,8,0.5)]">
              <Trophy className="w-2.5 h-2.5 mr-0.5" />
              LVL {user.level}
            </div>
          </div>

          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              {user.name}
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            </h2>
            <p className="text-xs text-muted-foreground font-medium">Ranked Scholar</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Level Progress
            </span>
            <span className="font-mono text-foreground">{xpInCurrentLevel} / {xpNeededForNextLevel} XP ({xpPercent}%)</span>
          </div>

          <div className="w-full h-3.5 bg-slate-950/65 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
            {/* Liquid shimmer glowing progress */}
            <div 
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)] relative overflow-hidden"
              style={{ 
                width: `${xpPercent}%`,
                backgroundSize: "200% 100%",
                animation: "liquid-flow 6s linear infinite"
              }}
            >
              {/* Inner white glass refraction line */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent h-[40%]" />
            </div>
          </div>
        </div>

        {/* Gamified counters: Coins & Streak */}
        <div className="flex items-center gap-4 w-full md:w-auto shrink-0 justify-around sm:justify-start">
          {/* Gold Coins */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl relative overflow-hidden">
              <Coins className="w-4 h-4 animate-[spin_6s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest leading-none">Coins</span>
              <span className="text-base font-extrabold text-amber-400 leading-none mt-1">{user.coins}</span>
            </div>
          </div>

          {/* Day Streak */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
            <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
              <Flame className="w-4 h-4 animate-pulse drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-widest leading-none">Streak</span>
              <span className="text-base font-extrabold text-rose-400 leading-none mt-1">{user.currentStreak} Days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
