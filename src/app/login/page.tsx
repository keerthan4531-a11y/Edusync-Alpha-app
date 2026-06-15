"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { BrainCircuit, Sparkles } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-app-gradient relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-stage1/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-stage2/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <LiquidGlassCard className="w-full max-w-md p-10 relative z-10" accentColor="#8b5cf6">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10 backdrop-blur-md">
            <BrainCircuit className="h-8 w-8 text-stage1 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            EduSync 4.0
            <Sparkles className="h-5 w-5 text-stage4" />
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">Welcome back to the future of learning</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
            <Input 
              type="email" 
              placeholder="name@example.com" 
              className="bg-black/20 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30 focus-visible:ring-stage1 focus-visible:ring-offset-0 focus-visible:bg-black/40 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              defaultValue="student@test.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="bg-black/20 border-white/10 h-12 rounded-xl text-white placeholder:text-white/30 focus-visible:ring-stage1 focus-visible:ring-offset-0 focus-visible:bg-black/40 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
              defaultValue="hash"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full h-12 rounded-xl bg-stage1 hover:bg-stage1/90 text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_15px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-[1.02]" 
            onClick={() => signIn("credentials", { email: "student@test.com", password: "hash", callbackUrl: "/student-dashboard" })}
          >
            Login as Student
          </Button>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
            <Button 
              className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors border border-white/10" 
              onClick={() => signIn("credentials", { email: "faculty@test.com", password: "hash", callbackUrl: "/faculty-dashboard" })}
            >
              Faculty
            </Button>
            <Button 
              className="w-full h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors border border-white/10" 
              onClick={() => signIn("credentials", { email: "hod@test.com", password: "hash", callbackUrl: "/hod-dashboard" })}
            >
              HOD
            </Button>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )
}
