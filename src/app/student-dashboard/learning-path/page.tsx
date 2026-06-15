import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { LearningPathClient } from "./LearningPathClient"

export default async function LearningPathPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect("/login")
  }

  const userId = session.user.id

  // 1. Ensure stages are seeded in the database
  let stages = await db.stage.findMany({
    orderBy: { number: 'asc' }
  })

  if (stages.length === 0) {
    // Dynamically seed stages if database is clean
    const stageData = [
      { name: "Communication & Soft Skills", number: 1, unlockXpThreshold: 0 },
      { name: "Coding Fundamentals", number: 2, unlockXpThreshold: 1000 },
      { name: "Real-world Projects", number: 3, unlockXpThreshold: 3000 },
      { name: "Career Preparation", number: 4, unlockXpThreshold: 6000 }
    ]

    await db.$transaction(
      stageData.map(s => db.stage.create({ data: s }))
    )

    stages = await db.stage.findMany({
      orderBy: { number: 'asc' }
    })
  }

  // 2. Ensure stage progress is initialized for the user
  let progresses = await db.stageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stage: { number: 'asc' } }
  })

  if (progresses.length === 0) {
    // Initialize stage progress (Stage 1 Active, others Locked)
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

  // 3. Fetch user details and earned badges
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      badges: {
        include: {
          badge: true
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  // Fetch all badges to display earned vs locked
  const allBadges = await db.badge.findMany()

  // If there are no badges, fetch some mock defaults in client,
  // or return them.
  const serializedBadges = allBadges.map(badge => {
    const earnedRecord = user.badges.find(ub => ub.badgeId === badge.id)
    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      earned: !!earnedRecord,
      earnedAt: earnedRecord ? earnedRecord.earnedAt.toISOString() : null
    }
  })

  // Format stage progresses for client
  const stageProgressData = progresses.map(p => ({
    id: p.id,
    stageNumber: p.stage.number,
    stageName: p.stage.name,
    status: p.status, // "ACTIVE", "COMPLETED", "LOCKED"
    completedAt: p.completedAt ? p.completedAt.toISOString() : null
  }))

  return (
    <LearningPathClient
      user={{
        name: user.name,
        email: user.email,
        xp: user.xp,
        coins: user.coins,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        department: user.department?.name || "Unassigned"
      }}
      stageProgresses={stageProgressData}
      badges={serializedBadges}
    />
  )
}
