"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid admin email or password")
        setLoading(false)
        return
      }

      // Verify session role
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()

      if (session?.user?.role !== "ADMIN") {
        setError("Access denied. Account does not have Admin privileges.")
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch {
      setError("An unexpected authentication error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <div className="neu-flat dark:bg-[#0d1222]/90 border border-indigo-500/20 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0d1222] rounded-[0.9rem] flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">EduSync Admin</h1>
              <p className="text-xs text-muted-foreground font-medium mt-1">Super Administrator Control Portal</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@edusync.app"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold bg-white/5 border border-white/10 text-white placeholder:text-muted-foreground/60 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black tracking-wide shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? "Authenticating Admin..." : "Sign In to Admin Console"}
            </button>
          </form>

          {/* Footer Note */}
          <div className="text-center border-t border-white/5 pt-4">
            <p className="text-[10px] text-muted-foreground font-medium">
              Authorized personnel only. All access attempts are logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
