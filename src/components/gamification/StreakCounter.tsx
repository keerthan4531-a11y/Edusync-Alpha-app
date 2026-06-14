import { Flame } from "lucide-react"

interface StreakCounterProps {
  streak: number
}

export function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-1.5 text-orange-400 font-bold bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
      <Flame className="h-4 w-4" />
      <span>{streak} Day Streak!</span>
    </div>
  )
}
