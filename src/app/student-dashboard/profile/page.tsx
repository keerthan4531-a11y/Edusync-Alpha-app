"use client"

import { useState, useEffect } from "react"
import { 
  User, Mail, Shield, Award, Calendar, Flame, 
  Edit, CheckCircle2, AlertCircle, RefreshCw, 
  Plus, X, Briefcase, GraduationCap, Clock, Key, Lock, Sparkles, BookOpenCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card"
import { GlassCard } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  earned: boolean
  earnedAt: string | null
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
}

interface StageProgress {
  stageNumber: number
  stageName: string
  status: string
  completedAt: string | null
}

interface ProfileData {
  id: string
  name: string
  email: string
  role: string
  xp: number
  coins: number
  level: number
  currentStreak: number
  longestStreak: number
  bio: string
  skills: string[]
  github: string
  linkedin: string
  department: string
  badges: Badge[]
  stageProgress: StageProgress[]
  activities: Activity[]
}

type TabType = "details" | "badges" | "timeline" | "security"

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("details")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // Form edit states
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editGithub, setEditGithub] = useState("")
  const [editLinkedin, setEditLinkedin] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  
  // Security mock states
  const [twoFactor, setTwoFactor] = useState(false)
  
  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" })

  const fetchProfileData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)

    try {
      const res = await fetch("/api/student/profile")
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setEditName(data.name || "")
        setEditBio(data.bio || "")
        setEditGithub(data.github || "")
        setEditLinkedin(data.linkedin || "")
        setSkills(data.skills || [])
      } else {
        setStatusMessage({ type: "error", message: data.error || "Failed to load profile details." })
      }
    } catch (e) {
      console.error("Profile fetch error", e)
      setStatusMessage({ type: "error", message: "Network communication error." })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatusMessage({ type: null, message: "" })

    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          github: editGithub,
          linkedin: editLinkedin,
          skills
        })
      })

      const data = await res.json()
      if (res.ok) {
        setStatusMessage({ type: "success", message: "Profile updated successfully!" })
        fetchProfileData(true)
        setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
      } else {
        setStatusMessage({ type: "error", message: data.error || "Failed to update profile." })
      }
    } catch (err) {
      console.error("Profile update error", err)
      setStatusMessage({ type: "error", message: "An error occurred while updating profile." })
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    if (skills.includes(newSkill.trim())) {
      setNewSkill("")
      return
    }
    setSkills([...skills, newSkill.trim()])
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-3 text-gray-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        <span>Loading student profile...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center text-gray-400">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <span>Could not find student profile.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-4 md:px-0 pb-12 max-w-5xl mx-auto text-white">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your campus details, certificates, and achievements cabinet.</p>
        </div>
        <button 
          onClick={() => fetchProfileData(true)}
          disabled={refreshing}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-gray-300 hover:text-white"
        >
          <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
        </button>
      </div>

      {statusMessage.type && (
        <div className={cn(
          "p-4 rounded-2xl border text-sm flex items-center gap-3 shadow-lg transition-all",
          statusMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-red-500/10 border-red-500/20 text-red-400"
        )}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold">{statusMessage.message}</span>
        </div>
      )}

      {/* Main Glass Header Card */}
      <LiquidGlassCard className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-white/10 shadow-2xl" accentColor="#818cf8">
        {/* Avatar circle */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 border border-white/20 flex items-center justify-center text-white text-3xl font-black shadow-lg">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        {/* Profile basic statistics */}
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h2>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full self-center">
              Student
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">{profile.email}</p>
          <p className="text-xs text-indigo-400 font-semibold">{profile.department}</p>
        </div>

        {/* Level, XP, Streak Stats Grid */}
        <div className="grid grid-cols-3 gap-6 text-center bg-black/20 border border-white/5 p-4 rounded-2xl shrink-0 w-full md:w-auto">
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Level</span>
            <span className="text-xl font-extrabold text-indigo-300 mt-1 block">{profile.level}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">XP Points</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{profile.xp}</span>
          </div>
          <div className="text-amber-400">
            <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Streak</span>
            <span className="text-xl font-extrabold flex items-center justify-center gap-1 mt-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{profile.currentStreak}</span>
            </span>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Tabs navigation */}
      <div className="flex bg-black/30 border border-white/10 rounded-2xl p-1 self-start">
        <button 
          onClick={() => setActiveTab("details")}
          className={cn(
            "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "details" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <User className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
        <button 
          onClick={() => setActiveTab("badges")}
          className={cn(
            "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "badges" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <Award className="w-4 h-4" />
          <span>Badges Cabinet</span>
        </button>
        <button 
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "timeline" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Activity Log</span>
        </button>
        <button 
          onClick={() => setActiveTab("security")}
          className={cn(
            "px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2",
            activeTab === "security" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <Shield className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* Details / Edit Profile Form Tab */}
      {activeTab === "details" && (
        <GlassCard className="p-6 border-white/10 shadow-lg">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Edit className="w-5 h-5 text-indigo-400" />
            <span>Profile Information</span>
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email (Read-Only)</label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">GitHub Username</label>
                <div className="relative">
                  <GithubIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={editGithub}
                    onChange={e => setEditGithub(e.target.value)}
                    placeholder="octocat"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">LinkedIn Profile</label>
                <div className="relative">
                  <LinkedinIcon className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={editLinkedin}
                    onChange={e => setEditLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Biography / About Me</label>
              <textarea 
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Write a short summary about yourself..."
                rows={4}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"
              />
            </div>

            {/* Skills Chips component */}
            <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
              <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Technical Skills</label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.length === 0 ? (
                  <span className="text-xs text-gray-500">No skills added yet.</span>
                ) : (
                  skills.map(skill => (
                    <span 
                      key={skill}
                      className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-semibold"
                    >
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input 
                  type="text"
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  placeholder="e.g. Next.js"
                  className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1"
                />
                <Button 
                  onClick={handleAddSkill}
                  type="submit"
                  size="sm"
                  className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </Button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-98 transition-all text-sm self-start"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </form>
        </GlassCard>
      )}

      {/* Badges Cabinet Grid Tab */}
      {activeTab === "badges" && (
        <GlassCard className="p-6 border-white/10 shadow-lg">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Badges Cabinet</span>
          </h3>

          {profile.badges.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No badges available in the campus library.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
              {profile.badges.map(badge => (
                <div 
                  key={badge.id}
                  className={cn(
                    "p-5 rounded-2xl border text-center flex flex-col items-center justify-center gap-3 relative transition-all duration-300",
                    badge.earned 
                      ? "bg-emerald-500/5 border-emerald-500/20 shadow-md shadow-emerald-500/5" 
                      : "bg-white/5 border-white/5 opacity-50 filter grayscale"
                  )}
                >
                  {/* Lock badge */}
                  {!badge.earned && (
                    <div className="absolute top-2.5 right-2.5 text-gray-600">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                    badge.earned ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"
                  )}>
                    🏆
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white">{badge.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{badge.description}</p>
                  </div>

                  {badge.earned && badge.earnedAt && (
                    <div className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider mt-auto bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Activity Timeline Log Tab */}
      {activeTab === "timeline" && (
        <GlassCard className="p-6 border-white/10 shadow-lg">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>Activity Log</span>
          </h3>

          {profile.activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No recent activity recorded. Submit coding exercises or assignments to trigger logs.
            </div>
          ) : (
            <div className="relative pl-6 border-l border-white/10 space-y-8">
              {profile.activities.map(act => (
                <div key={act.id} className="relative">
                  {/* Timeline dot badge */}
                  <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] border border-indigo-400" />
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                    <h4 className="font-bold text-sm text-white">{act.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Security Actions Tab */}
      {activeTab === "security" && (
        <GlassCard className="p-6 border-white/10 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>Account Security</span>
          </h3>

          <div className="grid gap-6 sm:grid-cols-2">
            <LiquidGlassCard className="p-5 border-white/10 flex flex-col justify-between h-40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Reset Account Password</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Trigger a reset token verification link.</p>
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  setStatusMessage({ type: "success", message: "Password reset link sent to your email!" })
                  setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
                }}
                className="mt-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl py-2 font-semibold text-xs transition-all w-full"
              >
                Request Reset
              </Button>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-5 border-white/10 flex flex-col justify-between h-40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Two-Factor Authentication</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Protect account access with 2FA codes.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border",
                  twoFactor 
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" 
                    : "bg-red-500/20 border-red-500/30 text-red-400"
                )}>
                  {twoFactor ? "Enabled" : "Disabled"}
                </span>

                <button 
                  onClick={() => {
                    setTwoFactor(!twoFactor)
                    setStatusMessage({ 
                      type: "success", 
                      message: !twoFactor ? "Two-Factor Auth has been enabled." : "Two-Factor Auth has been disabled." 
                    })
                    setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
                  }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  Toggle 2FA
                </button>
              </div>
            </LiquidGlassCard>
          </div>
        </GlassCard>
      )}
    </div>
  )
}
