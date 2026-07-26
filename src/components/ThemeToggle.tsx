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
    return <div className="w-32 h-10 rounded-full neu-flat dark:bg-white/10" />;
  }

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  return (
    <div className="flex items-center p-1 space-x-1 rounded-full neu-inset-sm dark:bg-white/5 dark:border dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
      {options.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`relative flex items-center justify-center w-10 h-8 rounded-full text-sm font-medium transition-colors ${
              isActive
                ? "text-foreground dark:text-white"
                : "text-muted-foreground hover:text-foreground dark:hover:text-white"
            }`}
            aria-label={label}
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-active"
                className="absolute inset-0 rounded-full neu-raised-sm dark:bg-white/10 dark:shadow-none"
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
