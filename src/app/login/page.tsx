"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { BrainCircuit, Sparkles, Loader2, Mail, Lock, User, UserCheck, ShieldAlert } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("student@test.com")
  const [password, setPassword] = useState("hash")
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"STUDENT" | "FACULTY" | "HOD">("STUDENT")

  const roleAccents: Record<string, string> = {
    STUDENT: "#8b5cf6",
    FACULTY: "#3b82f6",
    HOD: "#10b981"
  }

  const roleGlows: Record<string, string> = {
    STUDENT: "rgba(139, 92, 246, 0.25)",
    FACULTY: "rgba(59, 130, 246, 0.25)",
    HOD: "rgba(16, 185, 129, 0.25)",
  }

  const roleColorClasses = {
    STUDENT: { text: "text-stage1", bg: "bg-stage1", border: "border-stage1/30" },
    FACULTY: { text: "text-stage2", bg: "bg-stage2", border: "border-stage2/30" },
    HOD: { text: "text-stage3", bg: "bg-stage3", border: "border-stage3/30" },
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    
    let callbackUrl = "/student-dashboard"
    if (role === "FACULTY") callbackUrl = "/faculty-dashboard"
    if (role === "HOD") callbackUrl = "/hod-dashboard"

    await signIn("credentials", { 
      email, 
      password, 
      callbackUrl 
    })
  }

  const rc = roleColorClasses[role]

  return (
    <div className="flex min-h-screen w-full items-center justify-center relative overflow-hidden font-sans">
      {/* Enhanced animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: roleGlows[role] }}
        />
        <div 
          className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: roleGlows[role], opacity: 0.5 }}
        />
        <div 
          className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full blur-[100px] mix-blend-screen transition-colors duration-1000"
          style={{ backgroundColor: roleGlows[role], opacity: 0.3, animation: 'float-medium 20s ease-in-out infinite' }}
        />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>
      </div>

      {/* Premium Glass Login Card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 delay-150">
        <div className="glass-card-premium p-8 sm:p-10 flex flex-col items-center">
          <div className="glass-shimmer" />
          <div className="glass-specular" />
          <div className="glass-noise" />
          
          <div className="relative z-10 w-full flex flex-col items-center mb-8">
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{ backgroundColor: roleAccents[role] }}
              />
              <div className="h-16 w-16 bg-[var(--glass-bg)] rounded-2xl flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),var(--glass-shadow)] border border-[var(--glass-border)] backdrop-blur-xl relative z-10">
                <BrainCircuit className={`h-8 w-8 ${rc.text} drop-shadow-[0_0_8px_currentColor] transition-colors duration-500`} />
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 mt-2">
              EduSync <span className="text-primary">4.0</span>
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            </h1>
            <p className="text-muted-foreground text-sm mt-2 font-medium">Authentication Portal</p>
          </div>
          
          {/* Role Selection Tabs with Glass Pill */}
          <div className="flex p-1 glass-panel rounded-xl mb-8">
            {(["STUDENT", "FACULTY", "HOD"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r)
                  setEmail(r.toLowerCase() + "@test.com")
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 relative ${
                  role === r 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {role === r && (
                  <div className="absolute inset-0 bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] rounded-lg shadow-sm" />
                )}
                <span className="relative z-10">{r}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5 mb-8 w-full">
            <div className="space-y-1.5 relative group">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--glass-bg)] border-[var(--glass-border)]"
                />
              </div>
            </div>

            <div className="space-y-1.5 relative group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                <span className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--glass-bg)] border-[var(--glass-border)]"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 mt-2 rounded-xl ${rc.bg} hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {role === "STUDENT" && <User className="w-4 h-4" />}
                  {role === "FACULTY" && <UserCheck className="w-4 h-4" />}
                  {role === "HOD" && <ShieldAlert className="w-4 h-4" />}
                  Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our <span className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors">Terms of Service</span> & <span className="text-foreground/70 hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
