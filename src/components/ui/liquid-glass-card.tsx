import * as React from "react"
import { cn } from "@/lib/utils"

export interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accentColor?: string;
  enableShimmer?: boolean;
  enableHover?: boolean;
  variant?: "default" | "subtle" | "strong";
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, children, accentColor, enableShimmer = true, enableHover = true, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "glass-card-premium",
      subtle: "relative overflow-hidden rounded-[1.5rem] bg-[var(--glass-bg)]/40 backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border-subtle)] shadow-sm",
      strong: "glass-card-premium bg-[var(--glass-bg-hover)] border-[var(--glass-border)] shadow-[var(--glass-shadow-hover)]",
    }

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant],
          !enableHover && "hover:transform-none hover:shadow-none hover:bg-transparent",
          className
        )}
        {...props}
      >
        {/* Top-edge shimmer highlight */}
        {enableShimmer && <div className="glass-shimmer" />}

        {/* Specular highlight — top edge inner glow */}
        <div className="glass-specular" />

        {/* Noise texture overlay for physical realism */}
        <div className="glass-noise" />

        {/* Accent color glow */}
        {accentColor && (
          <div
            className="absolute top-[5%] left-[10%] w-[80%] h-[60%] pointer-events-none z-0 rounded-full"
            style={{
              backgroundColor: accentColor,
              filter: 'blur(60px)',
              opacity: 0.15,
              animation: 'glow-pulse 6s ease-in-out infinite alternate',
            }}
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
