import React from "react"
import { cn } from "@/lib/utils"

interface PasswordStrengthBarProps {
  password?: string
  className?: string
}

export function PasswordStrengthBar({ password = "", className }: PasswordStrengthBarProps) {
  // Simple strength calculation
  let strength = 0
  if (password.length >= 8) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^A-Za-z0-9]/.test(password)) strength += 1

  let percentage = 0
  let color = "bg-muted"
  let label = "Password strength"

  if (password.length === 0) {
    percentage = 0
  } else if (strength <= 2) {
    percentage = 33
    color = "bg-destructive"
    label = "Weak"
  } else if (strength === 3) {
    percentage = 66
    color = "bg-yellow-500"
    label = "Medium"
  } else {
    percentage = 100
    color = "bg-emerald-500"
    label = "Strong"
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="h-1.5 w-full bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
