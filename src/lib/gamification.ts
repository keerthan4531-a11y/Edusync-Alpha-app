import { db } from "./db"

/**
 * Recalculate level based on XP.
 * Simple formula: level = floor(xp / 500) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1
}

/**
 * Award XP to a user and recalculate their level.
 */
export async function awardXp(userId: string, amount: number, reason: string) {
  // First, fetch the current user to get their XP
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, xp: true, coins: true, level: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const newXp = user.xp + amount
  const newLevel = calculateLevel(newXp)
  const newCoins = user.coins + Math.floor(amount / 10) // 1 coin per 10 XP

  // Update user with new stats
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      coins: newCoins
    }
  })

  // Here you could also save an audit trail log using the 'reason'
  console.log(`Awarded ${amount} XP to user ${userId} for: ${reason}`)

  return updatedUser
}

/**
 * Deduct coins from a user.
 */
export async function deductCoins(userId: string, amount: number, reason: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, coins: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.coins < amount) {
    throw new Error("Not enough coins")
  }

  const newCoins = user.coins - amount

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      coins: newCoins
    }
  })

  console.log(`Deducted ${amount} coins from user ${userId} for: ${reason}`)

  return updatedUser
}
