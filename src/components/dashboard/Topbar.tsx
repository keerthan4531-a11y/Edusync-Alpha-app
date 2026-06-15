"use client"

import { signOut } from "next-auth/react"
import { LogOut, User as UserIcon } from "lucide-react"
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

interface TopbarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 mx-3 md:px-6 md:mx-6 mt-4 mb-2 backdrop-blur-xl shadow-sm z-10 relative">
      <div className="flex flex-1 items-center gap-4">
        {/* We can add a mobile menu trigger here using Sheet later */}
        <h2 className="text-lg font-semibold tracking-tight">
          {user.role} Dashboard
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-10 w-10 rounded-full outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
