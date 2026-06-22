import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] px-3 py-2 text-base transition-all duration-300 outline-none",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),0_2px_10px_rgba(0,0,0,0.02)]",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-[var(--glass-bg-hover)] focus-visible:shadow-[inset_0_1px_3px_rgba(0,0,0,0.05),0_0_20px_rgba(139,92,246,0.15)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "md:text-sm",
        "dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)] dark:focus-visible:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3),0_0_20px_rgba(139,92,246,0.25)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
