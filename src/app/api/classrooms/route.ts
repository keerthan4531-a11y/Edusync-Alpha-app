import { NextResponse } from "next/server"
import { db } from "@/lib/db"

function generateCode(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase()
}

export async function POST(req: Request) {
  try {
    const { name, section } = await req.json()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

    // Get first faculty user (session-based auth can be added later)
    const faculty = await db.user.findFirst({ where: { role: "FACULTY" } })
    if (!faculty) return NextResponse.json({ error: "No faculty found" }, { status: 404 })

    // Ensure unique code
    let code = generateCode()
    let existing = await db.classroom.findUnique({ where: { code } })
    while (existing) {
      code = generateCode()
      existing = await db.classroom.findUnique({ where: { code } })
    }

    const classroom = await db.classroom.create({
      data: { name: section ? `${name} — ${section}` : name, code, facultyId: faculty.id }
    })

    return NextResponse.json(classroom)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
