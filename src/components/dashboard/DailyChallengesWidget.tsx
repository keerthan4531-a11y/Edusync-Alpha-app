import { db } from "@/lib/db"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { Flame, Coins, Zap } from "lucide-react"

export async function DailyChallengesWidget() {
  // Fetch today's challenges (mocking 'today' by just grabbing any 3)
  const challenges = await db.dailyChallenge.findMany({
    take: 3,
    orderBy: { xpReward: 'asc' }
  })

  if (challenges.length === 0) return null;

  return (
    <LiquidGlassCard className="p-6" accentColor="#ef4444">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/15 rounded-xl border border-red-500/20 shadow-[0_0_16px_rgba(239,68,68,0.15)] backdrop-blur-sm">
            <Flame className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Daily Challenges</h2>
        </div>
        <span className="text-xs font-semibold text-red-400/80 bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/15 backdrop-blur-sm">
          Refreshes in 14h
        </span>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl hover:shadow-[var(--glass-shadow-hover)] transition-all duration-300 group gap-4 relative overflow-hidden">
            <div className="glass-noise" />
            <div className="flex flex-col relative z-10">
              <span className="font-medium text-foreground group-hover:text-foreground transition-colors">
                {challenge.type} Challenge
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Difficulty: <span className="text-foreground/70 capitalize font-medium">{challenge.difficulty}</span>
              </span>
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.4)]">
                  <Coins className="w-4 h-4" /> {challenge.coinReward}
                </span>
                <span className="flex items-center gap-1 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]">
                  <Zap className="w-4 h-4" /> {challenge.xpReward} XP
                </span>
              </div>
              <button className="glass-panel px-4 py-1.5 rounded-xl hover:text-primary text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_16px_rgba(139,92,246,0.3)] shrink-0 relative z-10">
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  )
}
