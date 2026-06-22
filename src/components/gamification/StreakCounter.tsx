import { Flame } from "lucide-react"

interface StreakCounterProps {
  streak: number
}

export function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="glass-panel relative flex items-center gap-2 text-orange-400 font-bold px-4 py-2 rounded-2xl border border-orange-400/20 shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden">
      <div className="glass-specular" />
      {/* Fire glow behind icon */}
      <div className="absolute left-3 w-6 h-6 bg-orange-500/40 rounded-full blur-xl animate-pulse" />
      <Flame className="h-5 w-5 relative z-10 drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
      <span className="relative z-10 text-sm drop-shadow-sm">{streak} Day Streak!</span>
    </div>
  )
}
