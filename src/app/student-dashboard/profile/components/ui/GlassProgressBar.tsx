import React from "react"
import { cn } from "@/lib/utils"

interface GlassProgressBarProps {
  current: number
  goal: number
  labelCurrent?: string
  labelGoal?: string
  fillGradient?: string
  className?: string
}

export function GlassProgressBar({
  current,
  goal,
  labelCurrent = "Current",
  labelGoal = "Goal",
  fillGradient = "from-primary to-secondary",
  className
}: GlassProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / goal) * 100)) || 0

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="h-2 w-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-full overflow-hidden">
        <div 
          className={cn("h-full bg-gradient-to-r transition-all duration-1000 ease-out", fillGradient)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-medium">
        <span className="text-foreground/80">
          {labelCurrent}: <span className="font-bold text-foreground">{current}</span>
        </span>
        <span className="text-muted-foreground">
          {labelGoal}: {goal}
        </span>
      </div>
    </div>
  )
}
