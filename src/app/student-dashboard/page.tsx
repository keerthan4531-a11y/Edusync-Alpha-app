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
        <div className="flex-1 flex items-center gap-4 p-4 rounded-[20px] neu-raised dark:bg-white/5 dark:border dark:border-white/10 dark:shadow-none hover:scale-[1.02] transition-all duration-300">
          <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden neu-inset-sm dark:bg-[#0a0a0a] dark:border dark:border-purple-500/30 dark:shadow-inner">
            <img src="/images/xp_icon.png" alt="XP" className="w-[120%] h-[120%] object-cover dark:mix-blend-screen hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">XP.</p>
            <div className="text-xl sm:text-2xl font-extrabold text-foreground leading-none">
              {user.xp}
            </div>
          </div>
        </div>
        
        {/* Points Badge */}
        <div className="flex-1 flex items-center gap-4 p-4 rounded-[20px] neu-raised dark:bg-white/5 dark:border dark:border-white/10 dark:shadow-none hover:scale-[1.02] transition-all duration-300">
          <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden neu-inset-sm dark:bg-[#0a0a0a] dark:border dark:border-yellow-500/30 dark:shadow-inner">
            <img src="/images/points_icon.png" alt="Points" className="w-[120%] h-[120%] object-cover dark:mix-blend-screen hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Points</p>
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
        <div className="rounded-3xl overflow-hidden neu-raised-lg dark:bg-white/5 dark:backdrop-blur-2xl dark:border dark:border-white/10 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Leaderboard data={leaderboardData} />
        </div>
      </div>
    </div>
  )
}
