import React, { useState, useEffect } from "react"
import { UserCircle, Save, RefreshCw } from "lucide-react"
import { ProfileData } from "@/types/profile"
import { GlassFormInput } from "../ui/GlassFormInput"
import { Button } from "@/components/ui/button"

interface PersonalInfoTabProps {
  profile: ProfileData | null
  updateProfile: (updates: Partial<ProfileData>) => Promise<{ success: boolean; error?: string }>
  showToast: (title: string, message: string, type: "success" | "error") => void
}

export function PersonalInfoTab({ profile, updateProfile, showToast }: PersonalInfoTabProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bio: ""
  })
  const [saving, setSaving] = useState(false)

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
        bio: profile.bio || ""
      })
    }
  }, [profile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const { success, error } = await updateProfile(formData)
    
    if (success) {
      showToast("Success", "Personal information updated successfully", "success")
    } else {
      showToast("Error", error || "Failed to update personal information", "error")
    }
    
    setSaving(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
          <UserCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
      </div>

      <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassFormInput 
              label="Full Name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe" 
            />
            
            <GlassFormInput 
              label="Email Address" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com" 
              readOnly // Often read-only if managed by OAuth
              helperText="Contact support to change your email"
            />
            
            <GlassFormInput 
              label="Phone Number" 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 812-xxxx" 
            />
            
            <GlassFormInput 
              label="Date of Birth" 
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
            />
            
            <GlassFormInput 
              label="Gender" 
              name="gender"
              as="select"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: "", label: "Select gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not", label: "Prefer not to say" }
              ]}
            />
          </div>

          <GlassFormInput 
            label="Bio" 
            name="bio"
            as="textarea"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..." 
          />

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={saving} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 rounded-xl text-base shadow-[0_4px_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
