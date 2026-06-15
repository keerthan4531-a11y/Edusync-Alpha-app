"use client"

import { useState, useEffect } from "react"
import { 
  User, Mail, Phone, FileText, LogOut, Edit, Flame, RefreshCw, ChevronLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

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
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto text-white pb-24 px-4 md:px-0 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2 mt-4 px-2 md:px-0">
        <button 
          onClick={() => router.push('/student-dashboard')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">Profile</h1>
        <div className="w-10 h-10"></div> {/* Spacer to perfectly center the title */}
      </div>

      {/* Centered Avatar and Stats */}
      <div className="flex flex-col items-center justify-center mt-6 mb-8">
        <div className="w-28 h-28 rounded-full bg-[#080A10] flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-xl border border-white/10 mb-4 transition-transform hover:scale-105 duration-300">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-1">{fullName || "Student Demo"}</h1>
        <p className="text-gray-400 text-sm mb-5">Student</p>
        
        <div className="flex gap-4 text-xs font-bold text-gray-300 bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-lg">
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-white">{profile?.level || 1}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Level</span>
          </span>
          <div className="w-px h-8 bg-white/10"></div>
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-yellow-400">{profile?.coins || 0}</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Coins</span>
          </span>
          <div className="w-px h-8 bg-white/10"></div>
          <span className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-500 flex items-center gap-1">
              <Flame className="w-4 h-4" /> {profile?.currentStreak || 0}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500">Streak</span>
          </span>
        </div>
      </div>

      {/* Edit Profile Button */}
      <div className="flex justify-center mb-10">
        <Button 
          onClick={() => router.push('/student-dashboard/profile/edit')} 
          className="bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-full px-8 py-6 text-base font-bold flex items-center gap-2 transition-all shadow-[0_4px_15px_rgba(255,255,255,0.05)] w-full max-w-xs"
        >
          <Edit className="w-5 h-5" /> Edit Profile
        </Button>
      </div>

      {/* Info List Card */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col">
          
          <div className="flex items-center gap-4 p-5 md:p-6 border-b border-white/10 hover:bg-white/5 transition-colors rounded-t-[24px]">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Full Name</span>
              <span className="text-gray-200 font-semibold">{fullName || "Not provided"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 md:p-6 border-b border-white/10 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email</span>
              <span className="text-gray-200 font-semibold">{email || "student@example.com"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 md:p-6 border-b border-white/10 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Phone</span>
              <span className="text-gray-200 font-semibold">{phone || "Add your phone number"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 md:p-6 border-b border-white/10 hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Bio</span>
              <span className="text-gray-200 font-semibold leading-relaxed">
                {bio || "A work in progress, constantly evolving and learning. Passionate about growth and creativity."}
              </span>
            </div>
          </div>

          <div 
            className="flex items-center gap-4 p-5 md:p-6 cursor-pointer hover:bg-red-500/10 transition-colors rounded-b-[24px]" 
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-red-400 font-bold">Logout</span>
          </div>

        </div>
      </div>
      
    </div>
  )
}
