import { db } from "@/lib/db"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Lock, CheckCircle2, PlayCircle } from "lucide-react"

export async function StageProgressOverview({ userId }: { userId: string }) {
  const progresses = await db.stageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stage: { number: 'asc' } }
  })

  const stageColors: Record<number, string> = {
    1: "bg-stage1 text-stage1 border-stage1/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]",
    2: "bg-stage2 text-stage2 border-stage2/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]",
    3: "bg-stage3 text-stage3 border-stage3/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.2)]",
    4: "bg-stage4 text-stage4 border-stage4/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]",
  }

  const stageAccents: Record<number, string> = {
    1: "#8b5cf6",
    2: "#3b82f6",
    3: "#10b981",
    4: "#f59e0b",
  }

  // If no progress seeded, return empty
  if (progresses.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {progresses.map((p) => {
        const isLocked = p.status === "LOCKED"
        const isCompleted = p.status === "COMPLETED"
        const isActive = p.status === "ACTIVE"
        
        const colorClass = stageColors[p.stage.number] || stageColors[1]
        const accent = stageAccents[p.stage.number] || stageAccents[1]

        return (
          <LiquidGlassCard 
            key={p.id} 
            className={`p-5 flex flex-col ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}
            accentColor={isLocked ? undefined : accent}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl bg-opacity-20 border ${colorClass.split(' ')[0]}/20 ${colorClass.split(' ')[2]} backdrop-blur-md`}>
                <span className={`font-bold ${colorClass.split(' ')[1]}`}>
                  S{p.stage.number}
                </span>
              </div>
              <div>
                {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />}
                {isActive && <PlayCircle className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
              </div>
            </div>
            
            <h3 className="font-semibold text-white mb-1">{p.stage.name}</h3>
            
            <div className="mt-auto pt-4 space-y-2">
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{isLocked ? "Locked" : isCompleted ? "Completed" : "In Progress"}</span>
                <span>{isCompleted ? "100%" : isLocked ? "0%" : "45%"}</span> {/* Stub progress % for active */}
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${colorClass.split(' ')[0]}`}
                  style={{ width: isCompleted ? '100%' : isLocked ? '0%' : '45%' }}
                />
              </div>
            </div>
          </LiquidGlassCard>
        )
      })}
    </div>
  )
}
