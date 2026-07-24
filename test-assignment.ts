import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()

async function test() {
  try {
    const id = "656d2a06-9754-4cde-be09-0a0e05770e43"
    const payload = {
      title: "Test Assignment",
      description: "Test description",
      dueDate: "2026-07-20",
      topic: "deep learning",
      maxPoints: "100",
      xpReward: "75",
      coinReward: "50"
    }

    const assignment = await db.assignment.create({
      data: {
        classroomId: id,
        title: payload.title,
        description: payload.description || "",
        dueDate: new Date(payload.dueDate),
        topic: payload.topic || "",
        maxPoints: Number(payload.maxPoints),
        xpReward: Number(payload.xpReward),
        coinReward: Number(payload.coinReward)
      }
    })
    console.log("Success:", assignment)
  } catch (e) {
    console.error("Prisma error:", e)
  } finally {
    await db.$disconnect()
  }
}

test()
