import { Progress } from "@/components/ui/progress"

interface XPBarProps {
  xp: number
  level: number
}

export function XPBar({ xp, level }: XPBarProps) {
  // XP required for next level = 500
  // XP in current level = xp % 500
  const currentLevelXp = xp % 500
  const progressPercentage = (currentLevelXp / 500) * 100

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-foreground">Level {level}</span>
        <span className="text-muted-foreground tabular-nums">{currentLevelXp} / 500 XP</span>
      </div>
      <Progress value={progressPercentage} className="h-2.5" />
    </div>
  )
}
