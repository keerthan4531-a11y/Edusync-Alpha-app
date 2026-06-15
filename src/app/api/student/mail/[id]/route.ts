import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;
    
    // In Next.js 15 App Router, we must await the params if needed, but it's safe to use directly
    const params = await context.params;
    const mailId = params.id;

    const mail = await db.mail.findUnique({
      where: { id: mailId }
    });

    if (!mail) return NextResponse.json({ error: "Mail not found" }, { status: 404 });
    if (mail.senderId !== userId && mail.recipientId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { isRead, isStarred, isTrash } = body;

    const updated = await db.mail.update({
      where: { id: mailId },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(isStarred !== undefined && { isStarred }),
        ...(isTrash !== undefined && { isTrash })
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update mail:", error);
    return NextResponse.json({ error: "Failed to update mail" }, { status: 500 });
  }
}
