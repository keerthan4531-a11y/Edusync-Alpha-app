import { useState, useCallback } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastMessage {
  id: string
  title: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((title: string, message: string, type: ToastType = "success", duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { id, title, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}
