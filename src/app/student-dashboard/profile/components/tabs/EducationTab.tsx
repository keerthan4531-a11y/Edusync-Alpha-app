import React, { useState, useEffect } from "react"
import { GraduationCap, Save, RefreshCw, Trophy, Code } from "lucide-react"
import { ProfileData } from "@/types/profile"
import { GlassFormInput } from "../ui/GlassFormInput"
import { GlassProgressBar } from "../ui/GlassProgressBar"
import { Button } from "@/components/ui/button"

interface EducationTabProps {
  profile: ProfileData | null
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>
  showToast: (title: string, message: string, type: "success" | "error") => void
}

export function EducationTab({ profile, updateProfile, showToast }: EducationTabProps) {
  const [formData, setFormData] = useState({
    rollNumber: "",
    department: "",
    yearOfStudy: ""
  })
  const [saving, setSaving] = useState(false)

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        rollNumber: profile.rollNumber || "",
        department: profile.department || (profile.department !== "Unassigned Department" ? profile.department : ""),
        yearOfStudy: profile.yearOfStudy || ""
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { success, error } = await updateProfile(formData)
    
    if (success) {
      showToast("Success", "Education information updated successfully", "success")
    } else {
      showToast("Error", error || "Failed to update education information", "error")
    }
    
    setSaving(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-secondary/10 text-secondary rounded-xl">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Academic Profile</h2>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassFormInput 
              label="Roll Number" 
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="e.g. CS2024001" 
            />
            
            <GlassFormInput 
              label="Department" 
              name="department"
              as="select"
              value={formData.department}
              onChange={handleChange}
              options={[
                { value: "", label: "Select department" },
                { value: "CSE", label: "Computer Science and Engineering" },
                { value: "IT", label: "Information Technology" },
                { value: "ECE", label: "Electronics and Communication" },
                { value: "EEE", label: "Electrical and Electronics" },
                { value: "MECH", label: "Mechanical Engineering" }
              ]}
            />
            
            <GlassFormInput 
              label="Year of Study" 
              name="yearOfStudy"
              as="select"
              value={formData.yearOfStudy}
              onChange={handleChange}
              options={[
                { value: "", label: "Select year" },
                { value: "1", label: "First Year (Freshman)" },
                { value: "2", label: "Second Year (Sophomore)" },
                { value: "3", label: "Third Year (Junior)" },
                { value: "4", label: "Fourth Year (Senior)" }
              ]}
            />
            
            <GlassFormInput 
              label="Current Stage" 
              name="stage"
              value={`Stage ${profile?.level || 1}`}
              readOnly
              helperText="Advanced automatically based on XP"
            />
          </div>

          <div className="pt-8 border-t border-[var(--glass-border-subtle)] space-y-6">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider mb-4">Academic Progress</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <Code className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold">Challenges</h4>
                </div>
                <GlassProgressBar 
                  current={12} // Hardcoded for demo, normally from profile
                  goal={100}
                  fillGradient="from-indigo-500 to-purple-500"
                />
              </div>

              <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold">Projects</h4>
                </div>
                <GlassProgressBar 
                  current={1} // Hardcoded for demo
                  goal={10}
                  fillGradient="from-emerald-500 to-teal-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving} 
              className="w-full md:w-auto px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-6 rounded-xl text-base shadow-[0_4px_20px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Education Info
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
