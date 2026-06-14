import { Trophy } from "lucide-react"

interface LevelBadgeProps {
  level: number
}

export function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-full h-16 w-16 border-4 border-primary/20 shadow-sm relative">
      <Trophy className="h-6 w-6 text-primary absolute -top-3" />
      <span className="text-xl font-black text-primary leading-none mt-2">{level}</span>
      <span className="text-[10px] font-bold text-primary/70 uppercase">Level</span>
    </div>
  )
}
