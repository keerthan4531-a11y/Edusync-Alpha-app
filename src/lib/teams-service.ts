import { db } from "./db";

export async function createTeam(projectId: string, name: string) {
  return await db.team.create({
    data: {
      projectId,
      name
    }
  });
}

export async function getTeamByProject(projectId: string) {
  return await db.team.findUnique({
    where: { projectId },
    include: {
      members: {
        include: { user: { select: { name: true, email: true } } }
      }
    }
  });
}

export async function addTeamMember(teamId: string, userId: string, roleInTeam: string = "MEMBER") {
  return await db.teamMember.create({
    data: {
      teamId,
      userId,
      roleInTeam
    }
  });
}

export async function removeTeamMember(teamId: string, userId: string) {
  return await db.teamMember.delete({
    where: {
      teamId_userId: { teamId, userId }
    }
  });
}
