import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl",
        // Light: neumorphic raised
        "neu-raised",
        // Dark: glass
        "dark:bg-white/5 dark:backdrop-blur-md dark:border dark:border-white/10",
        className
      )} 
      {...props} 
    />
  )
}
