import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Departments
  const csDept = await prisma.department.create({
    data: { name: 'Computer Science' }
  })
  const itDept = await prisma.department.create({
    data: { name: 'Information Tech' }
  })
  const seDept = await prisma.department.create({
    data: { name: 'Software Eng' }
  })

  // 2. Users (Students, Faculty, HOD)
  // Students matching the mock leaderboard
  const student1 = await prisma.user.create({
    data: { name: 'Alex Johnson', email: 'alex@test.com', passwordHash: 'hash', role: 'STUDENT', departmentId: csDept.id, level: 14, xp: 7250, coins: 500, currentStreak: 45, longestStreak: 45 }
  })
  const student2 = await prisma.user.create({
    data: { name: 'Samantha Lee', email: 'samantha@test.com', passwordHash: 'hash', role: 'STUDENT', departmentId: itDept.id, level: 12, xp: 6400, coins: 400, currentStreak: 30, longestStreak: 30 }
  })
  const student3 = await prisma.user.create({
    data: { name: 'Michael Chen', email: 'michael@test.com', passwordHash: 'hash', role: 'STUDENT', departmentId: csDept.id, level: 11, xp: 5800, coins: 350, currentStreak: 20, longestStreak: 25 }
  })
  const student4 = await prisma.user.create({
    data: { name: 'Emily Davis', email: 'emily@test.com', passwordHash: 'hash', role: 'STUDENT', departmentId: seDept.id, level: 10, xp: 5100, coins: 300, currentStreak: 15, longestStreak: 20 }
  })
  const demoStudent = await prisma.user.create({
    data: { name: 'Student Demo (You)', email: 'student@test.com', passwordHash: 'hash', role: 'STUDENT', departmentId: csDept.id, level: 3, xp: 1250, coins: 125, currentStreak: 12, longestStreak: 12 }
  })

  // Faculty and HOD
  const faculty = await prisma.user.create({
    data: { name: 'Dr. Faculty', email: 'faculty@test.com', passwordHash: 'hash', role: 'FACULTY', departmentId: csDept.id }
  })
  const hod = await prisma.user.create({
    data: { name: 'Prof. HOD', email: 'hod@test.com', passwordHash: 'hash', role: 'HOD', departmentId: csDept.id }
  })
  
  // Update HOD department
  await prisma.department.update({
    where: { id: csDept.id },
    data: { hodId: hod.id }
  })

  // 3. Problems
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      difficulty: 'Easy',
      languageSupport: 'python,javascript',
      testCases: JSON.stringify([
        { input: '[2,7,11,15]\n9', output: '[0,1]' },
        { input: '[3,2,4]\n6', output: '[1,2]' }
      ])
    }
  })

  const problem2 = await prisma.problem.create({
    data: {
      title: 'Reverse String',
      description: 'Write a function that reverses a string.',
      difficulty: 'Easy',
      languageSupport: 'python,javascript',
      testCases: JSON.stringify([
        { input: '"hello"', output: '"olleh"' }
      ])
    }
  })

  // 4. Badges
  const badge1 = await prisma.badge.create({
    data: { name: 'First Submission', description: 'Solved your first problem', iconUrl: '/badges/first.png' }
  })
  const badge2 = await prisma.badge.create({
    data: { name: '7-Day Streak', description: 'Maintained a 7 day streak', iconUrl: '/badges/streak7.png' }
  })
  const badge3 = await prisma.badge.create({
    data: { name: 'Stage 2 Starter', description: 'Began the coding stage', iconUrl: '/badges/stage2.png' }
  })

  // Award badge to demo student
  await prisma.userBadge.create({
    data: { userId: demoStudent.id, badgeId: badge1.id }
  })

  // 5. Daily Challenges
  await prisma.dailyChallenge.create({
    data: {
      date: new Date(),
      difficulty: 'Easy',
      xpReward: 50,
      coinReward: 5,
      type: 'CODING'
    }
  })

  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
