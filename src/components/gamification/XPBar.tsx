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
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Level {level}</span>
        <span className="text-muted-foreground">{currentLevelXp} / 500 XP</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  )
}
