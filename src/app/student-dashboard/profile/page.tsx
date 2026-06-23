"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Camera, User, Flame, Award, ShieldCheck } from "lucide-react"

import { useProfileData } from "./hooks/useProfileData"
import { useToast } from "./hooks/useToast"

import { ProfileSidebar } from "./components/ProfileSidebar"
import { PersonalInfoTab } from "./components/tabs/PersonalInfoTab"
import { EducationTab } from "./components/tabs/EducationTab"
import { SkillsTab } from "./components/tabs/SkillsTab"
import { AchievementsTab } from "./components/tabs/AchievementsTab"
import { BadgesTab } from "./components/tabs/BadgesTab"
import { ActivityTab } from "./components/tabs/ActivityTab"
import { SecurityTab } from "./components/tabs/SecurityTab"
import { SettingsTab } from "./components/tabs/SettingsTab"

export default function ProfileViewPage() {
  const router = useRouter()
  const { profile, loading, updateProfile } = useProfileData()
  const { toasts, showToast, removeToast } = useToast()
  
  const [activeTab, setActiveTab] = useState("personal-info")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const savedAvatar = localStorage.getItem("userAvatar")
    if (savedAvatar) setAvatarUrl(savedAvatar)
    
    const handleUpdate = () => {
      setAvatarUrl(localStorage.getItem("userAvatar"))
    }
    window.addEventListener("avatarUpdated", handleUpdate)
    return () => window.removeEventListener("avatarUpdated", handleUpdate)
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Error", "File size must be less than 5MB", "error")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setAvatarUrl(base64String)
        localStorage.setItem("userAvatar", base64String)
        window.dispatchEvent(new Event("avatarUpdated"))
        showToast("Success", "Profile picture updated successfully", "success")
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-secondary rounded-full animate-spin direction-reverse"></div>
          <div className="absolute inset-4 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "personal-info": return <PersonalInfoTab profile={profile} updateProfile={updateProfile} showToast={showToast} />
      case "education": return <EducationTab profile={profile} updateProfile={updateProfile} showToast={showToast} />
      case "skills": return <SkillsTab profile={profile} updateProfile={updateProfile} />
      case "achievements": return <AchievementsTab profile={profile} />
      case "badges": return <BadgesTab profile={profile} />
      case "activity": return <ActivityTab profile={profile} />
      case "security": return <SecurityTab showToast={showToast} />
      case "settings": return <SettingsTab showToast={showToast} />
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto text-foreground pb-24 px-4 md:px-6 xl:px-0 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Toasts */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-right duration-300 w-80 backdrop-blur-xl ${
              toast.type === "success" ? "bg-emerald-500/90 border-emerald-400 text-white" :
              toast.type === "error" ? "bg-red-500/90 border-red-400 text-white" :
              toast.type === "warning" ? "bg-yellow-500/90 border-yellow-400 text-white" :
              "bg-blue-500/90 border-blue-400 text-white"
            }`}
          >
            <div className="flex flex-col">
              <span className="font-bold text-sm">{toast.title}</span>
              <span className="text-xs opacity-90">{toast.message}</span>
            </div>
            <button onClick={() => removeToast(toast.id)} className="ml-auto opacity-70 hover:opacity-100">×</button>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6 mt-4">
        <button 
          onClick={() => router.push('/student-dashboard')} 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] hover:bg-[var(--glass-bg-hover)] hover:shadow-[var(--glass-shadow)] transition-all duration-300 backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold tracking-wide">My Profile</h1>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8">
        
        {/* Left Column: Avatar Card & Sidebar Navigation */}
        <div className="space-y-6">
          
          {/* Profile Header Card */}
          <div className="glass-card-premium p-6 flex flex-col items-center text-center relative overflow-hidden group">
            {/* Background glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[100px] bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="relative mb-4 cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
              <div className="w-28 h-28 rounded-full bg-[var(--glass-bg)] flex items-center justify-center text-4xl font-black text-foreground overflow-hidden shadow-[var(--glass-shadow-hover)] border-2 border-[var(--glass-border)] transition-transform hover:scale-105 duration-300 backdrop-blur-xl relative z-10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-20">
                <Camera className="w-4 h-4 text-primary-foreground" />
              </div>
              <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex items-center gap-2 mb-1 z-10">
              <h2 className="text-xl font-bold">{profile?.name || "Student Demo"}</h2>
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]" title="Verified Student">✓</div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-6 z-10">{profile?.department || "Unassigned Department"}</p>
            
            {/* Stats Pill Grid */}
            <div className="grid grid-cols-2 gap-3 w-full z-10">
              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-xl p-3 flex flex-col items-center">
                <span className="text-lg font-black text-foreground">{profile?.level || 1}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</span>
              </div>
              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-xl p-3 flex flex-col items-center">
                <span className="text-lg font-black text-yellow-500 flex items-center gap-1">
                  <Award className="w-4 h-4" /> {profile?.coins || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Credits</span>
              </div>
              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-xl p-3 flex flex-col items-center">
                <span className="text-lg font-black text-amber-500 flex items-center gap-1">
                  <Flame className="w-4 h-4" /> {profile?.currentStreak || 0}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</span>
              </div>
              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] rounded-xl p-3 flex flex-col items-center">
                <span className="text-lg font-black text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> {profile?.level || 1}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Stage</span>
              </div>
            </div>
          </div>

          <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Right Column: Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>

      </div>
    </div>
  )
}
