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
        <div className="p-3 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-md animate-in zoom-in-95 duration-500">
          <Milestone className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)] animate-pulse" />
        </div>
        <div>
          <h1 className="text-[28px] md:text-[34px] font-semibold text-foreground tracking-tight leading-tight">Learning Stages</h1>
          <p className="text-muted-foreground text-[15px] md:text-[17px] mt-1">Follow the path to reach your career goals</p>
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
              href={meta.href}
              className="group block animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <LiquidGlassCard 
                className={`p-6 flex flex-col sm:flex-row gap-5 transition-all duration-300 group-hover:scale-[1.01] ${
                  isLocked ? "opacity-70 grayscale-[0.3]" : ""
                }`}
                accentColor={isLocked ? undefined : meta.accent}
                enableShimmer={!isLocked}
              >
                <div className={`relative z-10 shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                  isLocked ? 'bg-[var(--glass-bg)] border-[var(--glass-border-subtle)]' : `${meta.bgColor} ${meta.borderColor}`
                }`}>
                  <Icon className={`w-8 h-8 ${isLocked ? 'text-muted-foreground' : meta.color} ${!isLocked ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`} />
                </div>
                
                <div className="flex flex-col justify-center flex-1 z-10">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-[17px] md:text-[22px] font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      Stage {p.stage.number}: {p.stage.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 shadow-[0_0_12px_rgba(96,165,250,0.15)] animate-pulse">
                          Active
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--glass-bg)] text-muted-foreground text-xs font-semibold border border-[var(--glass-border-subtle)]">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[15px] text-muted-foreground mb-4 leading-relaxed">{meta.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[13px] text-muted-foreground font-medium">
                      <span>Progress</span>
                      <span className="tabular-nums">{progressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden border border-[var(--glass-border-subtle)] shadow-inner">
                      <div 
                        className={`h-full ${meta.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out rounded-full`} 
                        style={{ 
                          width: `${progressPercent}%`,
                          boxShadow: progressPercent > 0 ? `0 0 8px ${meta.accent}40, 0 0 16px ${meta.accent}20` : 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center justify-center pl-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg-hover)] flex items-center justify-center border border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-md">
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
