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
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]">
            <Flame className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Daily Challenges</h2>
        </div>
        <span className="text-sm font-medium text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          Refreshes in 14h
        </span>
      </div>

      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] group">
            <div className="flex flex-col">
              <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
                {challenge.type} Challenge
              </span>
              <span className="text-xs text-gray-400">
                Difficulty: <span className="text-gray-300 capitalize">{challenge.difficulty}</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.4)]">
                  <Coins className="w-4 h-4" /> {challenge.coinReward}
                </span>
                <span className="flex items-center gap-1 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]">
                  <Zap className="w-4 h-4" /> {challenge.xpReward} XP
                </span>
              </div>
              <button className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/10">
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </LiquidGlassCard>
  )
}
