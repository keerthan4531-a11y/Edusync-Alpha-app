import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Milestone, Sparkles } from "lucide-react"

import { StatusHUD } from "./components/StatusHUD"
import { StageCard } from "./components/StageCard"
import { SkillPathConnector } from "./components/SkillPathConnector"
import { DailyQuestsWidget } from "./components/DailyQuestsWidget"
import { ClassLeaderboardWidget } from "./components/ClassLeaderboardWidget"

export const metadata = {
  title: "Learning Journey Stages | EduSync",
  description: "Embark on your path to professional skill mastery.",
}

export default async function StagesPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect("/login")
  }
  const userId = session.user.id

  // Fetch student stats
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, xp: true, coins: true, level: true, currentStreak: true }
  })

  if (!user) {
    redirect("/login")
  }

  // Ensure stages are initialized in DB
  let stages = await db.stage.findMany({
    orderBy: { number: 'asc' }
  })
  if (stages.length === 0) {
    const stageData = [
      { name: "Communication & Soft Skills", number: 1, unlockXpThreshold: 0 },
      { name: "Coding Fundamentals", number: 2, unlockXpThreshold: 1000 },
      { name: "Real-world Projects", number: 3, unlockXpThreshold: 3000 },
      { name: "Career Preparation", number: 4, unlockXpThreshold: 6000 }
    ]
    await db.$transaction(stageData.map(s => db.stage.create({ data: s })))
    stages = await db.stage.findMany({ orderBy: { number: 'asc' } })
  }

  // Ensure progresses are initialized for the student
  let progresses = await db.stageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stage: { number: 'asc' } }
  })
  if (progresses.length === 0) {
    await db.$transaction(
      stages.map(stage => 
        db.stageProgress.create({
          data: {
            userId,
            stageId: stage.id,
            status: stage.number === 1 ? "ACTIVE" : "LOCKED"
          }
        })
      )
    )
    progresses = await db.stageProgress.findMany({
      where: { userId },
      include: { stage: true },
      orderBy: { stage: { number: 'asc' } }
    })
  }

  // Fetch Class Leaderboard entries
  const topUsers = await db.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { xp: 'desc' },
    take: 5,
    select: { id: true, name: true, xp: true, level: true }
  })

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Dynamic welcome title header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900/60 rounded-2xl border border-white/5 shadow-lg backdrop-blur-md">
            <Milestone className="w-6 h-6 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-indigo-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              My Learning Path
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1 font-medium">
              Complete stages to earn XP, level up, and unlock placements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-indigo-400 w-fit shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Active Journey: Stage {progresses.find(p => p.status === "ACTIVE")?.stage.number || 1}</span>
        </div>
      </div>

      {/* Level and XP Status HUD */}
      <StatusHUD user={user} />

      {/* Main Roadmap & Sidebar widgets columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stages list column (takes 2 widths on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-8 relative pl-0 sm:pl-4">
          
          {/* SVG/Div Connector lines for RPG road effect */}
          <SkillPathConnector progresses={progresses} />

          {/* Cards map */}
          <div className="flex flex-col gap-10">
            {progresses.map((p, index) => (
              <StageCard key={p.id} progress={p} index={index} />
            ))}
          </div>
        </div>

        {/* Sidebar Widgets (Daily Quests & Leaders Podium) */}
        <div className="flex flex-col gap-8 lg:col-span-1">
          <DailyQuestsWidget />
          <ClassLeaderboardWidget entries={topUsers} />
        </div>
      </div>
    </div>
  )
}
