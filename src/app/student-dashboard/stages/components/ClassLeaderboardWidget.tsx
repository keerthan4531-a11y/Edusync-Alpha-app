"use client"

import React from "react"
import { Trophy, Medal, Award, Crown } from "lucide-react"

interface LeaderboardEntry {
  id: string
  name: string
  xp: number
  level: number
}

interface ClassLeaderboardWidgetProps {
  entries: LeaderboardEntry[]
}

export function ClassLeaderboardWidget({ entries }: ClassLeaderboardWidgetProps) {
  // Take top 3 for the podium
  const topThree = entries.slice(0, 3)
  // Rearrange top 3 for classic podium look: [2nd, 1st, 3rd]
  const podiumOrder = []
  if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2 })
  if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1 })
  if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3 })

  const remaining = entries.slice(3, 5)

  // Mapping for podium styles
  const podiumStyles: Record<number, {
    height: string
    accentColor: string
    glowColor: string
    bgGrad: string
    borderGrad: string
    badgeColor: string
    icon: any
  }> = {
    1: {
      height: "h-36 sm:h-40",
      accentColor: "text-yellow-400",
      glowColor: "rgba(234, 179, 8, 0.4)",
      bgGrad: "from-yellow-500/10 via-amber-500/15 to-transparent",
      borderGrad: "border-yellow-500/30",
      badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      icon: Crown,
    },
    2: {
      height: "h-28 sm:h-32",
      accentColor: "text-slate-300",
      glowColor: "rgba(203, 213, 225, 0.3)",
      bgGrad: "from-slate-400/10 via-slate-500/10 to-transparent",
      borderGrad: "border-slate-400/20",
      badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/20",
      icon: Medal,
    },
    3: {
      height: "h-24 sm:h-28",
      accentColor: "text-amber-600",
      glowColor: "rgba(217, 119, 6, 0.3)",
      bgGrad: "from-amber-700/10 via-amber-800/10 to-transparent",
      borderGrad: "border-amber-700/20",
      badgeColor: "bg-amber-700/20 text-amber-500 border-amber-700/20",
      icon: Award,
    },
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[var(--glass-border)] bg-slate-950/20 p-5 sm:p-6 backdrop-blur-lg w-full flex flex-col h-full">
      <div className="glass-noise" />
      <div className="glass-specular" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl">
          <Trophy className="w-5 h-5 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">Class Leaders</h3>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground py-8">
          Leaderboard is loading...
        </div>
      ) : (
        <div className="flex flex-col gap-6 relative z-10 flex-1 justify-between">
          {/* Podium Visualizer */}
          <div className="flex items-end justify-center gap-2 sm:gap-4 pt-4 border-b border-white/5 pb-5">
            {podiumOrder.map((entry) => {
              const style = podiumStyles[entry.rank]
              const Icon = style.icon
              const initials = entry.name
                ? entry.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                : "ST"

              return (
                <div 
                  key={entry.id} 
                  className={`flex flex-col items-center flex-1 transition-transform duration-500 hover:scale-[1.03] ${
                    entry.rank === 1 ? "z-20 -translate-y-2" : "z-10"
                  }`}
                >
                  {/* Rank Crown/Medal */}
                  <Icon className={`w-5 h-5 ${style.accentColor} mb-2 drop-shadow-[0_0_6px_currentColor]`} />
                  
                  {/* Profile avatar with glowing outline */}
                  <div className={`relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-900 border ${style.borderGrad} flex items-center justify-center text-xs font-bold text-white shadow-lg`}>
                    {initials}
                  </div>
                  
                  {/* Student Name */}
                  <span className="text-[10px] sm:text-xs font-bold text-foreground mt-2 truncate w-16 sm:w-20 text-center">
                    {entry.name.split(" ")[0]}
                  </span>

                  {/* Vertical Podium Column */}
                  <div 
                    className={`w-full ${style.height} mt-2 rounded-t-2xl border-t border-x ${style.borderGrad} bg-gradient-to-t ${style.bgGrad} flex flex-col justify-end p-2 relative`}
                    style={{
                      boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 15px ${style.glowColor}`
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${style.badgeColor}`}>
                        LVL {entry.level}
                      </span>
                      <span className="text-[9px] sm:text-[11px] font-extrabold text-white mt-1 tabular-nums">
                        {entry.xp}
                      </span>
                      <span className="text-[7px] text-muted-foreground uppercase tracking-wider font-extrabold">XP</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Runners-up List (Ranks 4 & 5) */}
          {remaining.length > 0 && (
            <div className="flex flex-col gap-2">
              {remaining.map((entry, idx) => {
                const initials = entry.name
                  ? entry.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                  : "ST"
                const rank = idx + 4

                return (
                  <div 
                    key={entry.id}
                    className="flex justify-between items-center p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-extrabold text-muted-foreground font-mono w-4 text-center">
                        #{rank}
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                        {initials}
                      </div>
                      <span className="font-bold text-foreground truncate w-24 sm:w-28 text-left">
                        {entry.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-muted-foreground">
                        LVL {entry.level}
                      </span>
                      <span className="font-bold text-indigo-400 tabular-nums">
                        {entry.xp} <span className="text-[8px] text-muted-foreground">XP</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
