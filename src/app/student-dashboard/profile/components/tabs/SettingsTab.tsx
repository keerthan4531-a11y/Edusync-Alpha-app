import React, { useState } from "react"
import { Globe, Palette, Trash2, Download, Moon, Sun, Monitor, RefreshCw } from "lucide-react"
import { GlassFormInput } from "../ui/GlassFormInput"
import { DeleteAccountModal } from "../ui/DeleteAccountModal"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"

interface SettingsTabProps {
  showToast: (title: string, message: string, type: "success" | "error" | "info") => void
}

export function SettingsTab({ showToast }: SettingsTabProps) {
  const [savingLang, setSavingLang] = useState(false)
  const [langSettings, setLangSettings] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "DD/MM/YYYY"
  })

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const handleLangSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLang(true)
    setTimeout(() => {
      showToast("Success", "Language settings updated successfully", "success")
      setSavingLang(false)
    }, 800)
  }

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLangSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleExport = () => {
    showToast("Info", "Data export feature coming soon", "info")
  }

  const handleDeleteConfirm = (password: string) => {
    setIsDeleteModalOpen(false)
    showToast("Warning", "Account deletion feature coming soon", "warning")
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Language & Region */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Language & Region</h2>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
          <form onSubmit={handleLangSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassFormInput 
                label="Preferred Language" 
                name="language"
                as="select"
                value={langSettings.language}
                onChange={handleLangChange}
                options={[
                  { value: "en", label: "English" },
                  { value: "ta", label: "தமிழ் (Tamil)" },
                  { value: "hi", label: "हिन्दी (Hindi)" }
                ]}
              />
              
              <GlassFormInput 
                label="Time Zone" 
                name="timezone"
                as="select"
                value={langSettings.timezone}
                onChange={handleLangChange}
                options={[
                  { value: "UTC", label: "UTC" },
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                  { value: "America/New_York", label: "America/New_York (EST)" },
                  { value: "Europe/London", label: "Europe/London (GMT)" }
                ]}
              />
              
              <GlassFormInput 
                label="Date Format" 
                name="dateFormat"
                as="select"
                value={langSettings.dateFormat}
                onChange={handleLangChange}
                options={[
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" }
                ]}
              />
            </div>

            <Button 
              type="submit" 
              disabled={savingLang} 
              className="w-full md:w-auto px-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 rounded-xl text-base shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {savingLang ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}
              Save Language Settings
            </Button>
          </form>
        </div>
      </section>

      {/* Theme & Appearance */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Theme & Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base">Dark Mode</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Switch between light and dark appearance</p>
            </div>
            <div className="scale-125 origin-right">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </section>

      {/* Account Management */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl">
            <Trash2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Account Management</h2>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2rem] space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Export Data</h3>
              <p className="text-sm text-muted-foreground mt-1">Download all your data in JSON format</p>
            </div>
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] rounded-xl h-10 gap-2 shrink-0"
            >
              <Download className="w-4 h-4" /> Export My Data
            </Button>
          </div>

          <hr className="border-[var(--glass-border-subtle)]" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-destructive">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-lg">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <Button 
              onClick={() => setIsDeleteModalOpen(true)}
              variant="destructive" 
              className="rounded-xl h-10 gap-2 shrink-0 shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </div>

        </div>
      </section>

      <DeleteAccountModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleDeleteConfirm} 
      />

    </div>
  )
}
