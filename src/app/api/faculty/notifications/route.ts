import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const notifications = await (db as any).notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  return NextResponse.json(notifications)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await req.json()
  if (id) {
    await (db as any).notification.update({ where: { id }, data: { isRead: true } })
  } else {
    await (db as any).notification.updateMany({ where: { userId: session.user.id }, data: { isRead: true } })
  }
  return NextResponse.json({ success: true })
}
