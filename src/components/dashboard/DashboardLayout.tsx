"use client"

import { ReactNode, useState, useEffect, useRef } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { ChevronLeft } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    name: string
    email: string
    role: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isHomePage = pathname === '/student-dashboard' || pathname === '/faculty-dashboard' || pathname === '/hod-dashboard'
  const isProfileRelated = pathname.startsWith('/student-dashboard/profile')
  const isStage1 = pathname.startsWith('/student-dashboard/stage-1-communication')
  const hideBackButton = isHomePage || isProfileRelated || isStage1
  
  const [isNavVisible, setIsNavVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleActivity = () => {
      setIsNavVisible(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        setIsNavVisible(false)
      }, 2500)
    }

    // Set initial timeout
    timeoutRef.current = setTimeout(() => {
      setIsNavVisible(false)
    }, 2500)

    // Add global event listeners (using capture phase to ensure they fire)
    window.addEventListener('scroll', handleActivity, true)
    window.addEventListener('touchstart', handleActivity, true)
    window.addEventListener('touchmove', handleActivity, true)
    window.addEventListener('mousemove', handleActivity, true)
    window.addEventListener('click', handleActivity, true)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      window.removeEventListener('scroll', handleActivity, true)
      window.removeEventListener('touchstart', handleActivity, true)
      window.removeEventListener('touchmove', handleActivity, true)
      window.removeEventListener('mousemove', handleActivity, true)
      window.removeEventListener('click', handleActivity, true)
    }
  }, [])

  return (
    <div suppressHydrationWarning className="flex flex-col md:flex-row h-screen overflow-hidden bg-transparent relative">
      <Sidebar role={user.role} isMobileNavVisible={isNavVisible} />
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent md:pb-0">
        <Topbar user={user} />
        <main 
          className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6 bg-transparent transition-all"
        >
          {!hideBackButton && (
            <div className="mb-4 shrink-0">
              <button 
                onClick={() => router.back()}
                className="glass-panel flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--glass-bg-hover)] transition-all duration-300"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6 text-foreground relative z-10" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
