import * as React from "react"
import { cn } from "@/lib/utils"

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-panel relative overflow-hidden rounded-2xl",
        className
      )} 
      {...props} 
    >
      <div className="glass-specular" />
      <div className="glass-noise" />
      <div className="relative z-10 w-full h-full">{props.children}</div>
    </div>
  )
}
