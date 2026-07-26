import React from "react"
import { GraduationCap, Sparkles } from "lucide-react"
import Link from "next/link"

interface BrandLogoProps {
  className?: string
  showBadge?: boolean
  href?: string
}

export function BrandLogo({ className = "", showBadge = true, href = "/student-dashboard" }: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* Icon Squircle Badge with neumorphic depth + gradient */}
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
        <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-sm" />
      </div>

      {/* Brand Text */}
      <div className="flex items-center">
        <span className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
          Edu<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Sync</span>
        </span>
        
        {showBadge && (
          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-widest uppercase rounded-md bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300 border border-indigo-500/20">
            ALPHA
          </span>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="outline-none">
        {content}
      </Link>
    )
  }

  return content
}
