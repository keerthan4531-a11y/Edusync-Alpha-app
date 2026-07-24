"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function ClassroomNav({ classroomId }: { classroomId: string }) {
  const pathname = usePathname()
  const basePath = `/faculty-dashboard/classrooms/${classroomId}`

  const navItems = [
    { name: "Stream", href: basePath },
    { name: "Classwork", href: `${basePath}/classwork` },
    { name: "People", href: `${basePath}/people` },
    { name: "Grades", href: `${basePath}/grades` },
  ]

  return (
    <nav className="flex items-center gap-1 border-b border-white/10 px-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            replace
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              isActive ? "text-indigo-400" : "text-zinc-400 hover:text-white"
            )}
          >
            {item.name}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
