import * as React from "react"
import { cn } from "@/lib/utils"

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: string; // Optional hex or tailwind class for an inner glow tint
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, children, accentColor, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-[2rem]", // Continuous curve look
          // Mobile fallback: less blur, no saturate. Desktop: deep blur, high saturate.
          "bg-white/70 dark:bg-white/5 backdrop-blur-xl md:saturate-[1.5]", 
          "border border-white/50 dark:border-white/10",
          "shadow-xl shadow-black/5 dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]",
          "transition-all duration-300",
          className
        )}
        {...props}
      >
        {/* Subtle noise texture for realism (hidden on mobile for performance) */}
        <div 
          className="hidden md:block absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Optional inner glow matching accent color */}
        {accentColor && (
          <div 
            className="absolute top-0 left-1/4 w-1/2 h-full opacity-20 pointer-events-none blur-3xl mix-blend-screen"
            style={{ backgroundColor: accentColor }}
          />
        )}
        
        {/* Content layer */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    )
  }
)
LiquidGlassCard.displayName = "LiquidGlassCard"
