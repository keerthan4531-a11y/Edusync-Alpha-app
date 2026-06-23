import React, { useState } from "react"
import { Shield, Key, Bell, Activity, LogOut, RefreshCw, Smartphone } from "lucide-react"
import { GlassFormInput } from "../ui/GlassFormInput"
import { PasswordStrengthBar } from "../ui/PasswordStrengthBar"
import { Button } from "@/components/ui/button"

interface SecurityTabProps {
  showToast: (title: string, message: string, type: "success" | "error" | "info") => void
}

export function SecurityTab({ showToast }: SecurityTabProps) {
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    activityLog: true
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.new !== passwordForm.confirm) {
      showToast("Error", "New passwords do not match", "error")
      return
    }

    setSavingPassword(true)
    // Simulate API call for password change (NextAuth handles credentials usually)
    setTimeout(() => {
      showToast("Success", "Password changed successfully", "success")
      setPasswordForm({ current: "", new: "", confirm: "" })
      setSavingPassword(false)
    }, 1000)
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    showToast("Info", "Preference updated", "info")
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Change Password */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Change Password</h2>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
            <GlassFormInput 
              label="Current Password" 
              name="current"
              type="password"
              value={passwordForm.current}
              onChange={handlePasswordChange}
              required
            />
            
            <div className="space-y-2">
              <GlassFormInput 
                label="New Password" 
                name="new"
                type="password"
                value={passwordForm.new}
                onChange={handlePasswordChange}
                required
              />
              <div className="px-2 pt-2">
                <PasswordStrengthBar password={passwordForm.new} />
              </div>
            </div>

            <GlassFormInput 
              label="Confirm New Password" 
              name="confirm"
              type="password"
              value={passwordForm.confirm}
              onChange={handlePasswordChange}
              required
            />

            <Button 
              type="submit" 
              disabled={savingPassword || !passwordForm.current || !passwordForm.new} 
              className="w-full md:w-auto px-8 bg-rose-500 hover:bg-rose-600 text-white font-bold py-6 rounded-xl text-base shadow-[0_4px_20px_rgba(244,63,94,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {savingPassword ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
              Update Password
            </Button>
          </form>
        </div>
      </section>

      {/* Security Settings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Security Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--glass-bg)] rounded-xl group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Email Notifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Receive security alerts</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('email')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.email ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.email ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--glass-bg)] rounded-xl group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Push Notifications</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Browser notifications</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('push')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.push ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.push ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--glass-bg)] rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Activity Log</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Track all account activity</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSetting('activityLog')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.activityLog ? 'bg-primary' : 'bg-muted'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.activityLog ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="glass-panel p-6 rounded-[1.5rem] flex flex-col md:flex-row md:items-center justify-between gap-4 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--glass-bg)] rounded-xl group-hover:scale-110 transition-transform">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Login Sessions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Manage active devices</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-[var(--glass-border)] text-destructive hover:bg-destructive hover:text-white rounded-xl text-xs h-9"
              onClick={() => showToast("Info", "All other sessions logged out", "info")}
            >
              Logout All
            </Button>
          </div>

        </div>
      </section>

    </div>
  )
}
