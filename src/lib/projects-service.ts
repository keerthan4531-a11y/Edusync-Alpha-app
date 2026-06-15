import { db } from "./db";
import { Prisma } from "@prisma/client";

export async function createProject(name: string, description: string, ownerId: string, problemStatementId?: string) {
  return await db.project.create({
    data: {
      name,
      description,
      ownerId,
      problemStatementId
    }
  });
}

export async function getProjectsByUser(userId: string) {
  // Return projects owned by user OR where user is a team member
  return await db.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { team: { members: { some: { userId } } } }
      ]
    },
    include: {
      owner: { select: { name: true, email: true } },
      problemStatement: { select: { title: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      files: {
        select: { id: true, path: true, language: true, updatedAt: true } // Excluding content for tree view
      },
      team: {
        include: {
          members: {
            include: { user: { select: { name: true, email: true } } }
          }
        }
      },
      problemStatement: true
    }
  });

  if (!project) return null;

  // Check access: owner or team member
  const isOwner = project.ownerId === userId;
  const isTeamMember = project.team?.members.some(m => m.userId === userId);

  if (!isOwner && !isTeamMember) {
    throw new Error("Unauthorized access to project");
  }

  return project;
}

export async function updateProject(projectId: string, userId: string, data: Prisma.ProjectUpdateInput) {
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (project?.ownerId !== userId) {
    throw new Error("Only the owner can update the project");
  }
  
  return await db.project.update({
    where: { id: projectId },
    data
  });
}
