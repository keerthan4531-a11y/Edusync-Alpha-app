"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Code, Briefcase, GraduationCap, Users, BarChart } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: string
}

type StageColor = "stage1" | "stage2" | "stage3" | "stage4" | "default"

interface MenuItem {
  name: string
  href: string
  icon: any
  stage?: StageColor
}

const getMenuByRole = (role: string): MenuItem[] => {
  if (role === "STUDENT") {
    return [
      { name: "Dashboard", href: "/student-dashboard", icon: LayoutDashboard },
      { name: "Stage 1: Communication", href: "/student-dashboard/stage-1-communication", icon: BookOpen, stage: "stage1" },
      { name: "Stage 2: Coding", href: "/student-dashboard/stage-2-coding", icon: Code, stage: "stage2" },
      { name: "Stage 3: Projects", href: "/student-dashboard/stage-3-projects", icon: Briefcase, stage: "stage3" },
      { name: "Stage 4: Career", href: "/student-dashboard/stage-4-career", icon: GraduationCap, stage: "stage4" },
    ]
  }
  if (role === "FACULTY") {
    return [
      { name: "Dashboard", href: "/faculty-dashboard", icon: LayoutDashboard },
      { name: "Classrooms", href: "/faculty-dashboard/classrooms", icon: Users },
      { name: "Submissions", href: "/faculty-dashboard/submissions", icon: BookOpen },
    ]
  }
  if (role === "HOD") {
    return [
      { name: "Dashboard", href: "/hod-dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/hod-dashboard/analytics", icon: BarChart },
      { name: "Faculty Directory", href: "/hod-dashboard/faculty", icon: Users },
    ]
  }
  return []
}

export function Sidebar({ role }: SidebarProps) {
  const menu = getMenuByRole(role)
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-md">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold tracking-tight text-white">EduSync 4.0</h1>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-2 px-4">
          {menu.map((item) => {
            const isActive = pathname === item.href
            
            // Map stage colors to Tailwind classes
            let activeClasses = "bg-white/10 text-white border-l-4"
            if (isActive) {
              if (item.stage === "stage1") activeClasses += " border-stage1 shadow-[inset_4px_0_15px_-5px_var(--color-stage1)] text-stage1"
              else if (item.stage === "stage2") activeClasses += " border-stage2 shadow-[inset_4px_0_15px_-5px_var(--color-stage2)] text-stage2"
              else if (item.stage === "stage3") activeClasses += " border-stage3 shadow-[inset_4px_0_15px_-5px_var(--color-stage3)] text-stage3"
              else if (item.stage === "stage4") activeClasses += " border-stage4 shadow-[inset_4px_0_15px_-5px_var(--color-stage4)] text-stage4"
              else activeClasses += " border-primary shadow-[inset_4px_0_15px_-5px_var(--color-primary)] text-primary"
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-white/10 hover:text-white border-l-4 border-transparent",
                  isActive ? activeClasses : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "opacity-100")} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
