'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the current state from the <html> class (already set by the inline script)
    const dark = document.documentElement.classList.contains('dark');
    setIsDark(dark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);

    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Avoid hydration mismatch — render a placeholder until mounted
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        relative flex items-center justify-center
        w-9 h-9 rounded-full
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-800 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
        overflow-hidden
      "
    >
      {/* Sun icon */}
      <span
        className={`
          absolute transition-all duration-300
          ${
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
          }
        `}
      >
        <Moon size={16} />
      </span>

      {/* Moon icon */}
      <span
        className={`
          absolute transition-all duration-300
          ${
            !isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-75'
          }
        `}
      >
        <Sun size={16} />
      </span>
    </button>
  );
}
