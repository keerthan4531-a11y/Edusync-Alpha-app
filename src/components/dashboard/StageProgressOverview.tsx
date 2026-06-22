import { db } from "@/lib/db"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Lock, CheckCircle2, PlayCircle } from "lucide-react"

export async function StageProgressOverview({ userId }: { userId: string }) {
  const progresses = await db.stageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stage: { number: 'asc' } }
  })

  const stageStyles: Record<number, { color: string; accent: string; glowShadow: string }> = {
    1: { color: "text-stage1", accent: "#8b5cf6", glowShadow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]" },
    2: { color: "text-stage2", accent: "#3b82f6", glowShadow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
    3: { color: "text-stage3", accent: "#10b981", glowShadow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
    4: { color: "text-stage4", accent: "#f59e0b", glowShadow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
  }

  const stageBgColors: Record<number, string> = {
    1: "bg-stage1",
    2: "bg-stage2",
    3: "bg-stage3",
    4: "bg-stage4",
  }

  // If no progress seeded, return empty
  if (progresses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {progresses.map((p) => {
        const isLocked = p.status === "LOCKED"
        const isCompleted = p.status === "COMPLETED"
        const isActive = p.status === "ACTIVE"
        
        const style = stageStyles[p.stage.number] || stageStyles[1]
        const bgColor = stageBgColors[p.stage.number] || "bg-stage1"

        return (
          <LiquidGlassCard 
            key={p.id} 
            className={`p-5 flex flex-col ${isLocked ? 'opacity-60 grayscale-[0.3]' : ''} ${!isLocked ? style.glowShadow : ''}`}
            accentColor={isLocked ? undefined : style.accent}
            enableShimmer={!isLocked}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${isLocked ? 'bg-[var(--glass-bg)]' : `${bgColor}/15`} border border-[var(--glass-border-subtle)] backdrop-blur-sm`}>
                <span className={`font-bold text-sm ${isLocked ? 'text-muted-foreground' : style.color}`}>
                  S{p.stage.number}
                </span>
              </div>
              <div>
                {isLocked && <Lock className="w-5 h-5 text-muted-foreground" />}
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                {isActive && <PlayCircle className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />}
              </div>
            </div>
            
            <h3 className="font-semibold text-foreground mb-1 text-sm">{p.stage.name}</h3>
            
            <div className="mt-auto pt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{isLocked ? "Locked" : isCompleted ? "Completed" : "In Progress"}</span>
                <span className="tabular-nums">{isCompleted ? "100%" : isLocked ? "0%" : "45%"}</span>
              </div>
              <div className="h-1.5 w-full glass-panel rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${bgColor}`}
                  style={{ 
                    width: isCompleted ? '100%' : isLocked ? '0%' : '45%',
                    boxShadow: isLocked ? 'none' : `inset 0 1px 1px rgba(255,255,255,0.4), 0 0 10px ${style.accent}80, 0 0 20px ${style.accent}40`
                  }}
                />
              </div>
            </div>
          </LiquidGlassCard>
        )
      })}
    </div>
  )
}
