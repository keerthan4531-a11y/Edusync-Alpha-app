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
    <header className="flex h-16 shrink-0 items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 md:px-6 mx-2 md:mx-6 mt-2 mb-2 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-10 relative transition-colors duration-300">
      {/* Logo - Left Corner */}
      <div className="flex items-center select-none pt-1">
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

      <div className="flex flex-1 items-center gap-4 justify-center">
        {/* We can add a mobile menu trigger here using Sheet later */}
      </div>
      
      <div className="flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors relative text-zinc-600 dark:text-gray-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0B0F19]"></span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors outline-none ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden text-zinc-600 dark:text-gray-300">
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
          <DropdownMenuContent className="w-64 bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-2" align="end" sideOffset={10}>
            <div className="flex flex-col space-y-1.5 px-3 py-3 font-normal bg-white/5 rounded-xl mb-2 border border-white/5">
              <p className="text-sm font-bold text-white">{displayName}</p>
              <p className="text-xs leading-none text-indigo-300 font-medium">
                {displayEmail}
              </p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/student-dashboard/profile')} className="cursor-pointer text-gray-300 focus:bg-indigo-500/20 focus:text-indigo-300 rounded-xl px-3 py-2.5 transition-colors">
              <UserIcon className="mr-3 h-4 w-4" />
              <span className="font-semibold">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-rose-400 focus:bg-rose-500/20 focus:text-rose-300 rounded-xl px-3 py-2.5 transition-colors mt-1">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
