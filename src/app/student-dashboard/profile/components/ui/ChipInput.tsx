import React, { useState } from "react"
import { Plus, X } from "lucide-react"

interface ChipInputProps {
  tags: string[]
  setTags: (tags: string[]) => void
  placeholder?: string
}

export function ChipInput({ tags, setTags, placeholder = "Add item..." }: ChipInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const val = inputValue.trim()
    if (val && !tags.includes(val)) {
      setTags([...tags, val])
      setInputValue("")
    }
  }

  const handleRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="space-y-3 w-full">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input 
          type="text" 
          value={inputValue} 
          onChange={e => setInputValue(e.target.value)} 
          placeholder={placeholder} 
          className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground/50"
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim()}
          className="bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] text-foreground rounded-xl px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>
      
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <span 
            key={tag} 
            className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in zoom-in duration-200"
          >
            {tag} 
            <button 
              type="button"
              onClick={() => handleRemove(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
