"use client"

import { useState, useEffect } from "react"
import { 
  User, Shield, Award, Calendar, Flame, 
  Edit, CheckCircle2, AlertCircle, RefreshCw, 
  Plus, X, Briefcase, GraduationCap, Clock, Key, Lock,
  Camera, Code, Heart, Target, AlertTriangle, ChartBar,
  Trophy, Projector, BookOpen, Settings, Mail, History, Cog,
  ChevronLeft, LayoutGrid, Users, MapPin, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { GlobalSpinner } from "@/components/ui/GlobalSpinner"

export default function StudentEditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Avatar local persistence (mocked)
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
      }
      reader.readAsDataURL(file)
    }
  }

  // ---- FORM STATES ----
  
  // Basic / Core
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("") // from User model (read-only for now)
  const [phone, setPhone] = useState("")
  const [alternatePhone, setAlternatePhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [aadharNo, setAadharNo] = useState("")
  const [bio, setBio] = useState("")
  
  // Academic
  const [studentId, setStudentId] = useState("")
  const [rollNumber, setRollNumber] = useState("")
  const [admissionNo, setAdmissionNo] = useState("")
  const [emisNo, setEmisNo] = useState("")
  const [department, setDepartment] = useState("") // Currently stored as a string name in user, could be updated
  const [batch, setBatch] = useState("")
  const [semester, setSemester] = useState("")
  const [year, setYear] = useState("")
  const [admissionType, setAdmissionType] = useState("")
  const [feeStatus, setFeeStatus] = useState("")
  
  // Demographics / Location
  const [nationality, setNationality] = useState("")
  const [religion, setReligion] = useState("")
  const [category, setCategory] = useState("")
  const [motherTongue, setMotherTongue] = useState("")
  const [residenceType, setResidenceType] = useState("")
  
  // Address (stored as JSON)
  const [addressStreet, setAddressStreet] = useState("")
  const [addressCity, setAddressCity] = useState("")
  const [addressState, setAddressState] = useState("")
  const [addressPincode, setAddressPincode] = useState("")
  
  // Family Info (stored as JSON)
  const [fatherName, setFatherName] = useState("")
  const [fatherPhone, setFatherPhone] = useState("")
  const [fatherOccupation, setFatherOccupation] = useState("")
  
  const [motherName, setMotherName] = useState("")
  const [motherPhone, setMotherPhone] = useState("")
  const [motherOccupation, setMotherOccupation] = useState("")

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/student/profile")
      const data = await res.json()
      if (res.ok) {
        setFullName(data.name || "")
        setEmail(data.email || "")
        setBio(data.bio || "")
        
        // Extract student profile data if available
        if (data.studentProfile) {
          const sp = data.studentProfile;
          setPhone(sp.phone || "");
          setAlternatePhone(sp.alternatePhone || "");
          setDob(sp.dateOfBirth ? sp.dateOfBirth.split("T")[0] : "");
          setGender(sp.gender || "");
          setBloodGroup(sp.bloodGroup || "");
          setAadharNo(sp.aadharNo || "");
          
          setStudentId(sp.studentId || "");
          setRollNumber(sp.rollNumber || "");
          setAdmissionNo(sp.admissionNo || "");
          setEmisNo(sp.emisNo || "");
          setBatch(sp.batch || "");
          setSemester(sp.semester ? sp.semester.toString() : "");
          setYear(sp.year ? sp.year.toString() : "");
          setAdmissionType(sp.admissionType || "");
          setFeeStatus(sp.feeStatus || "");
          
          setNationality(sp.nationality || "");
          setReligion(sp.religion || "");
          setCategory(sp.category || "");
          setMotherTongue(sp.motherTongue || "");
          setResidenceType(sp.residenceType || "");
          
          // Parse JSON Address
          if (sp.address) {
            try {
              const addr = JSON.parse(sp.address);
              setAddressStreet(addr.street || "");
              setAddressCity(addr.city || "");
              setAddressState(addr.state || "");
              setAddressPincode(addr.pincode || "");
            } catch (e) {}
          }
          
          // Parse JSON Parent Info
          if (sp.parentInfo) {
            try {
              const parent = JSON.parse(sp.parentInfo);
              if (parent.father) {
                setFatherName(parent.father.name || "");
                setFatherPhone(parent.father.phone || "");
                setFatherOccupation(parent.father.occupation || "");
              }
              if (parent.mother) {
                setMotherName(parent.mother.name || "");
                setMotherPhone(parent.mother.phone || "");
                setMotherOccupation(parent.mother.occupation || "");
              }
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfileData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Construct Address
    const address = {
      street: addressStreet,
      city: addressCity,
      state: addressState,
      pincode: addressPincode
    };
    
    // Construct Parent Info
    const parentInfo = {
      father: { name: fatherName, phone: fatherPhone, occupation: fatherOccupation },
      mother: { name: motherName, phone: motherPhone, occupation: motherOccupation }
    };

    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          bio,
          
          // Student Profile Schema
          phone, alternatePhone, dateOfBirth: dob || null, gender, bloodGroup, aadharNo,
          studentId, rollNumber, admissionNo, emisNo, 
          batch, semester: semester ? parseInt(semester) : null, year: year ? parseInt(year) : null, 
          admissionType, feeStatus,
          nationality, religion, category, motherTongue, residenceType,
          address, parentInfo
        })
      })
      if (res.ok) {
        window.dispatchEvent(new Event("profileUpdated"))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <GlobalSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto text-foreground pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 px-2 md:px-0">
        <button 
          onClick={() => router.push('/student-dashboard/profile')} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-600 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wide">Edit Profile</h1>
        <div className="w-10 h-10"></div> 
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-300">
          <label htmlFor="avatar-upload" className="block cursor-pointer">
            <div className="w-28 h-28 rounded-full bg-white/70 dark:bg-[#080A10] flex items-center justify-center text-4xl font-black text-foreground overflow-hidden shadow-xl border border-black/10 dark:border-white/10 backdrop-blur-xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                fullName ? fullName.charAt(0).toUpperCase() : "U"
              )}
            </div>
          </label>
          <div className="absolute bottom-1 right-0 w-8 h-8 bg-indigo-500 rounded-full border-4 border-[#080A10] flex items-center justify-center shadow-lg hover:bg-indigo-400 transition-colors pointer-events-none">
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

      {/* All Form Sections Sequential */}
      <div className="mx-2 md:mx-0 animate-in fade-in zoom-in-95 duration-300">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* SECTION 1: BASIC INFO */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-indigo-500 border-b border-black/5 dark:border-white/5 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" value={fullName} onChange={setFullName} />
              <InputField label="Email (Read Only)" value={email} onChange={() => {}} disabled />
              <InputField label="Primary Phone" value={phone} onChange={setPhone} type="tel" />
              <InputField label="Alternate Phone" value={alternatePhone} onChange={setAlternatePhone} type="tel" />
              <InputField label="Date of Birth" value={dob} onChange={setDob} type="date" />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select gender</option>
                  <option value="Male" className="bg-[#0B0F19] text-white">Male</option>
                  <option value="Female" className="bg-[#0B0F19] text-white">Female</option>
                  <option value="Other" className="bg-[#0B0F19] text-white">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select blood group</option>
                  <option value="A+" className="bg-[#0B0F19] text-white">A+</option>
                  <option value="O+" className="bg-[#0B0F19] text-white">O+</option>
                  <option value="B+" className="bg-[#0B0F19] text-white">B+</option>
                  <option value="AB+" className="bg-[#0B0F19] text-white">AB+</option>
                  <option value="A-" className="bg-[#0B0F19] text-white">A-</option>
                  <option value="O-" className="bg-[#0B0F19] text-white">O-</option>
                  <option value="B-" className="bg-[#0B0F19] text-white">B-</option>
                  <option value="AB-" className="bg-[#0B0F19] text-white">AB-</option>
                </select>
              </div>

              <InputField label="Aadhar Number" value={aadharNo} onChange={setAadharNo} />
            </div>
            <div className="mt-6 space-y-2">
              <label className="text-sm font-semibold text-zinc-600 dark:text-gray-300">Short Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." className="w-full bg-black/5 dark:bg-transparent border border-black/20 dark:border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
            </div>
          </div>

          {/* SECTION 2: ACADEMIC */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-indigo-500 border-b border-black/5 dark:border-white/5 pb-2">Academic Records</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Student ID" value={studentId} onChange={setStudentId} />
              <InputField label="Roll Number" value={rollNumber} onChange={setRollNumber} />
              <InputField label="Admission Number" value={admissionNo} onChange={setAdmissionNo} />
              <InputField label="EMIS Number" value={emisNo} onChange={setEmisNo} />
              <InputField label="Batch (e.g. 2024-2028)" value={batch} onChange={setBatch} />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select semester</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#0B0F19] text-white">Semester {s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Year of Study</label>
                <select value={year} onChange={e => setYear(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select year</option>
                  {[1,2,3,4].map(s => <option key={s} value={s} className="bg-[#0B0F19] text-white">Year {s}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Admission Type</label>
                <select value={admissionType} onChange={e => setAdmissionType(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select admission type</option>
                  <option value="Merit" className="bg-[#0B0F19] text-white">Merit / Regular</option>
                  <option value="Management" className="bg-[#0B0F19] text-white">Management Quota</option>
                  <option value="Lateral" className="bg-[#0B0F19] text-white">Lateral Entry</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Fee Status</label>
                <select value={feeStatus} onChange={e => setFeeStatus(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select status</option>
                  <option value="Paid" className="bg-[#0B0F19] text-white">Paid</option>
                  <option value="Pending" className="bg-[#0B0F19] text-white">Pending</option>
                  <option value="Scholarship" className="bg-[#0B0F19] text-white">Scholarship / Free</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: DEMOGRAPHICS */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-indigo-500 border-b border-black/5 dark:border-white/5 pb-2">Demographics & Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <InputField label="Nationality" value={nationality} onChange={setNationality} />
              <InputField label="Religion" value={religion} onChange={setReligion} />
              <InputField label="Category" value={category} onChange={setCategory} />
              <InputField label="Mother Tongue" value={motherTongue} onChange={setMotherTongue} />
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300">Residence Type</label>
                <select value={residenceType} onChange={e => setResidenceType(e.target.value)} className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors">
                  <option value="" className="bg-[#0B0F19] text-white">Select type</option>
                  <option value="Hostel" className="bg-[#0B0F19] text-white">Hosteller</option>
                  <option value="Day Scholar" className="bg-[#0B0F19] text-white">Day Scholar</option>
                </select>
              </div>
            </div>

            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Permanent Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InputField label="Street / Flat No." value={addressStreet} onChange={setAddressStreet} />
              </div>
              <InputField label="City" value={addressCity} onChange={setAddressCity} />
              <InputField label="State" value={addressState} onChange={setAddressState} />
              <InputField label="Pincode" value={addressPincode} onChange={setAddressPincode} />
            </div>
          </div>

          {/* SECTION 4: FAMILY INFO */}
          <div className="bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-indigo-500 border-b border-black/5 dark:border-white/5 pb-2">Family Information</h3>
            
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Father's Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <InputField label="Name" value={fatherName} onChange={setFatherName} />
              <InputField label="Phone Number" value={fatherPhone} onChange={setFatherPhone} type="tel" />
              <InputField label="Occupation" value={fatherOccupation} onChange={setFatherOccupation} />
            </div>

            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">Mother's Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField label="Name" value={motherName} onChange={setMotherName} />
              <InputField label="Phone Number" value={motherPhone} onChange={setMotherPhone} type="tel" />
              <InputField label="Occupation" value={motherOccupation} onChange={setMotherOccupation} />
            </div>
          </div>

          <div className="pt-2 mt-8">
            <Button type="submit" disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-6 rounded-2xl text-base shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all">
              {saving ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : null} Save All Changes
            </Button>
          </div>
        </form>
      </div>

    </div>
  )
}

function InputField({ label, value, onChange, type = "text", disabled = false }: { label: string, value: string, onChange: (v: string) => void, type?: string, disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-300">{label}</label>
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        disabled={disabled}
        className={cn(
          "w-full bg-transparent border border-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none transition-colors",
          disabled ? "opacity-50 cursor-not-allowed bg-black/10" : "focus:border-indigo-500",
          type === "date" ? "[color-scheme:dark]" : ""
        )} 
      />
    </div>
  )
}

