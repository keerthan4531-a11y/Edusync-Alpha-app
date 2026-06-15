"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BookOpen, Code, Briefcase, GraduationCap, Users, BarChart, Mail, Languages, School, User } from "lucide-react"
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
      { name: "My Classrooms", href: "/student-dashboard/classrooms", icon: School },
      { name: "Stage 1: Communication", href: "/student-dashboard/stage-1-communication", icon: BookOpen, stage: "stage1" },
      { name: "Stage 2: Coding", href: "/student-dashboard/stage-2-coding", icon: Code, stage: "stage2" },
      { name: "Stage 3: Projects", href: "/student-dashboard/stage-3-projects", icon: Briefcase, stage: "stage3" },
      { name: "Stage 4: Career", href: "/student-dashboard/stage-4-career", icon: GraduationCap, stage: "stage4" },
      { name: "Language Courses", href: "/student-dashboard/language-courses", icon: Languages },
      { name: "Mail Box", href: "/student-dashboard/mail", icon: Mail },
      { name: "Profile", href: "/student-dashboard/profile", icon: User },
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
    <div className="flex md:h-full w-full md:w-64 flex-col border-b md:border-b-0 md:border-r border-white/10 bg-white/5 backdrop-blur-md shrink-0 z-50 order-2 md:order-1 sticky bottom-0 md:relative">
      <div className="hidden md:flex h-16 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold tracking-tight text-white">EduSync 4.0</h1>
      </div>
      <div className="flex-1 overflow-x-auto md:overflow-y-auto py-3 md:py-6 no-scrollbar">
        <nav className="flex md:grid md:gap-2 px-4 gap-3 md:block whitespace-nowrap">
          {menu.map((item) => {
            const isActive = pathname === item.href
            
            // Map stage colors to Tailwind classes
            let activeClasses = "bg-white/10 text-white md:border-l-4 border-b-4 md:border-b-0"
            if (isActive) {
              if (item.stage === "stage1") activeClasses += " border-stage1 md:shadow-[inset_4px_0_15px_-5px_var(--color-stage1)] text-stage1 shadow-[inset_0_-4px_15px_-5px_var(--color-stage1)]"
              else if (item.stage === "stage2") activeClasses += " border-stage2 md:shadow-[inset_4px_0_15px_-5px_var(--color-stage2)] text-stage2 shadow-[inset_0_-4px_15px_-5px_var(--color-stage2)]"
              else if (item.stage === "stage3") activeClasses += " border-stage3 md:shadow-[inset_4px_0_15px_-5px_var(--color-stage3)] text-stage3 shadow-[inset_0_-4px_15px_-5px_var(--color-stage3)]"
              else if (item.stage === "stage4") activeClasses += " border-stage4 md:shadow-[inset_4px_0_15px_-5px_var(--color-stage4)] text-stage4 shadow-[inset_0_-4px_15px_-5px_var(--color-stage4)]"
              else activeClasses += " border-primary md:shadow-[inset_4px_0_15px_-5px_var(--color-primary)] text-primary shadow-[inset_0_-4px_15px_-5px_var(--color-primary)]"
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-white/10 hover:text-white md:border-l-4 border-b-4 border-transparent flex-shrink-0",
                  isActive ? activeClasses : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "opacity-100")} />
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">{item.name.split(':')[0]}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
