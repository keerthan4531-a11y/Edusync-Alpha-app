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
  const isFullScreenPage = pathname.startsWith('/student-dashboard/profile') || pathname.startsWith('/student-dashboard/notifications')
  const isStage1 = pathname.startsWith('/student-dashboard/stage-1-communication')
  const isStage2 = pathname.startsWith('/student-dashboard/stage-2-coding')
  // Hide for faculty individual classroom pages
  const isFacultyClassroomDetail = pathname.match(/^\/faculty-dashboard\/classrooms\/[a-zA-Z0-9-]+/) !== null
  const hideBackButton = isHomePage || isFullScreenPage || isStage1 || isStage2 || isFacultyClassroomDetail
  // Hide topbar on full screen pages (they have their own header)
  const hideTopbar = isFullScreenPage
  
  const handleBackClick = () => {
    if (user.role === "STUDENT") router.push('/student-dashboard')
    else if (user.role === "FACULTY") router.push('/faculty-dashboard')
    else if (user.role === "HOD") router.push('/hod-dashboard')
    else router.push('/')
  }

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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-background relative">
      <Sidebar role={user.role} isMobileNavVisible={isNavVisible && !isFullScreenPage && !isStage1} />
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent md:pb-0">
        {!hideTopbar && <Topbar user={user} />}
        <main 
          id="app-main"
          className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6 bg-transparent transition-all"
        >
          {!hideBackButton && (
            <div id="global-back-btn" className="mb-4 shrink-0">
              <button 
                onClick={handleBackClick}
                className="flex items-center justify-center w-10 h-10 rounded-full neu-button dark:bg-white/5 dark:border dark:border-white/10 dark:shadow-none hover:text-foreground transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
