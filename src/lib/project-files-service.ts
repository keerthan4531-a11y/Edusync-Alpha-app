import { db } from "./db";

export async function createFile(projectId: string, path: string, content: string = "", language: string = "plaintext") {
  return await db.projectFile.create({
    data: {
      projectId,
      path,
      content,
      language
    }
  });
}

export async function getFilesByProject(projectId: string) {
  return await db.projectFile.findMany({
    where: { projectId },
    select: { id: true, path: true, language: true, updatedAt: true } // Exclude content for tree listing
  });
}

export async function getFileById(fileId: string, projectId: string) {
  return await db.projectFile.findUnique({
    where: { id: fileId, projectId }
  });
}

export async function updateFileContent(fileId: string, projectId: string, content: string) {
  return await db.projectFile.update({
    where: { id: fileId, projectId },
    data: { content }
  });
}

export async function deleteFile(fileId: string, projectId: string) {
  return await db.projectFile.delete({
    where: { id: fileId, projectId }
  });
}
