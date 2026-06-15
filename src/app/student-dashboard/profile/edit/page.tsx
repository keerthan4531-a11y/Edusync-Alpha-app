"use client"

import { useState, useEffect } from "react"
import { 
  User, Shield, Award, Calendar, Flame, 
  Edit, CheckCircle2, AlertCircle, RefreshCw, 
  Plus, X, Briefcase, GraduationCap, Clock, Key, Lock,
  Camera, Code, Heart, Target, AlertTriangle, ChartBar,
  Trophy, Projector, BookOpen, Settings, Mail, History, Cog,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function StudentEditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("userAvatar")
    if (saved) setAvatarUrl(saved)
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setAvatarUrl(base64String)
        localStorage.setItem("userAvatar", base64String)
        window.dispatchEvent(new Event("avatarUpdated"))
        showToast("Profile picture updated!")
      }
      reader.readAsDataURL(file)
    }
  }

  // Profile Data States
  const [profile, setProfile] = useState<any>(null)
  
  // Personal Info Form
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [bio, setBio] = useState("")

  // Education Form
  const [rollNumber, setRollNumber] = useState("")
  const [department, setDepartment] = useState("")
  const [yearOfStudy, setYearOfStudy] = useState("")
  
  // Skills & Interests
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")
  const [goals, setGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState("")

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
        setSkills(data.skills || [])
      }
      
      // Load local-only fields
      const lPhone = localStorage.getItem("student_phone")
      if (lPhone) setPhone(lPhone)
      const lDob = localStorage.getItem("student_dob")
      if (lDob) setDob(lDob)
      const lGender = localStorage.getItem("student_gender")
      if (lGender) setGender(lGender)
      const lRoll = localStorage.getItem("student_rollNumber")
      if (lRoll) setRollNumber(lRoll)
      const lYear = localStorage.getItem("student_yearOfStudy")
      if (lYear) setYearOfStudy(lYear)
      
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setStatusMessage({ type, message })
    setTimeout(() => setStatusMessage({ type: null, message: "" }), 3000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          bio,
          skills
        })
      })
      if (res.ok) {
        // Save extra fields to localStorage
        localStorage.setItem("student_phone", phone)
        localStorage.setItem("student_dob", dob)
        localStorage.setItem("student_gender", gender)
        localStorage.setItem("student_rollNumber", rollNumber)
        localStorage.setItem("student_yearOfStudy", yearOfStudy)
        
        window.dispatchEvent(new Event("profileUpdated"))
        showToast("Changes saved successfully!")
      } else {
        showToast("Failed to save changes", "error")
      }
    } catch (error) {
      showToast("Network error occurred", "error")
    } finally {
      setSaving(false)
    }
  }

  const addChip = (e: React.FormEvent, item: string, setItem: any, list: string[], setList: any) => {
    e.preventDefault()
    if (!item.trim() || list.includes(item.trim())) return
    setList([...list, item.trim()])
    setItem("")
  }

  const removeChip = (item: string, list: string[], setList: any) => {
    setList(list.filter((i: string) => i !== item))
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto text-white pb-24">
      {/* Toast Notification */}
      {statusMessage.type && (
        <div className={cn(
          "fixed top-20 right-4 z-50 p-4 rounded-xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-right",
          statusMessage.type === "success" ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-red-500/90 border-red-400 text-white"
        )}>
          {statusMessage.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold text-sm">{statusMessage.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 px-2 md:px-0">
        <button 
          onClick={() => router.push('/student-dashboard/profile')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">Edit Profile</h1>
        <div className="w-10 h-10"></div> {/* Spacer to perfectly center the title */}
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-300">
          <label htmlFor="avatar-upload" className="block cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-[#080A10] flex items-center justify-center text-4xl font-black text-white overflow-hidden shadow-xl border border-white/10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName.charAt(0).toUpperCase() : "U"
              )}
            </div>
          </label>
          <div className="absolute bottom-1 right-0 w-8 h-8 bg-blue-500 rounded-full border-4 border-[#080A10] flex items-center justify-center shadow-lg hover:bg-blue-400 transition-colors pointer-events-none">
            <Edit className="w-3.5 h-3.5 text-white" />
          </div>
          <input 
            type="file" 
            id="avatar-upload" 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarChange} 
          />
        </div>
      </div>

      {/* SECTION 1: PERSONAL DETAILS */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-2">Personal Details</h2>
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl mx-2 md:mx-0">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Phone Number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 812-xxxx" className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Date of Birth</label>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                <option value="" className="bg-[#0B0F19]">Select gender</option>
                <option value="male" className="bg-[#0B0F19]">Male</option>
                <option value="female" className="bg-[#0B0F19]">Female</option>
                <option value="other" className="bg-[#0B0F19]">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none" />
            </div>

            <Button type="submit" disabled={saving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 mt-6 rounded-2xl text-base shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all">
              {saving ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null} Save Changes
            </Button>
          </form>
        </div>
      </div>

      {/* SECTION 2: EDUCATION (Contains Education, Skills, Achievements, Badges) */}
      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-2">Education</h2>
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl shadow-2xl mx-2 md:mx-0 space-y-12">
          
          {/* Sub-section: Education */}
          <div>
            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5" /> Academic Info
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Roll Number</label>
                <input type="text" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="e.g. CS2024001" className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="" className="bg-[#0B0F19]">Select department</option>
                  <option value="CSE" className="bg-[#0B0F19]">Computer Science</option>
                  <option value="IT" className="bg-[#0B0F19]">Information Technology</option>
                  <option value="ECE" className="bg-[#0B0F19]">Electronics</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Year of Study</label>
                <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="" className="bg-[#0B0F19]">Select year</option>
                  <option value="1" className="bg-[#0B0F19]">First Year</option>
                  <option value="2" className="bg-[#0B0F19]">Second Year</option>
                  <option value="3" className="bg-[#0B0F19]">Third Year</option>
                  <option value="4" className="bg-[#0B0F19]">Fourth Year</option>
                </select>
              </div>
              
              <div className="pt-4 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-purple-400">Challenges</span>
                    <span className="text-xs text-gray-400">12 / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[12%]" />
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-emerald-400">Projects</span>
                    <span className="text-xs text-gray-400">1 / 10</span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[10%]" />
                  </div>
                </div>
              </div>
              
              <Button type="submit" disabled={saving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 mt-4 rounded-2xl text-base shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all">
                Save Academic Info
              </Button>
            </form>
          </div>

          <hr className="border-white/10" />

          {/* Sub-section: Skills */}
          <div>
            <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2 mb-4">
              <Code className="w-5 h-5" /> Skills & Interests
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Technical Skills</label>
                <form onSubmit={(e) => addChip(e, newSkill, setNewSkill, skills, setSkills)} className="flex gap-2">
                  <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="e.g. Python, React" className="flex-1 bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  <Button type="submit" className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto px-5"><Plus className="w-4 h-4"/></Button>
                </form>
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map(s => (
                    <span key={s} className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                      {s} <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-400" onClick={() => removeChip(s, skills, setSkills)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Career Goals</label>
                <form onSubmit={(e) => addChip(e, newGoal, setNewGoal, goals, setGoals)} className="flex gap-2">
                  <input type="text" value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="e.g. Software Engineer" className="flex-1 bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  <Button type="submit" className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-auto px-5"><Plus className="w-4 h-4"/></Button>
                </form>
                <div className="flex flex-wrap gap-2 mt-3">
                  {goals.map(s => (
                    <span key={s} className="bg-white/10 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2">
                      {s} <X className="w-3.5 h-3.5 cursor-pointer hover:text-blue-400" onClick={() => removeChip(s, goals, setGoals)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Sub-section: Achievements & Badges */}
          <div>
            <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" /> Achievements & Badges
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                <Trophy className="w-10 h-10 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-base font-bold text-white">Achievements</span>
                <span className="text-xs text-indigo-300/70 mt-1 font-semibold tracking-wide">View History</span>
              </div>
              <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                <Award className="w-10 h-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-base font-bold text-white">Badges</span>
                <span className="text-xs text-yellow-300/70 mt-1 font-semibold tracking-wide">View Collection</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
