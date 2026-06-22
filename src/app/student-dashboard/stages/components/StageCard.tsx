"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Lock, ArrowRight, BookOpen, Code, Briefcase, GraduationCap, X } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

// Lucide icon mapping based on stage number
const stageIcons: Record<number, any> = {
  1: BookOpen,
  2: Code,
  3: Briefcase,
  4: GraduationCap,
}

// Stage accent configurations matching our premium design system
const stageAccents: Record<number, {
  color: string
  accent: string
  bgColor: string
  borderColor: string
  glowShadow: string
  description: string
}> = {
  1: {
    color: "text-violet-400",
    accent: "#8b5cf6",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    glowShadow: "rgba(139, 92, 246, 0.15)",
    description: "Master professional business communication, presentation, and vocabulary.",
  },
  2: {
    color: "text-blue-400",
    accent: "#3b82f6",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    glowShadow: "rgba(59, 130, 246, 0.15)",
    description: "Learn fundamental algorithms, arrays, recursion, and object-oriented programming.",
  },
  3: {
    color: "text-emerald-400",
    accent: "#10b981",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    glowShadow: "rgba(16, 185, 129, 0.15)",
    description: "Collaborate in teams to deploy full-stack web applications and systems.",
  },
  4: {
    color: "text-amber-400",
    accent: "#f59e0b",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    glowShadow: "rgba(245, 158, 11, 0.15)",
    description: "Prepare resume profiles, solve mock technical interviews, and target placements.",
  },
}

interface StageCardProps {
  progress: {
    id: string
    status: string
    stage: {
      id: string
      number: number
      name: string
      unlockXpThreshold: number
    }
  }
  index: number
}

export function StageCard({ progress, index }: StageCardProps) {
  const [showLockedModal, setShowLockedModal] = useState(false)
  const meta = stageAccents[progress.stage.number] || stageAccents[1]
  const Icon = stageIcons[progress.stage.number] || BookOpen

  const isLocked = progress.status === "LOCKED"
  const isCompleted = progress.status === "COMPLETED"
  const isActive = progress.status === "ACTIVE"

  const progressPercent = isCompleted ? 100 : isActive ? 45 : 0
  const href = `/student-dashboard/stage-${progress.stage.number}-${
    progress.stage.number === 1
      ? "communication"
      : progress.stage.number === 2
      ? "coding"
      : progress.stage.number === 3
      ? "projects"
      : "career"
  }`

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      setShowLockedModal(true)
    }
  }

  return (
    <>
      <Link 
        href={isLocked ? "#" : href}
        onClick={handleCardClick}
        className="group block relative z-10 w-full animate-in fade-in slide-in-from-bottom-3 duration-500"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Dynamic Hover Glow in the background */}
        {!isLocked && (
          <div 
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, ${meta.glowShadow} 0%, transparent 70%)` 
            }}
          />
        )}

        <LiquidGlassCard 
          className={`p-5 sm:p-6 flex flex-col sm:flex-row gap-5 transition-all duration-300 ${
            isLocked 
              ? "opacity-60 grayscale-[0.2] border-white/5 bg-slate-950/10 cursor-not-allowed" 
              : "group-hover:-translate-y-1 hover:border-white/15"
          }`}
          accentColor={isLocked ? undefined : meta.accent}
          enableShimmer={!isLocked}
        >
          {/* Holographic glowing stage icon */}
          <div className={`relative shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
            isLocked 
              ? 'bg-slate-900/40 border-white/5 text-muted-foreground' 
              : `${meta.bgColor} ${meta.borderColor} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`
          }`}>
            <Icon className={`w-8 h-8 ${isLocked ? 'text-muted-foreground/60' : meta.color} ${!isLocked ? 'drop-shadow-[0_0_6px_currentColor]' : ''}`} />
          </div>
          
          <div className="flex flex-col justify-center flex-1">
            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap sm:flex-nowrap">
              <h2 className="text-base sm:text-xl font-extrabold text-foreground tracking-tight group-hover:text-primary transition-colors">
                Stage {progress.stage.number}: {progress.stage.name}
              </h2>
              
              {/* Responsive status badges */}
              <div className="flex items-center gap-2 shrink-0">
                {isCompleted && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                  </span>
                )}
                {isActive && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] animate-pulse">
                    Active
                  </span>
                )}
                {isLocked && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-muted-foreground text-[10px] font-bold border border-white/5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed font-medium">
              {meta.description}
            </p>
            
            {/* Shimmer progress bar */}
            <div className="space-y-1.5 w-full">
              <div className="flex justify-between text-xs text-muted-foreground font-semibold">
                <span>Stage Progress</span>
                <span className="tabular-nums font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950/50 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out`} 
                  style={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: isLocked ? "rgba(255, 255, 255, 0.1)" : meta.accent,
                    boxShadow: progressPercent > 0 ? `0 0 10px ${meta.accent}50` : 'none',
                    backgroundImage: !isLocked ? "linear-gradient(90deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)" : "none",
                    backgroundSize: "20px 20px",
                    animation: !isLocked ? "liquid-flow 4s linear infinite" : "none"
                  }}
                />
              </div>
            </div>
          </div>

          {/* Floating arrow navigation shortcut */}
          {!isLocked && (
            <div className="hidden sm:flex items-center justify-center pl-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg hover:bg-white/10 transition-colors">
                <ArrowRight className="w-5 h-5 text-foreground" />
              </div>
            </div>
          )}
        </LiquidGlassCard>
      </Link>

      {/* Floating locked info modal */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-slate-900/90 max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="glass-noise" />
            <div className="glass-specular" />
            
            <button 
              onClick={() => setShowLockedModal(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl mb-1 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-bounce">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-foreground">Stage {progress.stage.number} Locked</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px]">
              This stage is currently locked. To unlock it, you must earn more experience and reach the required XP threshold of:
            </p>
            
            <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 w-full font-mono text-sm font-bold text-rose-400">
              {progress.stage.unlockXpThreshold} XP Required
            </div>

            <button
              onClick={() => setShowLockedModal(false)}
              className="mt-2 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Return to Journey
            </button>
          </div>
        </div>
      )}
    </>
  )
}
