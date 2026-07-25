import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId = session.user.id;
    if (userId) {
      const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!userExists && session.user.email) {
        const userByEmail = await db.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
        if (userByEmail) userId = userByEmail.id;
      }
    } else if (session.user.email) {
      const userByEmail = await db.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
      if (userByEmail) userId = userByEmail.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const params = await context.params;
    const assignmentId = params.id;

    let code = "";
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      code = (formData.get("code") as string) || "";
      const file = formData.get("file") as File;

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${Date.now()}_${safeName}`;
        fs.writeFileSync(path.join(uploadDir, filename), buffer);

        code = `[FILE_UPLOAD_V3]${file.name}|/uploads/${filename}`;
      }
    } else {
      const json = await req.json().catch(() => ({}));
      code = json.code || "";
    }

    if (!code) {
      return NextResponse.json({ error: "Code content or file is required" }, { status: 400 });
    }

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Upsert the submission (create if not exists, update if exists)
    const submission = await db.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: userId
        }
      },
      update: {
        code,
        status: "SUBMITTED",
        createdAt: new Date()
      },
      create: {
        assignmentId,
        studentId: userId,
        code,
        status: "SUBMITTED"
      }
    });

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
