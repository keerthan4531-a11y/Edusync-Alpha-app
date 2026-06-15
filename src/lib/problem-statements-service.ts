import { db } from "./db";

export async function getProblemStatements() {
  return await db.problemStatement.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getProblemStatementById(id: string) {
  return await db.problemStatement.findUnique({
    where: { id }
  });
}
