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
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans bg-[#02000a]">
      {/* Enhanced animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[50%] rounded-full blur-[140px] mix-blend-screen transition-all duration-1000"
          style={{ backgroundColor: roleGlows[role], opacity: 0.6 }}
        />
        <div 
          className="absolute bottom-[10%] -right-[10%] w-[70%] h-[60%] rounded-full blur-[160px] mix-blend-screen transition-all duration-1000"
          style={{ backgroundColor: roleGlows[role], opacity: 0.5 }}
        />
        <div 
          className="absolute top-[35%] left-[25%] w-[40%] h-[40%] rounded-full blur-[120px] mix-blend-screen transition-all duration-1000"
          style={{ backgroundColor: roleGlows[role], opacity: 0.35, animation: 'float-medium 25s ease-in-out infinite' }}
        />
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>
      </div>

      {/* Premium Glass Login Card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 delay-150">
        <div className="glass-card-premium p-6 sm:p-10 flex flex-col items-center">
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
          <div className="flex w-full p-1 glass-panel rounded-2xl mb-8 relative z-20">
            {(["STUDENT", "FACULTY", "HOD"] as const).map((r) => {
              const isActive = role === r
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r)
                    setEmail(r.toLowerCase() + "@test.com")
                  }}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 relative select-none ${
                    isActive 
                      ? "text-white" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <div 
                      className="absolute inset-0 bg-white/10 border rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-in fade-in zoom-in-95 duration-200"
                      style={{ 
                        borderColor: roleAccents[r],
                        boxShadow: `0 0 10px ${roleGlows[r]}`
                      }}
                    />
                  )}
                  <span className="relative z-10 tracking-wider">{r}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-5 mb-8 w-full">
            <div className="space-y-1.5 relative group w-full">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-foreground"
                  style={{
                    color: email ? roleAccents[role] : undefined
                  }}
                />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--glass-bg)] border-[var(--glass-border)] transition-all duration-300 focus-visible:bg-[var(--glass-bg-hover)]"
                  style={{
                    borderColor: email ? `${roleAccents[role]}50` : undefined,
                    boxShadow: email ? `0 0 15px ${roleGlows[role]}` : undefined
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5 relative group w-full">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Password</label>
                <span className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Forgot?</span>
              </div>
              <div className="relative">
                <Lock 
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300 group-focus-within:text-foreground"
                  style={{
                    color: password ? roleAccents[role] : undefined
                  }}
                />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[var(--glass-bg)] border-[var(--glass-border)] transition-all duration-300 focus-visible:bg-[var(--glass-bg-hover)]"
                  style={{
                    borderColor: password ? `${roleAccents[role]}50` : undefined,
                    boxShadow: password ? `0 0 15px ${roleGlows[role]}` : undefined
                  }}
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-2 rounded-xl text-white font-bold text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_20px_rgba(0,0,0,0.2)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: roleAccents[role],
                boxShadow: `0 4px 20px ${roleGlows[role]}`
              }}
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
