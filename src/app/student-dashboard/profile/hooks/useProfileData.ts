import { useState, useEffect, useCallback } from "react"
import { ProfileData } from "@/types/profile"

export function useProfileData() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/student/profile")
      if (!res.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await res.json()
      
      // Load local-only fields if they don't exist in the DB response yet
      const mergedData: ProfileData = {
        ...data,
        phone: data.phone || localStorage.getItem("student_phone") || "",
        dob: data.dob || localStorage.getItem("student_dob") || "",
        gender: data.gender || localStorage.getItem("student_gender") || "",
        rollNumber: data.rollNumber || localStorage.getItem("student_rollNumber") || "",
        yearOfStudy: data.yearOfStudy || localStorage.getItem("student_yearOfStudy") || "",
        interests: data.interests || JSON.parse(localStorage.getItem("student_interests") || "[]"),
        careerGoals: data.careerGoals || JSON.parse(localStorage.getItem("student_careerGoals") || "[]"),
        weakAreas: data.weakAreas || JSON.parse(localStorage.getItem("student_weakAreas") || "[]"),
      }
      
      setProfile(mergedData)
    } catch (e: any) {
      console.error(e)
      setError(e.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    
    const handleProfileUpdate = () => {
      fetchProfile()
    }
    window.addEventListener("profileUpdated", handleProfileUpdate)
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate)
  }, [fetchProfile])

  const updateProfile = async (updates: Partial<ProfileData>) => {
    try {
      // Optimistic update
      setProfile(prev => prev ? { ...prev, ...updates } : null)
      
      // Save local fields
      if (updates.phone !== undefined) localStorage.setItem("student_phone", updates.phone)
      if (updates.dob !== undefined) localStorage.setItem("student_dob", updates.dob)
      if (updates.gender !== undefined) localStorage.setItem("student_gender", updates.gender)
      if (updates.rollNumber !== undefined) localStorage.setItem("student_rollNumber", updates.rollNumber)
      if (updates.yearOfStudy !== undefined) localStorage.setItem("student_yearOfStudy", updates.yearOfStudy)
      if (updates.interests !== undefined) localStorage.setItem("student_interests", JSON.stringify(updates.interests))
      if (updates.careerGoals !== undefined) localStorage.setItem("student_careerGoals", JSON.stringify(updates.careerGoals))
      if (updates.weakAreas !== undefined) localStorage.setItem("student_weakAreas", JSON.stringify(updates.weakAreas))
      
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      
      if (!res.ok) {
        throw new Error("Failed to update profile")
      }
      
      window.dispatchEvent(new Event("profileUpdated"))
      return { success: true }
    } catch (error: any) {
      console.error(error)
      // Revert optimistic update by fetching again
      fetchProfile()
      return { success: false, error: error.message }
    }
  }

  return { profile, loading, error, refetch: fetchProfile, updateProfile }
}
