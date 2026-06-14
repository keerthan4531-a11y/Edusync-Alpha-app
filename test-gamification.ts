import { PrismaClient } from '@prisma/client'
import { awardXp } from './src/lib/gamification'

const prisma = new PrismaClient()

async function testGamification() {
  const demoStudent = await prisma.user.findFirst({
    where: { email: 'student@test.com' }
  })
  
  if (!demoStudent) {
    console.error("Demo student not found")
    return
  }

  console.log("=== BEFORE SUBMISSION ===")
  console.log(`Student: ${demoStudent.name}`)
  console.log(`XP: ${demoStudent.xp}`)
  console.log(`Level: ${demoStudent.level}`)
  console.log(`Coins: ${demoStudent.coins}`)
  console.log("=========================\n")

  console.log("Simulating 'Two Sum' successful submission... awarding 50 XP\n")
  
  const updatedUser = await awardXp(demoStudent.id, 50, 'stage2_problem_solved')

  console.log("=== AFTER SUBMISSION ===")
  console.log(`Student: ${updatedUser.name}`)
  console.log(`XP: ${updatedUser.xp}`)
  console.log(`Level: ${updatedUser.level}`)
  console.log(`Coins: ${updatedUser.coins}`)
  console.log("=========================")
}

testGamification()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
