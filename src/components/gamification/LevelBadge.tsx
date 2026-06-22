import { Trophy } from "lucide-react"

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="relative flex flex-col items-center justify-center h-20 w-20">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
      
      {/* Glass badge */}
      <div className="glass-panel relative flex flex-col items-center justify-center h-16 w-16 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] overflow-hidden">
        <div className="glass-specular" />
        <Trophy className="h-5 w-5 text-primary absolute -top-2.5 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)] z-10" />
        <span className="text-2xl font-black text-primary leading-none mt-2 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] relative z-10">{level}</span>
        <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest relative z-10">Level</span>
      </div>
    </div>
  )
}
