import { db } from "./db";

export async function createMessage(teamId: string, userId: string, content: string) {
  return await db.message.create({
    data: {
      teamId,
      userId,
      content
    },
    include: {
      user: { select: { name: true, email: true } }
    }
  });
}

export async function getMessagesByTeam(teamId: string, limit: number = 50) {
  return await db.message.findMany({
    where: { teamId },
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      user: { select: { name: true, email: true } }
    }
  });
}
