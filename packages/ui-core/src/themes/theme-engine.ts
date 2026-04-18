import { EXTENDED_DEPARTMENT_THEMES } from "./extended-themes";

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  fontFamily: "sans" | "mono" | "serif";
  visualEffects: "minimal" | "sci-fi" | "industrial" | "glassmorphism";
}

export const DEPARTMENT_THEMES: Record<string, ThemeConfig> = {
  ...EXTENDED_DEPARTMENT_THEMES,
  default: {
    primary: "#2563EB",
    secondary: "#64748B",
    accent: "#3B82F6",
    background: "#FFFFFF",
    foreground: "#0F172A",
    fontFamily: "sans",
    visualEffects: "minimal",
  },
};

export const getTheme = (dept: string): ThemeConfig => {
  return DEPARTMENT_THEMES[dept] || DEPARTMENT_THEMES.default;
};
