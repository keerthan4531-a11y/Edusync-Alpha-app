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
      { name: "Courses", href: "/student-dashboard/courses", icon: GraduationCap },
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

export function Sidebar({ role, isMobileNavVisible = true }: SidebarProps) {
  const menu = getMenuByRole(role)
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex md:h-full w-[calc(100%-1rem)] md:w-64 flex-col border md:border-t-0 md:border-b-0 md:border-l-0 md:border-r border-white/10 bg-[#080A10] md:bg-white/5 backdrop-blur-xl shrink-0 z-50 order-2 md:order-1 fixed bottom-2 left-2 right-2 md:bottom-auto md:left-auto md:right-auto rounded-2xl md:rounded-none shadow-[0_8px_30px_rgb(0,0,0,0.5)] md:shadow-none transition-transform duration-500 ease-in-out",
      !isMobileNavVisible ? "translate-y-[150%] md:translate-y-0" : "translate-y-0"
    )}>
      <div className="hidden md:flex h-16 items-center border-b border-white/10 px-6">
        <h1 className="text-xl font-bold tracking-tight text-white">EduSync 4.0</h1>
      </div>
      <div className="w-full md:flex-1 py-1 md:py-6 no-scrollbar">
        <nav className="flex justify-around items-center md:grid md:gap-2 px-2 md:px-4 md:block whitespace-nowrap w-full h-[60px] md:h-auto">
          {menu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/student-dashboard" && pathname.startsWith(item.href + '/'))
            
            let activeBg = "bg-white/10 text-white"
            if (isActive) {
              if (item.stage === "stage1") activeBg = "bg-stage1/20 text-stage1"
              else if (item.stage === "stage2") activeBg = "bg-stage2/20 text-stage2"
              else if (item.stage === "stage3") activeBg = "bg-stage3/20 text-stage3"
              else if (item.stage === "stage4") activeBg = "bg-stage4/20 text-stage4"
              else activeBg = "bg-primary/20 text-primary"
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center md:justify-start gap-2 md:gap-3 rounded-full md:rounded-md transition-all flex-shrink-0",
                  isActive 
                    ? `${activeBg} p-2.5 md:px-4 md:py-2.5 md:border-l-4 md:border-transparent font-bold` 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white p-2.5 md:px-3 md:py-2 font-medium"
                )}
              >
                <item.icon className={cn("h-6 w-6 md:h-5 md:w-5", isActive && "opacity-100")} />
                <span className="hidden md:inline text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
