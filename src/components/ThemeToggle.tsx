"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-32 h-10 rounded-2xl bg-[var(--glass-bg)]" />;
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center p-1 space-x-1 rounded-2xl glass-panel border border-[var(--glass-border-subtle)] backdrop-blur-xl shadow-[var(--glass-shadow)]">
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative flex items-center justify-center w-10 h-8 rounded-xl text-sm font-medium transition-all duration-300 ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={label}
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active"
                className="absolute inset-0 bg-[var(--glass-bg-hover)] rounded-xl shadow-[var(--glass-shadow)] border border-[var(--glass-border-subtle)]"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <Icon className="relative z-10 w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
