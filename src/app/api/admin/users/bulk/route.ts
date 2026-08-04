import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let created = 0;
    const errors: string[] = [];

    for (const u of users) {
      try {
        const existing = await db.user.findUnique({ where: { email: u.email } });
        if (existing) {
          errors.push(`Email ${u.email} already exists`);
          continue;
        }

        const userData: any = {
          name: u.name,
          email: u.email,
          passwordHash: u.password,
          role: u.role
        };

        if (u.role === "STUDENT" && (u.rollNumber || u.batch || u.semester || u.department)) {
          userData.studentProfile = {
            create: {
              rollNumber: u.rollNumber,
              batch: u.batch,
              semester: u.semester,
              department: u.department,
              section: u.section,
              yearOfStudy: u.yearOfStudy
            }
          };
        }

        await db.user.create({ data: userData });
        created++;
      } catch (err: any) {
        errors.push(`Failed to create ${u.email}: ${err.message}`);
      }
    }

    return NextResponse.json({ created, errors });
  } catch (error: any) {
    console.error("Bulk Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
