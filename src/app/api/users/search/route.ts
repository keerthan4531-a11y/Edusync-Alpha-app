import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get("q")
    const role = url.searchParams.get("role")

    if (!q || q.length < 2) {
      return NextResponse.json([])
    }

    const users = await db.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ]
          },
          role ? { role: role } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5
    })

    return NextResponse.json(users)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
