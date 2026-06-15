export interface ProblemStatementDTO {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  problemStatementId: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFileDTO {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamDTO {
  id: string;
  name: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMemberDTO {
  id: string;
  teamId: string;
  userId: string;
  roleInTeam: string;
  joinedAt: Date;
}

export interface MessageDTO {
  id: string;
  teamId: string;
  userId: string;
  content: string;
  createdAt: Date;
}
