import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

import { XPBar } from "@/components/gamification/XPBar"
import { LevelBadge } from "@/components/gamification/LevelBadge"
import { StreakCounter } from "@/components/gamification/StreakCounter"
import { Leaderboard, StudentLeaderboardEntry } from "@/components/gamification/Leaderboard"

import { StageProgressOverview } from "@/components/dashboard/StageProgressOverview"
import { DailyChallengesWidget } from "@/components/dashboard/DailyChallengesWidget"
import { RecentBadges } from "@/components/dashboard/RecentBadges"

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect("/login")
  }

  // Fetch real user from DB
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, xp: true, coins: true, level: true, currentStreak: true }
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <section className="glass-panel flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-6 rounded-[2rem] animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
        <div className="glass-noise" />
        <div className="glass-specular" />
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {user.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">You're making great progress. Keep up the momentum.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto relative z-10">
          <StreakCounter streak={user.currentStreak} />
        </div>
      </section>

      {/* Stage Progress Overview row */}
      <StageProgressOverview userId={session.user.id} />

      {/* Gamification Top Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <LiquidGlassCard className="md:col-span-2 p-6 flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-6 text-center sm:text-left" accentColor="#3b82f6">
          <LevelBadge level={user.level} />
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-foreground mb-3">Current Progress</h3>
            <XPBar xp={user.xp} level={user.level} />
          </div>
        </LiquidGlassCard>
        
        <LiquidGlassCard className="p-6 flex flex-col justify-center items-center text-center" accentColor="#eab308">
          <h3 className="tracking-tight text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-widest">Total Coins</h3>
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]">
            {user.coins}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-medium">Earn more by solving challenges!</p>
        </LiquidGlassCard>
      </div>

      {/* New Widgets row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DailyChallengesWidget />
        <RecentBadges userId={session.user.id} />
      </div>

      {/* Leaderboard Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">College Leaderboard</h2>
        <LiquidGlassCard className="overflow-hidden" enableShimmer={true} accentColor="#8b5cf6">
          <Leaderboard data={leaderboardData} />
        </LiquidGlassCard>
      </div>
    </div>
  )
}
