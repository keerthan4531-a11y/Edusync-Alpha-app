"use client"

import { signOut } from "next-auth/react"
import { LogOut, User as UserIcon, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"

interface TopbarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState(user.name)
  const [displayEmail, setDisplayEmail] = useState(user.email)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/student/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.name) setDisplayName(data.name)
          if (data.email) setDisplayEmail(data.email)
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchProfile()

    const saved = localStorage.getItem("userAvatar")
    if (saved) setAvatarUrl(saved)

    const handleAvatarUpdate = () => {
      setAvatarUrl(localStorage.getItem("userAvatar"))
    }
    
    const handleProfileUpdate = () => {
      fetchProfile()
    }
    
    window.addEventListener("avatarUpdated", handleAvatarUpdate)
    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => {
      window.removeEventListener("avatarUpdated", handleAvatarUpdate)
      window.removeEventListener("profileUpdated", handleProfileUpdate)
    }
  }, [])

  return (
    <header className="glass-panel flex h-16 shrink-0 items-center justify-between rounded-2xl mx-2 md:mx-6 mt-2 mb-2 px-4 md:px-6 z-10 relative overflow-hidden transition-all duration-300">
      <div className="glass-noise" />
      <div className="absolute top-0 left-0 right-0 h-full pointer-events-none glass-shimmer" />
      <div className="glass-specular" />

      {/* Logo - Left Corner */}
      <div className="flex items-center select-none pt-1 relative z-10">
        <Image 
          src="/images/edusync-logo.png" 
          alt="EduSync Logo" 
          width={0} 
          height={0} 
          sizes="100vw"
          style={{ width: "auto", height: "50px" }}
          className="object-contain"
          priority
        />
      </div>

      <div className="flex flex-1 items-center gap-4 justify-center relative z-10">
        {/* We can add a mobile menu trigger here using Sheet later */}
      </div>
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Notification bell with glass styling */}
        <button className="glass-panel flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 relative text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5 relative z-10" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse z-20"></span>
        </button>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="glass-panel flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 overflow-hidden text-muted-foreground hover:text-foreground">
            <Avatar className="h-full w-full bg-transparent flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback className="bg-transparent flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="end" sideOffset={10}>
            {/* User info card */}
            <div className="flex flex-col space-y-1.5 px-3 py-3 font-normal bg-[var(--glass-bg)] rounded-xl mb-2 border border-[var(--glass-border-subtle)]">
              <p className="text-sm font-bold text-foreground">{displayName}</p>
              <p className="text-xs leading-none text-primary font-medium">
                {displayEmail}
              </p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/student-dashboard/profile')} className="cursor-pointer rounded-xl px-3 py-2.5">
              <UserIcon className="mr-3 h-4 w-4" />
              <span className="font-semibold">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl px-3 py-2.5 mt-1">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
