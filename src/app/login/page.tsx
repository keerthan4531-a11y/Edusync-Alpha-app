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

  const roleColors = {
    STUDENT: "text-stage1",
    FACULTY: "text-stage2",
    HOD: "text-stage3"
  }

  const roleBackgrounds = {
    STUDENT: "bg-stage1",
    FACULTY: "bg-stage2",
    HOD: "bg-stage3"
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

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] ${roleBackgrounds[role]}/20 rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000`} />
        <div className={`absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] ${roleBackgrounds[role]}/10 rounded-full blur-[150px] mix-blend-screen transition-colors duration-1000`} />
        
        {/* Animated grid lines */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>
      </div>

      <div className="w-full max-w-[420px] p-6 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <LiquidGlassCard className="w-full p-8 relative overflow-hidden" accentColor={role === 'STUDENT' ? '#8b5cf6' : role === 'FACULTY' ? '#3b82f6' : '#10b981'}>
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div className={`absolute inset-0 ${roleBackgrounds[role]} rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
              <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10 backdrop-blur-xl relative z-10">
                <BrainCircuit className={`h-8 w-8 ${roleColors[role]} drop-shadow-md transition-colors duration-500`} />
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-2">
              EduSync 4.0
              <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium">Authentication Portal</p>
          </div>
          
          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-xl mb-8 border border-white/10 shadow-inner">
            {(["STUDENT", "FACULTY", "HOD"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r)
                  setEmail(r.toLowerCase() + "@test.com")
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
                  role === r 
                    ? `${roleBackgrounds[r]} text-white shadow-lg scale-[1.02]` 
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5 mb-8">
            <div className="space-y-1.5 relative group">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:bg-black/60 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>

            <div className="space-y-1.5 relative group">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                <span className="text-[10px] text-zinc-500 hover:text-white cursor-pointer transition-colors">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:bg-black/60 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 mt-2 rounded-xl ${roleBackgrounds[role]} hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2`}
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
            <p className="text-xs text-zinc-500">
              By signing in, you agree to our <span className="text-zinc-300 hover:text-white cursor-pointer">Terms of Service</span> & <span className="text-zinc-300 hover:text-white cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  )
}
