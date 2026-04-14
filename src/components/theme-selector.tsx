"use client";

import { useState, useEffect, useRef } from "react";
import { Palette, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgFrom: string;
  bgTo: string;
}

const THEMES: Theme[] = [
  // Rainbow Colors
  { id: "red", name: "Red", primary: "#ef4444", secondary: "#dc2626", accent: "#fca5a5", bgFrom: "from-red-500", bgTo: "to-orange-500" },
  { id: "orange", name: "Orange", primary: "#f97316", secondary: "#ea580c", accent: "#fdba74", bgFrom: "from-orange-500", bgTo: "to-amber-500" },
  { id: "yellow", name: "Yellow", primary: "#eab308", secondary: "#ca8a04", accent: "#fde047", bgFrom: "from-yellow-500", bgTo: "to-lime-500" },
  { id: "lime", name: "Lime", primary: "#84cc16", secondary: "#65a30d", accent: "#bef264", bgFrom: "from-lime-500", bgTo: "to-green-500" },
  { id: "green", name: "Green", primary: "#22c55e", secondary: "#16a34a", accent: "#86efac", bgFrom: "from-green-500", bgTo: "to-emerald-500" },
  { id: "emerald", name: "Emerald", primary: "#10b981", secondary: "#059669", accent: "#6ee7b7", bgFrom: "from-emerald-500", bgTo: "to-teal-500" },
  { id: "teal", name: "Teal", primary: "#14b8a6", secondary: "#0d9488", accent: "#5eead4", bgFrom: "from-teal-500", bgTo: "to-cyan-500" },
  { id: "cyan", name: "Cyan", primary: "#06b6d4", secondary: "#0891b2", accent: "#67e8f9", bgFrom: "from-cyan-500", bgTo: "to-sky-500" },
  { id: "sky", name: "Sky", primary: "#0ea5e9", secondary: "#0284c7", accent: "#7dd3fc", bgFrom: "from-sky-500", bgTo: "to-blue-500" },
  { id: "blue", name: "Blue", primary: "#3b82f6", secondary: "#2563eb", accent: "#93c5fd", bgFrom: "from-blue-500", bgTo: "to-indigo-500" },
  { id: "indigo", name: "Indigo", primary: "#6366f1", secondary: "#4f46e5", accent: "#a5b4fc", bgFrom: "from-indigo-500", bgTo: "to-violet-500" },
  { id: "violet", name: "Violet", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#c4b5fd", bgFrom: "from-violet-500", bgTo: "to-purple-500" },
  { id: "purple", name: "Purple", primary: "#a855f7", secondary: "#9333ea", accent: "#d8b4fe", bgFrom: "from-purple-500", bgTo: "to-fuchsia-500" },
  { id: "fuchsia", name: "Fuchsia", primary: "#d946ef", secondary: "#c026d3", accent: "#f0abfc", bgFrom: "from-fuchsia-500", bgTo: "to-pink-500" },
  { id: "pink", name: "Pink", primary: "#ec4899", secondary: "#db2777", accent: "#f9a8d4", bgFrom: "from-pink-500", bgTo: "to-rose-500" },
  { id: "rose", name: "Rose", primary: "#f43f5e", secondary: "#e11d48", accent: "#fda4af", bgFrom: "from-rose-500", bgTo: "to-red-500" },
  // Additional popular colors
  { id: "slate", name: "Slate", primary: "#64748b", secondary: "#475569", accent: "#cbd5e1", bgFrom: "from-slate-600", bgTo: "to-zinc-500" },
  { id: "stone", name: "Stone", primary: "#78716c", secondary: "#57534e", accent: "#d6d3d1", bgFrom: "from-stone-600", bgTo: "to-stone-400" },
  { id: "neutral", name: "Neutral", primary: "#737373", secondary: "#525252", accent: "#d4d4d4", bgFrom: "from-neutral-600", bgTo: "to-neutral-400" },
  { id: "gray", name: "Gray", primary: "#6b7280", secondary: "#4b5563", accent: "#d1d5db", bgFrom: "from-gray-600", bgTo: "to-gray-400" },
  { id: "zinc", name: "Zinc", primary: "#71717a", secondary: "#52525b", accent: "#e4e4e7", bgFrom: "from-zinc-600", bgTo: "to-zinc-400" },
  // Rainbow gradients (multi-color)
  { id: "rainbow", name: "Rainbow", primary: "#ff0000", secondary: "#0000ff", accent: "#ffff00", bgFrom: "from-red-500", bgTo: "to-blue-500" },
  { id: "sunset", name: "Sunset", primary: "#ff6b35", secondary: "#f7c59f", accent: "#efefd0", bgFrom: "from-orange-500", bgTo: "to-yellow-200" },
  { id: "ocean", name: "Ocean", primary: "#0077b6", secondary: "#00b4d8", accent: "#90e0ef", bgFrom: "from-blue-600", bgTo: "to-cyan-400" },
  { id: "aurora", name: "Aurora", primary: "#7c3aed", secondary: "#06b6d4", accent: "#34d399", bgFrom: "from-violet-600", bgTo: "to-cyan-500" },
  { id: "dusk", name: "Dusk", primary: "#c026d3", secondary: "#6366f1", accent: "#f472b6", bgFrom: "from-fuchsia-600", bgTo: "to-indigo-500" },
  { id: "flame", name: "Flame", primary: "#dc2626", secondary: "#f97316", accent: "#fbbf24", bgFrom: "from-red-600", bgTo: "to-yellow-500" },
  { id: "midnight", name: "Midnight", primary: "#312e81", secondary: "#4338ca", accent: "#818cf8", bgFrom: "from-indigo-900", bgTo: "to-violet-700" },
  { id: "copper", name: "Copper", primary: "#b45309", secondary: "#d97706", accent: "#fbbf24", bgFrom: "from-amber-700", bgTo: "to-yellow-500" },
  { id: "neon", name: "Neon", primary: "#39ff14", secondary: "#ff00ff", accent: "#00ffff", bgFrom: "from-green-500", bgTo: "to-fuchsia-500" },
  { id: "royal", name: "Royal", primary: "#b91c1c", secondary: "#fbbf24", accent: "#fb923c", bgFrom: "from-red-700", bgTo: "to-amber-400" },
];

const THEME_STORAGE_KEY = "itmanager_theme";
const THEME_MODE_KEY = "itmanager_theme_mode";
const RANDOM_INTERVAL = 30000; // 30 seconds

export function ThemeSelector() {
  // Initialize state from localStorage to avoid setState in effect
  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
  const savedMode = localStorage.getItem(THEME_MODE_KEY);
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    if (savedThemeId && savedMode === "manual") {
      const theme = THEMES.find(t => t.id === savedThemeId);
      if (theme) return theme;
    }
    // Default to first theme or random
    return THEMES[0];
  });
  const [isRandom, setIsRandom] = useState(() => savedMode === "random" || true);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Apply theme function - must be defined before use
  const applyTheme = (theme: Theme) => {
    // Apply CSS variables for theme colors
    document.documentElement.style.setProperty("--theme-primary", theme.primary);
    document.documentElement.style.setProperty("--theme-secondary", theme.secondary);
    document.documentElement.style.setProperty("--theme-accent", theme.accent);

    // Get body element
    const body = document.body;
    
    // Remove all theme bg classes
    body.classList.remove(
      "from-red-500", "to-orange-500",
      "from-orange-500", "to-amber-500",
      "from-yellow-500", "to-lime-500",
      "from-lime-500", "to-green-500",
      "from-green-500", "to-emerald-500",
      "from-emerald-500", "to-teal-500",
      "from-teal-500", "to-cyan-500",
      "from-cyan-500", "to-sky-500",
      "from-sky-500", "to-blue-500",
      "from-blue-500", "to-indigo-500",
      "from-indigo-500", "to-violet-500",
      "from-purple-500", "to-fuchsia-500",
      "from-fuchsia-500", "to-pink-500",
      "from-pink-500", "to-rose-500",
      "from-slate-600", "to-zinc-500",
      "from-stone-600", "to-stone-400",
      "from-neutral-600", "to-neutral-400",
      "from-gray-600", "to-gray-400",
      "from-zinc-600", "to-zinc-400",
      "from-red-500", "to-blue-500",
      "from-orange-500", "to-yellow-200",
      "from-blue-600", "to-cyan-400",
      "from-violet-600", "to-cyan-500",
      "from-fuchsia-600", "to-indigo-500",
      "from-red-600", "to-yellow-500",
      "from-indigo-900", "to-violet-700",
      "from-amber-700", "to-yellow-500",
      "from-green-500", "to-fuchsia-500",
      "from-red-700", "to-amber-400"
    );
    
    // Add current theme bg classes
    body.classList.add(theme.bgFrom, theme.bgTo);
  };

  // Main effect - only run applyTheme and set mounted
  useEffect(() => {
    console.log("ThemeSelector: Initializing...");
    
    // Apply theme based on current state
    applyTheme(currentTheme);
    setMounted(true);
    
    // Log what we did
    if (savedThemeId && savedMode === "manual") {
      const theme = THEMES.find(t => t.id === savedThemeId);
      if (theme) {
        console.log("ThemeSelector: Loaded saved theme", theme.name);
        return;
      }
    }
    
    console.log("ThemeSelector: Applied default/random theme", currentTheme.name);
  }, [currentTheme, savedMode, savedThemeId]); // Re-run if theme or mode changes from localStorage

  // Apply theme function - must be defined before use
  const applyTheme = (theme: Theme) => {
    // Apply CSS variables for theme colors
    document.documentElement.style.setProperty("--theme-primary", theme.primary);
    document.documentElement.style.setProperty("--theme-secondary", theme.secondary);
    document.documentElement.style.setProperty("--theme-accent", theme.accent);

    // Get body element
    const body = document.body;
    
    // Remove all theme bg classes
    body.classList.remove(
      "from-red-500", "to-orange-500",
      "from-orange-500", "to-amber-500",
      "from-yellow-500", "to-lime-500",
      "from-lime-500", "to-green-500",
      "from-green-500", "to-emerald-500",
      "from-emerald-500", "to-teal-500",
      "from-teal-500", "to-cyan-500",
      "from-cyan-500", "to-sky-500",
      "from-sky-500", "to-blue-500",
      "from-blue-500", "to-indigo-500",
      "from-indigo-500", "to-violet-500",
      "from-violet-500", "to-purple-500",
      "from-purple-500", "to-fuchsia-500",
      "from-fuchsia-500", "to-pink-500",
      "from-pink-500", "to-rose-500",
      "from-slate-600", "to-zinc-500",
      "from-stone-600", "to-stone-400",
      "from-neutral-600", "to-neutral-400",
      "from-gray-600", "to-gray-400",
      "from-zinc-600", "to-zinc-400",
      "from-red-500", "to-blue-500",
      "from-orange-500", "to-yellow-200",
      "from-blue-600", "to-cyan-400",
      "from-violet-600", "to-cyan-500",
      "from-fuchsia-600", "to-indigo-500",
      "from-red-600", "to-yellow-500",
      "from-indigo-900", "to-violet-700",
      "from-amber-700", "to-yellow-500",
      "from-green-500", "to-fuchsia-500",
      "from-red-700", "to-amber-400"
    );
    
    // Add current theme bg classes
    body.classList.add(theme.bgFrom, theme.bgTo);
  };

  // Main effect
  useEffect(() => {
    console.log("ThemeSelector: Initializing...");
    
    // Check for saved theme preference
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    const savedMode = localStorage.getItem(THEME_MODE_KEY);
    
    if (savedThemeId && savedMode === "manual") {
      const theme = THEMES.find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
        setIsRandom(false);
        applyTheme(theme);
        setMounted(true);
        console.log("ThemeSelector: Loaded saved theme", theme.name);
        return;
      }
    }
    
    // Random mode - pick random theme
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    setCurrentTheme(randomTheme);
    applyTheme(randomTheme);
    setMounted(true);
    console.log("ThemeSelector: Applied random theme", randomTheme.name);
  }, []);

  // Handle random mode interval
  useEffect(() => {
    console.log("ThemeSelector: isRandom changed to", isRandom);
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // If random mode, set up new interval
    if (isRandom) {
      intervalRef.current = setInterval(() => {
        const newTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
        setCurrentTheme(newTheme);
        applyTheme(newTheme);
        console.log("ThemeSelector: Auto-rotated to", newTheme.name);
      }, RANDOM_INTERVAL);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRandom]);

  const selectTheme = (theme: Theme) => {
    setIsRandom(false);
    setCurrentTheme(theme);
    applyTheme(theme);
    
    // Save preference
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
    localStorage.setItem(THEME_MODE_KEY, "manual");
    
    setIsOpen(false);
    console.log("ThemeSelector: Selected theme", theme.name);
  };

  const enableRandomMode = () => {
    setIsRandom(true);
    localStorage.setItem(THEME_MODE_KEY, "random");
    
    // Immediately switch to a random theme
    const newTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
    console.log("ThemeSelector: Enabled random mode");
  };

  // Don't render anything until mounted to avoid hydration mismatch
  // But we need to render the button - use a placeholder that shows after mount
  if (!mounted) {
    return (
      <Button
        style={{ zIndex: 99999 }}
        className={cn(
          "fixed top-4 right-4 h-10 px-4 rounded-full",
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium",
          "hover:from-violet-700 hover:to-indigo-700 shadow-lg",
          "flex items-center gap-2"
        )}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  return (
    <>
      {/* Theme Button */}
      <Button
        onClick={() => {
          console.log("ThemeSelector: Toggle dropdown, isOpen:", !isOpen);
          setIsOpen(!isOpen);
        }}
        style={{ zIndex: 99999 }}
        className={cn(
          "fixed top-4 right-4 h-10 px-4 rounded-full",
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium",
          "hover:from-violet-700 hover:to-indigo-700 shadow-lg",
          "flex items-center gap-2"
        )}
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme.name}</span>
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: currentTheme.primary }}
        />
      </Button>

      {/* Theme Selector Dropdown */}
      {isOpen && (
        <div className="fixed top-16 right-4 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4" style={{ zIndex: 99999 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Choose Theme</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Current Theme Status */}
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Current: {currentTheme.name}</p>
                <p className="text-slate-400 text-xs">
                  {isRandom ? "Auto-rotating every 30s" : "Fixed until you change"}
                </p>
              </div>
              <div className="flex -space-x-2">
                {[currentTheme.primary, currentTheme.secondary, currentTheme.accent].map((color, i) => (
                  <div 
                    key={i} 
                    className="w-6 h-6 rounded-full border-2 border-slate-900" 
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enable Random Button */}
          {isRandom && (
            <Button
              onClick={enableRandomMode}
              variant="outline"
              className="w-full mb-4 border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              🎲 Random Mode Active
            </Button>
          )}

          {/* Theme Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme)}
                className={cn(
                  "relative w-10 h-10 rounded-full transition-transform hover:scale-110",
                  theme.bgFrom,
                  theme.bgTo,
                  currentTheme.id === theme.id && "ring-2 ring-white ring-offset-2 ring-offset-slate-900"
                )}
                title={theme.name}
              >
                {currentTheme.id === theme.id && (
                  <Check className="absolute inset-0 m-auto w-4 h-4 text-white" />
                )}
              </button>
            ))}
          </div>

          {/* Theme Names */}
          <div className="mt-3 flex flex-wrap gap-1">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme)}
                className={cn(
                  "text-xs px-2 py-1 rounded-full transition-colors",
                  currentTheme.id === theme.id
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}
              >
                {theme.name}
              </button>
            ))}
          </div>

          {/* Disable Random */}
          {!isRandom && (
            <Button
              onClick={enableRandomMode}
              variant="ghost"
              className="w-full mt-3 text-slate-400 hover:text-white text-xs"
            >
              🎲 Enable Auto-Change
            </Button>
          )}
        </div>
      )}
    </>
  );
}