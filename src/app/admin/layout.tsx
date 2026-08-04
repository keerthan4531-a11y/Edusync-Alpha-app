"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard, Users, Calendar, Building2, BarChart3,
  ShieldCheck, LogOut, Loader2, Sparkles, ChevronRight, Menu, X
} from "lucide-react"
import { useState, useEffect } from "react"

const NAV_ITEMS = [
  { href: "/admin",             label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/users",       label: "User Directory",  icon: Users },
  { href: "/admin/timetables",  label: "Timetables",      icon: Calendar },
  { href: "/admin/departments", label: "Depts & Classes", icon: Building2 },
  { href: "/admin/analytics",   label: "Analytics",       icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (!isLoginPage && status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, isLoginPage, router])

  if (isLoginPage) {
    return <>{children}</>
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  if ((session?.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white gap-4 p-4 text-center">
        <ShieldCheck className="w-12 h-12 text-rose-500" />
        <h1 className="text-xl font-extrabold">Unauthorized Access</h1>
        <p className="text-xs text-muted-foreground max-w-sm">Your account does not have Super Admin privileges.</p>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold">
          Sign Out & Return to Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-foreground flex font-sans">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0d1222] border-r border-indigo-500/15 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-indigo-500/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0d1222] rounded-[0.5rem] flex items-center justify-center text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-tight">EduSync Super Admin</h1>
                <p className="text-[10px] text-muted-foreground font-semibold">Central Management</p>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-[1.02]"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-indigo-500/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0">
              {session?.user?.name?.[0] || "A"}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{session?.user?.name || "Admin User"}</p>
              <p className="text-[9px] text-muted-foreground font-medium truncate">{session?.user?.email || "admin@edusync.app"}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Sign Out"
            className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" />
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-indigo-500/15 bg-[#0d1222]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden text-muted-foreground hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Super Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black">
              System Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
