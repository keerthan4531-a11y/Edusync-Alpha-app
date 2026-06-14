"use client"

import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    name: string
    email: string
    role: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden bg-transparent">
        <Topbar user={user} />
        <main className="flex-1 overflow-auto p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}
