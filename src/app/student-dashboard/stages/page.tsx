import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { BookOpen, Code, Briefcase, GraduationCap, ArrowRight, CheckCircle2, Lock, Milestone } from "lucide-react"
import Link from "next/link"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

export const metadata = {
  title: "Learning Stages | EduSync",
  description: "Follow the path to reach your career goals.",
}

const stageMetadata: Record<number, {
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  href: string;
  description: string;
  accent: string;
}> = {
  1: {
    icon: BookOpen,
    color: "text-stage1",
    bgColor: "bg-stage1/10",
    borderColor: "border-stage1/20",
    href: "/student-dashboard/stage-1-communication",
    description: "Master professional communication and soft skills",
    accent: "#8b5cf6",
  },
  2: {
    icon: Code,
    color: "text-stage2",
    bgColor: "bg-stage2/10",
    borderColor: "border-stage2/20",
    href: "/student-dashboard/stage-2-coding",
    description: "Learn foundational programming and data structures",
    accent: "#3b82f6",
  },
  3: {
    icon: Briefcase,
    color: "text-stage3",
    bgColor: "bg-stage3/10",
    borderColor: "border-stage3/20",
    href: "/student-dashboard/stage-3-projects",
    description: "Build real-world applications and portfolio projects",
    accent: "#10b981",
  },
  4: {
    icon: GraduationCap,
    color: "text-stage4",
    bgColor: "bg-stage4/10",
    borderColor: "border-stage4/20",
    href: "/student-dashboard/stage-4-career",
    description: "Prepare for interviews and land your dream job",
    accent: "#f59e0b",
  },
}

export default async function StagesPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    redirect("/login")
  }
  const userId = session.user.id

  // Ensure stages and progress are initialized
  let stages = await db.stage.findMany({
    orderBy: { number: 'asc' }
  })
  if (stages.length === 0) {
    const stageData = [
      { name: "Communication & Soft Skills", number: 1, unlockXpThreshold: 0 },
      { name: "Coding Fundamentals", number: 2, unlockXpThreshold: 1000 },
      { name: "Real-world Projects", number: 3, unlockXpThreshold: 3000 },
      { name: "Career Preparation", number: 4, unlockXpThreshold: 6000 }
    ]
    await db.$transaction(stageData.map(s => db.stage.create({ data: s })))
    stages = await db.stage.findMany({ orderBy: { number: 'asc' } })
  }

  let progresses = await db.stageProgress.findMany({
    where: { userId },
    include: { stage: true },
    orderBy: { stage: { number: 'asc' } }
  })
  if (progresses.length === 0) {
    await db.$transaction(
      stages.map(stage => 
        db.stageProgress.create({
          data: {
            userId,
            stageId: stage.id,
            status: stage.number === 1 ? "ACTIVE" : "LOCKED"
          }
        })
      )
    )
    progresses = await db.stageProgress.findMany({
      where: { userId },
      include: { stage: true },
      orderBy: { stage: { number: 'asc' } }
    })
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-md animate-in zoom-in-95 duration-500">
          <Milestone className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <div>
          <h1 className="text-[28px] md:text-[34px] font-semibold text-foreground tracking-tight leading-tight">Learning Stages</h1>
          <p className="text-zinc-500 dark:text-gray-400 text-[15px] md:text-[17px] mt-1">Follow the path to reach your career goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 relative">
        {progresses.map((p, index) => {
          const meta = stageMetadata[p.stage.number] || stageMetadata[1]
          const Icon = meta.icon
          const isLocked = p.status === "LOCKED"
          const isCompleted = p.status === "COMPLETED"
          const isActive = p.status === "ACTIVE"
          
          const progressPercent = isCompleted ? 100 : isActive ? 45 : 0

          return (
            <Link 
              key={p.id} 
              href={meta.href} // Always clickable to allow smooth developer testing
              className="group block animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <LiquidGlassCard 
                className={`p-6 flex flex-col sm:flex-row gap-5 border border-white/50 dark:border-white/10 transition-all duration-300 group-hover:scale-[1.01] group-hover:bg-white/80 dark:group-hover:bg-white/10 ${
                  isLocked ? "opacity-75 grayscale-[0.3]" : ""
                }`}
                accentColor={isLocked ? undefined : meta.accent}
              >
                <div className={`relative z-10 shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border ${
                  isLocked ? 'bg-black/5 dark:bg-white/5 border-white/10' : `${meta.bgColor} ${meta.borderColor}`
                } transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-8 h-8 ${isLocked ? 'text-zinc-500 dark:text-gray-400' : meta.color}`} />
                </div>
                
                <div className="flex flex-col justify-center flex-1 z-10">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-[17px] md:text-[22px] font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      Stage {p.stage.number}: {p.stage.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 shadow-sm animate-pulse">
                          Active
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 text-zinc-500 dark:text-gray-400 text-xs font-semibold border border-black/10 dark:border-white/10">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[15px] text-zinc-500 dark:text-gray-400 mb-4 leading-relaxed">{meta.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px] text-zinc-500 dark:text-gray-400 font-medium">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
                      <div 
                        className={`h-full ${meta.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out rounded-full`} 
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center justify-center pl-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/10 shadow-sm backdrop-blur-md">
                    <ArrowRight className="w-5 h-5 text-foreground" />
                  </div>
                </div>
              </LiquidGlassCard>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
