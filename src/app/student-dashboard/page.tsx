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
    select: { xp: true, coins: true, level: true, currentStreak: true }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Student Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here is your learning progress.</p>
        </div>
        <StreakCounter streak={user.currentStreak} />
      </div>

      {/* Stage Progress Overview row */}
      <StageProgressOverview userId={session.user.id} />

      {/* Gamification Top Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <LiquidGlassCard className="md:col-span-2 p-6 flex items-center gap-6" accentColor="#3b82f6">
          <LevelBadge level={user.level} />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Current Progress</h3>
            <XPBar xp={user.xp} level={user.level} />
          </div>
        </LiquidGlassCard>
        
        <LiquidGlassCard className="p-6 flex flex-col justify-center items-center text-center" accentColor="#eab308">
          <h3 className="tracking-tight text-sm font-semibold text-gray-400 uppercase mb-2">Total Coins</h3>
          <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.4)]">
            {user.coins}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">Earn more by solving challenges!</p>
        </LiquidGlassCard>
      </div>

      {/* New Widgets row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DailyChallengesWidget />
        <RecentBadges userId={session.user.id} />
      </div>

      {/* Leaderboard Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-4">College Leaderboard</h2>
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
          <Leaderboard data={leaderboardData} />
        </div>
      </div>
    </div>
  )
}
