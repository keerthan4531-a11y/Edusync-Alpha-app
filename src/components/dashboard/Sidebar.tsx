"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutDashboard, BookOpen, Code, Briefcase, GraduationCap, Users, BarChart, Mail, Languages, School, User, Map, Layers, Monitor, Compass } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  role: string
  isMobileNavVisible?: boolean
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
      { name: "Home", href: "/student-dashboard", icon: Home },
      { name: "Stages", href: "/student-dashboard/stages", icon: Compass },
      { name: "Learning Path", href: "/student-dashboard/learning-path", icon: Map },
      { name: "Classrooms", href: "/student-dashboard/classrooms", icon: Monitor },
      { name: "Courses", href: "/student-dashboard/language-courses", icon: GraduationCap },
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

const stageAccentMap: Record<string, string> = {
  stage1: "rgba(139, 92, 246, 0.25)",
  stage2: "rgba(59, 130, 246, 0.25)",
  stage3: "rgba(16, 185, 129, 0.25)",
  stage4: "rgba(245, 158, 11, 0.25)",
}

export function Sidebar({ role, isMobileNavVisible = true }: SidebarProps) {
  const menu = getMenuByRole(role)
  const pathname = usePathname()

  return (
    <div className={cn(
      // Base glass panel
      "flex md:h-full w-[calc(100%-1rem)] md:w-64 flex-col shrink-0 z-50 order-2 md:order-1",
      // Premium Glass styling
      "glass-panel md:border-y-0 md:border-l-0",
      // Mobile: floating bottom bar
      "fixed bottom-2 left-2 right-2 md:bottom-auto md:left-auto md:right-auto",
      "rounded-2xl md:rounded-none",
      // Transition
      "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
      !isMobileNavVisible ? "translate-y-[150%] md:translate-y-0" : "translate-y-0"
    )}>
      <div className="glass-specular" />
      <div className="glass-noise" />

      {/* Logo — Desktop only */}
      <div className="hidden md:flex h-16 items-center border-b border-[var(--glass-border-subtle)] px-6 relative overflow-hidden">
        {/* Shimmer line across logo area */}
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none glass-shimmer" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          EduSync <span className="text-primary">4.0</span>
        </h1>
      </div>

      {/* Navigation */}
      <div className="w-full md:flex-1 py-1 md:py-6 no-scrollbar">
        <nav className="flex justify-around items-center md:grid md:gap-1.5 px-2 md:px-4 md:block whitespace-nowrap w-full h-[60px] md:h-auto">
          {menu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/student-dashboard" && item.href !== "/faculty-dashboard" && item.href !== "/hod-dashboard" && pathname.startsWith(item.href + '/'))

            // Active styling per stage
            let activeClasses = "bg-primary/15 text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(139,92,246,0.2)] border border-primary/20"
            let activeGlow = "rgba(139, 92, 246, 0.2)"
            if (isActive && item.stage) {
              const glow = stageAccentMap[item.stage] || "rgba(139, 92, 246, 0.2)"
              activeGlow = glow
              if (item.stage === "stage1") activeClasses = "bg-stage1/15 text-stage1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(139,92,246,0.2)] border border-stage1/20"
              else if (item.stage === "stage2") activeClasses = "bg-stage2/15 text-stage2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(59,130,246,0.2)] border border-stage2/20"
              else if (item.stage === "stage3") activeClasses = "bg-stage3/15 text-stage3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(16,185,129,0.2)] border border-stage3/20"
              else if (item.stage === "stage4") activeClasses = "bg-stage4/15 text-stage4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_0_20px_rgba(245,158,11,0.2)] border border-stage4/20"
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2 md:gap-3 rounded-xl md:rounded-xl transition-all duration-300 flex-shrink-0 relative",
                  isActive 
                    ? `${activeClasses} p-2.5 md:px-4 md:py-2.5 font-bold backdrop-blur-sm` 
                    : "text-muted-foreground hover:bg-[var(--glass-bg-hover)] hover:text-foreground p-2.5 md:px-3 md:py-2 font-medium"
                )}
              >
                <item.icon className={cn("h-5 w-5 md:h-[18px] md:w-[18px]", isActive && "drop-shadow-[0_0_8px_currentColor]")} />
                <span className="hidden md:inline text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
