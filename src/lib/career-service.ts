import { db } from "@/lib/db";
import { ResumeData, AptitudeTestDTO } from "@/types/career";

export async function generateResumeData(userId: string): Promise<ResumeData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      department: true,
      ownedProjects: true,
      badges: {
        include: { badge: true }
      }
    }
  });

  if (!user) throw new Error("User not found");

  const projects = user.ownedProjects.map(p => ({
    name: p.name,
    description: p.description,
  }));

  const certifications = user.badges.map(ub => ({
    name: ub.badge.name,
    issuer: "EduSync",
    date: ub.earnedAt.toISOString().split("T")[0],
  }));

  // Mocked skills for now, as User model doesn't store explicit skills list directly in our current schema
  const skills = ["JavaScript", "React", "Next.js", "Problem Solving", "Communication"];

  // Mocked education
  const education = [
    {
      institution: "EduSync Engineering College",
      degree: "B.Tech in " + (user.department?.name || "Engineering"),
      year: "2024-2028",
      gpa: "8.5",
    }
  ];

  return {
    user: {
      name: user.name,
      email: user.email,
      department: user.department?.name || "General",
    },
    education,
    skills,
    projects,
    certifications,
  };
}

export async function getAptitudeTests(): Promise<AptitudeTestDTO[]> {
  const tests = await db.aptitudeTest.findMany({
    where: { isActive: true },
  });

  return tests.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    questions: JSON.parse(t.questions),
    timeLimit: t.timeLimit,
  }));
}
