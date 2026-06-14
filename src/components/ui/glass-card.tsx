import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn("bg-white/5 backdrop-blur-md border border-white/10 rounded-xl", className)} 
      {...props} 
    />
  )
}
