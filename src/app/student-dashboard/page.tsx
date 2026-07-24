import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Trophy, Clock, Target, Flame, Sparkles, Award, Zap, Coins } from "lucide-react"
import { Leaderboard, StudentLeaderboardEntry } from "@/components/gamification/Leaderboard"

import { DailyChallengesWidget } from "@/components/dashboard/DailyChallengesWidget"
import { RecentBadges } from "@/components/dashboard/RecentBadges"
import { PromoSlider } from "@/components/dashboard/PromoSlider"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch real user from DB
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { xp: true, coins: true, level: true, currentStreak: true, name: true }
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch Leaderboard from DB
  const topUsers = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { xp: 'desc' },
    take: 10,
    include: { department: true }
  })

  const leaderboardData: StudentLeaderboardEntry[] = topUsers.map((u, index) => ({
    id: u.id,
    rank: index + 1,
    name: u.name,
    department: u.department?.name || "Unknown",
    level: u.level,
    xp: u.xp
  }))

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
      {/* Gamification Top Stats - Compact (XP and Points) */}
      <div className="flex flex-row gap-4 w-full md:w-[60%] lg:w-[50%]">
        {/* XP Badge */}
        <div className="flex-1 flex items-center gap-4 p-4 rounded-[20px] bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-md backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#0a0a0a] border border-purple-500/30 flex items-center justify-center overflow-hidden shadow-inner">
            <img src="/images/xp_icon.png" alt="XP" className="w-[120%] h-[120%] object-cover mix-blend-screen hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">XP.</p>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
              {user.xp}
            </div>
          </div>
        </div>
        
        {/* Points Badge */}
        <div className="flex-1 flex items-center gap-4 p-4 rounded-[20px] bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-md backdrop-blur-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#0a0a0a] border border-yellow-500/30 flex items-center justify-center overflow-hidden shadow-inner">
            <img src="/images/points_icon.png" alt="Points" className="w-[120%] h-[120%] object-cover mix-blend-screen hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-widest mb-0.5">Points</p>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
              {user.coins}
            </div>
          </div>
        </div>
      </div>

      {/* Promo Slider */}
      <PromoSlider />

      {/* New Widgets row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DailyChallengesWidget />
        <RecentBadges userId={session.user.id} />
      </div>

      {/* Leaderboard Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">College Leaderboard</h2>
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-black/10 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <Leaderboard data={leaderboardData} />
        </div>
      </div>
    </div>
  )
}
