import React from "react"
import { cn } from "@/lib/utils"

interface GlassFormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string
  helperText?: string
  as?: "input" | "select" | "textarea"
  options?: { value: string; label: string }[]
}

export function GlassFormInput({
  label,
  helperText,
  as = "input",
  options = [],
  className,
  ...props
}: GlassFormInputProps) {
  const baseClasses = "w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/50"

  return (
    <div className="space-y-2 w-full">
      <label className="text-sm font-semibold text-foreground/90 block">
        {label}
      </label>
      
      {as === "input" && (
        <input 
          className={cn(baseClasses, className)} 
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)} 
        />
      )}
      
      {as === "select" && (
        <select 
          className={cn(baseClasses, "appearance-none bg-no-repeat bg-[right_1rem_center]", className)} 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")` }}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
      )}
      
      {as === "textarea" && (
        <textarea 
          className={cn(baseClasses, "min-h-[120px] resize-y", className)} 
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} 
        />
      )}
      
      {helperText && (
        <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
      )}
    </div>
  )
}
