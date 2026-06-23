import React, { useState } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (password: string) => void
}

export function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
  const [password, setPassword] = useState("")
  const [understood, setUnderstood] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 text-destructive">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Delete Account</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          <p className="text-sm text-foreground/80">
            Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including progress, achievements, and projects will be deleted.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/90">
              Enter your password to confirm
            </label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-background/50 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-all"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input 
                type="checkbox" 
                checked={understood}
                onChange={e => setUnderstood(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--glass-border)] text-destructive focus:ring-destructive bg-background/50" 
              />
            </div>
            <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
              I understand this action is irreversible
            </span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1 rounded-xl border-[var(--glass-border)] bg-transparent hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onConfirm(password)}
              disabled={!understood || !password}
              variant="destructive"
              className="flex-1 rounded-xl gap-2 shadow-[0_4px_14px_rgba(239,68,68,0.3)]"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
