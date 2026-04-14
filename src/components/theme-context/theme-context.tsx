"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

export const THEMES: Theme[] = [
  { id: "orange", name: "Sunset Orange", primary: "#f97316", secondary: "#ea580c", accent: "#fbbf24", description: "Warm and energetic" },
  { id: "blue", name: "Ocean Blue", primary: "#3b82f6", secondary: "#2563eb", accent: "#06b6d4", description: "Cool and professional" },
  { id: "green", name: "Forest Green", primary: "#22c55e", secondary: "#16a34a", accent: "#84cc16", description: "Natural and fresh" },
  { id: "purple", name: "Royal Purple", primary: "#a855f7", secondary: "#9333ea", accent: "#ec4899", description: "Elegant and bold" },
  { id: "rose", name: "Rose Pink", primary: "#f43f5e", secondary: "#e11d48", accent: "#fb7185", description: "Romantic and soft" },
  { id: "cyan", name: "Teal Cyan", primary: "#06b6d4", secondary: "#0891b2", accent: "#22d3ee", description: "Modern and clean" },
  { id: "amber", name: "Golden Amber", primary: "#d97706", secondary: "#b45309", accent: "#f59e0b", description: "Rich and warm" },
  { id: "slate", name: "Slate Gray", primary: "#64748b", secondary: "#475569", accent: "#94a3b8", description: "Neutral and subtle" },
  { id: "emerald", name: "Jewel Emerald", primary: "#10b981", secondary: "#059669", accent: "#34d399", description: "Luxurious and deep" },
  { id: "violet", name: "Deep Violet", primary: "#8b5cf6", secondary: "#7c3aed", accent: "#a78bfa", description: "Creative and mysterious" },
  { id: "red", name: "Crimson Red", primary: "#dc2626", secondary: "#b91c1c", accent: "#f87171", description: "Bold and passionate" },
  { id: "indigo", name: "Indigo", primary: "#6366f1", secondary: "#4f46e5", accent: "#818cf8", description: "Classic and refined" },
  { id: "lime", name: "Lime Green", primary: "#84cc16", secondary: "#65a30d", accent: "#a3e635", description: "Fresh and vibrant" },
  { id: "fuchsia", name: "Fuchsia", primary: "#d946ef", secondary: "#c026d3", accent: "#e879f9", description: "Playful and fun" },
  { id: "sky", name: "Sky Blue", primary: "#0ea5e9", secondary: "#0284c7", accent: "#38bdf8", description: "Light and airy" },
  { id: "stone", name: "Stone", primary: "#78716c", secondary: "#57534e", accent: "#a8a29e", description: "Earthy and grounded" },
  { id: "zinc", name: "Zinc", primary: "#71717a", secondary: "#52525b", accent: "#a1a1aa", description: "Sleek and modern" },
  { id: "neutral", name: "Neutral", primary: "#737373", secondary: "#525252", accent: "#a3a3a3", description: "Balanced and calm" },
  { id: "orange-red", name: "Flame", primary: "#f97316", secondary: "#ea580c", accent: "#fb923c", description: "Hot and intense" },
  { id: "blue-teal", name: "Sapphire", primary: "#0ea5e9", secondary: "#0284c7", accent: "#22d3ee", description: "Ocean gemstone" },
  { id: "pink-rose", name: "Blush", primary: "#f472b6", secondary: "#ec4899", accent: "#f9a8d4", description: "Delicate and soft" },
  { id: "yellow-lime", name: "Citrus", primary: "#eab308", secondary: "#ca8a04", accent: "#bef264", description: "Zesty and bright" },
  { id: "teal-green", name: "Seafoam", primary: "#14b8a6", secondary: "#0d9488", accent: "#5eead4", description: "Calm water" },
  { id: "blue-indigo", name: "Twilight", primary: "#4f46e5", secondary: "#4338ca", accent: "#818cf8", description: "Night sky" },
  { id: "emerald-teal", name: "Mint", primary: "#2dd4bf", secondary: "#14b8a6", accent: "#6ee7b7", description: "Refreshing" },
  { id: "rose-red", name: "Cherry", primary: "#e11d48", secondary: "#be123c", accent: "#fb7185", description: "Sweet and bold" },
  { id: "purple-pink", name: "Sunset", primary: "#c026d3", secondary: "#a21caf", accent: "#e879f9", description: "Dusk colors" },
  { id: "brown", name: "Espresso", primary: "#92400e", secondary: "#78350f", accent: "#d97706", description: "Rich coffee" },
  { id: "cream", name: "Vanilla", primary: "#fcd34d", secondary: "#fbbf24", accent: "#fef3c7", description: "Smooth and sweet" },
  { id: "maroon", name: "Burgundy", primary: "#7f1d1d", secondary: "#991b1b", accent: "#dc2626", description: "Wine dark" },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const defaultTheme = THEMES[0];

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  themes: THEMES,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState(defaultTheme.id);
  const theme = THEMES.find(t => t.id === themeId) || defaultTheme;

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}