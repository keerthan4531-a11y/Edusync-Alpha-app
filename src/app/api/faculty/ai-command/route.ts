import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Gemini-powered Faculty AI assistant — processes natural language commands
// related to classroom management, grading, attendance, and general queries.
// Falls back to a rule-based responder when the API key is missing.

const SYSTEM_PROMPT = `You are EduSync Faculty AI Assistant — an expert academic assistant for college professors.

Your capabilities:
1. Classroom management: summarize classrooms, student counts, recent activity
2. Assignment help: suggest assignment ideas, rubrics, grading tips
3. Attendance insights: advise on attendance patterns, engagement strategies
4. Content creation: draft announcements, create quiz questions, suggest materials
5. Student performance analysis: advise on identifying struggling students

Rules:
- Be concise, professional, and helpful
- Use markdown formatting for structured responses (bullet points, headers)
- If the user asks something outside education scope, politely redirect
- Always respond in English
- Never fabricate specific student data — speak generally unless data is provided

Respond in plain text with light markdown. Keep responses under 300 words.`

interface CommandRequest {
  command: string
  context?: {
    classroomCount?: number
    studentCount?: number
    pendingSubmissions?: number
  }
}

async function generateFallbackResponse(command: string, context?: CommandRequest["context"]): Promise<string> {
  const cmd = command.toLowerCase()

  if (cmd.includes("classroom") || cmd.includes("class")) {
    const count = context?.classroomCount ?? "your"
    return `📚 **Classroom Summary**\n\nYou have **${count}** active classrooms. Here are some quick actions:\n\n- **View all classrooms** — Check student enrollment and assignments\n- **Create a new classroom** — Set up a course with a unique join code\n- **Post an announcement** — Share updates with your students\n\nWould you like me to help with any of these?`
  }

  if (cmd.includes("assignment") || cmd.includes("submission") || cmd.includes("grade") || cmd.includes("pending")) {
    const pending = context?.pendingSubmissions ?? 0
    return `📝 **Assignments & Submissions**\n\nYou currently have **${pending}** pending submissions awaiting review.\n\n**Quick tips:**\n- Prioritize overdue reviews first\n- Use the bulk-grade feature for multiple submissions\n- Consider AI-assisted grading for faster feedback\n\nWould you like me to draft feedback for a specific assignment?`
  }

  if (cmd.includes("attendance") || cmd.includes("absent")) {
    return `📊 **Attendance Overview**\n\nHere are some engagement strategies:\n\n- **Track patterns** — Identify students with declining attendance early\n- **Send reminders** — Automated notifications before class\n- **Incentivize** — Gamify attendance with XP rewards\n\nWant me to analyze a specific classroom's attendance?`
  }

  if (cmd.includes("student") || cmd.includes("performance") || cmd.includes("analytics")) {
    const students = context?.studentCount ?? 0
    return `👥 **Student Analytics**\n\nYou have **${students}** students across your classrooms.\n\n**Key metrics to monitor:**\n- Submission completion rate\n- Average grades per assignment\n- Attendance patterns\n- XP/engagement scores\n\nI can help identify at-risk students or top performers.`
  }

  if (cmd.includes("announcement") || cmd.includes("post") || cmd.includes("notify")) {
    return `📢 **Draft Announcement**\n\nI can help you write an announcement! Here's a template:\n\n---\n**Subject:** [Your topic]\n\nDear Students,\n\n[Main content here]\n\nBest regards,\nProfessor\n\n---\n\nTell me the topic and I'll draft something specific!`
  }

  if (cmd.includes("schedule") || cmd.includes("plan") || cmd.includes("calendar")) {
    return `📅 **Schedule Management**\n\nI can help you with:\n\n- **View upcoming classes** — Check your weekly schedule\n- **Plan lessons** — Organize topics for the semester\n- **Set deadlines** — Schedule assignment due dates\n\nWhat would you like to plan?`
  }

  if (cmd.includes("tip") || cmd.includes("advice") || cmd.includes("help")) {
    return `💡 **Daily Teaching Tip**\n\n*"The best way to predict the future is to create it."* — Abraham Lincoln\n\n**Today's suggestion:** Try the **Think-Pair-Share** technique in your next class:\n1. Pose a question\n2. Give students 2 minutes to think individually\n3. Pair up and discuss for 3 minutes\n4. Share with the class\n\nThis boosts engagement by 40% on average!`
  }

  if (cmd.includes("content") || cmd.includes("material") || cmd.includes("resource") || cmd.includes("upload")) {
    return `📖 **Content Library**\n\nHere's how to organize your materials:\n\n- **Lecture notes** — Upload PDFs or create inline notes\n- **Video resources** — Link to recorded lectures\n- **Practice problems** — Create question banks\n- **Reference links** — Curate external resources\n\nWould you like me to help create study materials for a specific topic?`
  }

  return `👋 **Hello, Professor!**\n\nI'm your AI Assistant. Here's what I can help with:\n\n- 📚 **Classrooms** — Manage classes and students\n- 📝 **Assignments** — Create, review, and grade\n- 📊 **Attendance** — Track and analyze\n- 📢 **Announcements** — Draft and post\n- 💡 **Tips** — Teaching strategies and advice\n\nJust ask me anything!`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Faculty access only" }, { status: 403 })
    }

    const body = (await req.json()) as CommandRequest
    const { command } = body

    if (!command || typeof command !== "string" || command.trim().length === 0) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 })
    }

    // Fetch real context data from the database
    const facultyId = session.user.id
    const [classroomCount, studentCount, pendingSubmissions] = await Promise.all([
      db.classroom.count({ where: { facultyId } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.assignmentSubmission.count({ where: { status: "SUBMITTED" } }),
    ])

    const context = { classroomCount, studentCount, pendingSubmissions }

    // Attempt Custom AI Worker response
    try {
      const { esChat } = await import("@/lib/es-engine");
      const contextString = `Faculty has ${classroomCount} classrooms, ${studentCount} students, and ${pendingSubmissions} pending submissions.`;
      const prompt = `${SYSTEM_PROMPT}\n\nContext: ${contextString}\n\nFaculty says: "${command.trim()}"`;

      const responseText = await esChat([{ role: "user", content: prompt }]);

      if (responseText && responseText.length > 0) {
        return NextResponse.json({
          response: responseText,
          source: "surfsense-gpt5.4-mini",
          context,
        });
      }
    } catch (aiError) {
      console.warn("Custom AI Worker call failed, falling back to rule-based response:", aiError);
    }

    // Fallback to rule-based response
    const fallback = await generateFallbackResponse(command.trim(), context)

    return NextResponse.json({
      response: fallback,
      source: "fallback",
      context,
    })
  } catch (error) {
    console.error("Faculty AI command error:", error)
    return NextResponse.json(
      { error: "Failed to process command" },
      { status: 500 }
    )
  }
}
