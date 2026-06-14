import { GlassCard } from "@/components/ui/glass-card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

import { XPBar } from "@/components/gamification/XPBar"
import { LevelBadge } from "@/components/gamification/LevelBadge"
import { StreakCounter } from "@/components/gamification/StreakCounter"
import { Leaderboard, StudentLeaderboardEntry } from "@/components/gamification/Leaderboard"

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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here is your learning progress.</p>
        </div>
        <StreakCounter streak={user.currentStreak} />
      </div>



      {/* Gamification Top Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="md:col-span-2 p-6 flex items-center gap-6">
          <LevelBadge level={user.level} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Current Progress</h3>
            <XPBar xp={user.xp} level={user.level} />
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="tracking-tight text-sm font-medium text-muted-foreground mb-2">Total Coins</h3>
          <div className="text-4xl font-bold text-yellow-500">🪙 {user.coins}</div>
          <p className="text-xs text-muted-foreground mt-2">Earn more by solving challenges!</p>
        </GlassCard>
      </div>

      {/* Leaderboard Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">College Leaderboard</h2>
        <Leaderboard data={leaderboardData} />
      </div>
    </div>
  )
}
