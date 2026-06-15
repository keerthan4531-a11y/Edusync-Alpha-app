"use client"

import { BookOpen, Code, Briefcase, GraduationCap, ArrowRight, CheckCircle2, Lock, Milestone } from "lucide-react"
import Link from "next/link"

const stages = [
  {
    id: 1,
    name: "Stage 1: Communication",
    description: "Master professional communication and soft skills",
    icon: BookOpen,
    color: "text-stage1",
    bgColor: "bg-stage1/10",
    borderColor: "border-stage1/20",
    href: "/student-dashboard/stage-1-communication",
    status: "completed",
    progress: 100,
  },
  {
    id: 2,
    name: "Stage 2: Coding",
    description: "Learn foundational programming and data structures",
    icon: Code,
    color: "text-stage2",
    bgColor: "bg-stage2/10",
    borderColor: "border-stage2/20",
    href: "/student-dashboard/stage-2-coding",
    status: "in-progress",
    progress: 45,
  },
  {
    id: 3,
    name: "Stage 3: Projects",
    description: "Build real-world applications and portfolio projects",
    icon: Briefcase,
    color: "text-stage3",
    bgColor: "bg-stage3/10",
    borderColor: "border-stage3/20",
    href: "/student-dashboard/stage-3-projects",
    status: "locked",
    progress: 0,
  },
  {
    id: 4,
    name: "Stage 4: Career",
    description: "Prepare for interviews and land your dream job",
    icon: GraduationCap,
    color: "text-stage4",
    bgColor: "bg-stage4/10",
    borderColor: "border-stage4/20",
    href: "/student-dashboard/stage-4-career",
    status: "locked",
    progress: 0,
  },
]

export default function StagesPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
          <Milestone className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Learning Stages</h1>
          <p className="text-muted-foreground text-sm mt-1">Follow the path to reach your career goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stages.map((stage, index) => {
          const isLocked = stage.status === "locked"
          
          return (
            <Link 
              key={stage.id} 
              href={isLocked ? "#" : stage.href}
              className={`relative flex flex-col sm:flex-row gap-4 p-5 rounded-3xl border ${isLocked ? 'border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60' : `border-white/10 bg-white/5 hover:bg-white/10 ${stage.borderColor} hover:border-white/20`} transition-all group overflow-hidden`}
            >
              {/* Progress Line Connector for visual flow */}
              {index !== stages.length - 1 && (
                <div className="hidden sm:block absolute left-[3.25rem] top-[4.5rem] bottom-[-2rem] w-[2px] bg-white/5 z-0">
                  {stage.status === "completed" && <div className="w-full h-full bg-stage1" />}
                </div>
              )}

              <div className={`relative z-10 shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${isLocked ? 'bg-white/5' : stage.bgColor}`}>
                <stage.icon className={`w-8 h-8 ${isLocked ? 'text-muted-foreground' : stage.color}`} />
              </div>
              
              <div className="flex flex-col justify-center flex-1 z-10">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <h2 className="text-lg font-semibold text-white group-hover:text-primary transition-colors">
                    {stage.name}
                  </h2>
                  {stage.status === "completed" && <CheckCircle2 className="w-5 h-5 text-stage1" />}
                  {stage.status === "locked" && <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{stage.description}</p>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${stage.color.replace('text-', 'bg-')} transition-all duration-1000 ease-out`} 
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              </div>

              {!isLocked && (
                <div className="hidden sm:flex items-center justify-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
