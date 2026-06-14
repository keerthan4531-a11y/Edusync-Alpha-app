import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { runJudge0Batch } from "@/lib/judge0"
import { db } from "@/lib/db"
import { awardXp } from "@/lib/gamification"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { sourceCode, languageId, testCases } = body

    if (!sourceCode || !languageId || !testCases) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 })
    }

    const response = await runJudge0Batch(sourceCode, languageId, testCases)

    if (!response.success) {
      return NextResponse.json({ success: false, message: response.result }, { status: 400 })
    }

    // Check if all test cases passed
    const allPassed = response.result.every((r: any) => r.status?.id === 3)

    if (allPassed) {
      // Award 50 XP
      await awardXp(session.user.id, 50, 'stage2_problem_solved')

      // Save Submission to DB
      await db.submission.create({
        data: {
          userId: session.user.id,
          problemId: (await db.problem.findFirst({ where: { title: "Two Sum" } }))?.id || "unknown",
          code: sourceCode,
          language: languageId,
          status: "ACCEPTED",
          xpAwarded: 50
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Code executed successfully",
      results: response.result,
      allPassed,
    })
  } catch (error: any) {
    console.error("Error in run-code route:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
