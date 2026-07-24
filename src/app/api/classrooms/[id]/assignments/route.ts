import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { title, description, dueDate, topic, xpReward, maxPoints } = body

    if (!title || !dueDate) {
      return NextResponse.json({ error: "Title and Due Date are required" }, { status: 400 })
    }

    const assignment = await db.assignment.create({
      data: {
        classroomId: id,
        title: title.trim(),
        description: description?.trim() || "",
        dueDate: new Date(dueDate),
        topic: topic?.trim() || "",
        xpReward: Number(xpReward) || 75,
        maxPoints: Number(maxPoints) || 100,
      }
    })
    
    return NextResponse.json(assignment)
  } catch (e: any) {
    console.error("CREATE ASSIGNMENT ERROR:", e)
    return NextResponse.json({ error: e.message || String(e) || "Server error" }, { status: 500 })
  }
}
