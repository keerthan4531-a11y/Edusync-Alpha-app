import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const allMails = await db.mail.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const inbox = allMails.filter(m => m.recipientId === userId && !m.isTrash);
    const sent = allMails.filter(m => m.senderId === userId && !m.isTrash);
    const starred = allMails.filter(m => m.isStarred && !m.isTrash);
    const trash = allMails.filter(m => m.isTrash);

    return NextResponse.json({ inbox, sent, starred, trash });
  } catch (error) {
    console.error("Failed to fetch mails:", error);
    return NextResponse.json({ error: "Failed to fetch mails" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { recipientEmail, subject, body } = await req.json();
    if (!recipientEmail || !subject || !body) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recipient = await db.user.findUnique({
      where: { email: recipientEmail }
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const mail = await db.mail.create({
      data: {
        senderId: userId,
        recipientId: recipient.id,
        subject,
        body
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(mail, { status: 201 });
  } catch (error) {
    console.error("Failed to send mail:", error);
    return NextResponse.json({ error: "Failed to send mail" }, { status: 500 });
  }
}
