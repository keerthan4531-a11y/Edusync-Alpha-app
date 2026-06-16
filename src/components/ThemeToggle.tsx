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
    return <div className="w-32 h-10 rounded-full bg-white/10" />;
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center p-1 space-x-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl">
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative flex items-center justify-center w-10 h-8 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "text-black dark:text-white"
                : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
            }`}
            aria-label={label}
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active"
                className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm"
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
