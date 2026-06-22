"use client"

import { ThemeToggle } from "@/components/ThemeToggle"
import { useState, useEffect } from "react"
import { 
  User, Mail, Phone, FileText, LogOut, Edit, Flame, RefreshCw, ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"

export default function ProfileViewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // Profile Data
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/profile")
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setFullName(data.name || "")
        setEmail(data.email || "")
        setBio(data.bio || "")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
    const savedAvatar = localStorage.getItem("userAvatar")
    if (savedAvatar) setAvatarUrl(savedAvatar)
    
    const savedPhone = localStorage.getItem("student_phone")
    if (savedPhone) setPhone(savedPhone)
    
    const handleUpdate = () => {
      setAvatarUrl(localStorage.getItem("userAvatar"))
    }
    window.addEventListener("avatarUpdated", handleUpdate)
    return () => window.removeEventListener("avatarUpdated", handleUpdate)
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto text-foreground pb-24 px-4 md:px-0 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2 mt-4 px-2 md:px-0">
        <button 
          onClick={() => router.push('/student-dashboard')} 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--glass-shadow)] transition-all duration-300 backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">Profile</h1>
        <div className="w-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Centered Avatar and Stats */}
      <div className="flex flex-col items-center justify-center mt-6 mb-8">
        <div className="w-28 h-28 rounded-full bg-[var(--glass-bg)] flex items-center justify-center text-4xl font-black text-foreground overflow-hidden shadow-[var(--glass-shadow-hover),0_0_30px_rgba(139,92,246,0.1)] border-2 border-[var(--glass-border)] mb-4 transition-transform hover:scale-105 duration-300 backdrop-blur-xl">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-1">{fullName || "Student Demo"}</h1>
        <p className="text-muted-foreground text-sm mb-5">Student</p>
        
        {/* Glass stats pill */}
        <div className="flex gap-4 text-xs font-bold text-foreground bg-[var(--glass-bg)] px-6 py-3 rounded-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow)] backdrop-blur-xl">
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-foreground">{profile?.level || 1}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</span>
          </span>
          <div className="w-px h-8 bg-[var(--glass-border)]"></div>
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-yellow-400 drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]">{profile?.coins || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coins</span>
          </span>
          <div className="w-px h-8 bg-[var(--glass-border)]"></div>
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-500 flex items-center gap-1 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">
              <Flame className="w-4 h-4" /> {profile?.currentStreak || 0}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</span>
          </span>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-center mb-10">
        <Button 
          onClick={() => router.push('/student-dashboard/profile/edit')} 
          variant="glass"
          className="rounded-2xl px-8 py-6 text-base font-bold flex items-center gap-2 w-full max-w-xs border-[var(--glass-border)] hover:shadow-[var(--glass-shadow-hover),0_0_20px_rgba(139,92,246,0.1)]"
        >
          <Edit className="w-5 h-5" /> Edit Profile
        </Button>
      </div>

      {/* Info List Card */}
      <LiquidGlassCard className="p-2" accentColor="#8b5cf6">
        <div className="flex flex-col">
          
          {[
            { icon: User, label: "Full Name", value: fullName || "Not provided" },
            { icon: Mail, label: "Email", value: email || "student@example.com" },
            { icon: Phone, label: "Phone", value: phone || "Add your phone number" },
            { icon: FileText, label: "Bio", value: bio || "A work in progress, constantly evolving and learning. Passionate about growth and creativity." },
          ].map((item, i, arr) => (
            <div key={item.label} className={`flex items-center gap-4 p-5 md:p-6 hover:bg-[var(--glass-bg-hover)] transition-all duration-300 ${i < arr.length - 1 ? 'border-b border-[var(--glass-border-subtle)]' : ''} ${i === 0 ? 'rounded-t-[20px]' : ''}`}>
              <div className="w-10 h-10 rounded-xl glass-panel flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-muted-foreground relative z-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.label}</span>
                <span className="text-foreground font-semibold">{item.value}</span>
              </div>
            </div>
          ))}

          <div 
            className="flex items-center gap-4 p-5 md:p-6 cursor-pointer hover:bg-destructive/10 transition-all duration-300 rounded-b-[20px]" 
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-destructive font-bold">Logout</span>
          </div>

        </div>
      </LiquidGlassCard>
      
    </div>
  )
}
