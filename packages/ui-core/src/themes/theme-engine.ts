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
  administration: {
    primary: "#0F172A",
    secondary: "#64748B",
    accent: "#3B82F6",
    background: "#F8FAFC",
    foreground: "#020617",
    fontFamily: "sans",
    visualEffects: "minimal",
  },
  it: {
    primary: "#00FF41",
    secondary: "#003B00",
    accent: "#008F11",
    background: "#0D0208",
    foreground: "#00FF41",
    fontFamily: "mono",
    visualEffects: "sci-fi",
  },
  production: {
    primary: "#D97706",
    secondary: "#451A03",
    accent: "#F59E0B",
    background: "#FFFBEB",
    foreground: "#78350F",
    fontFamily: "sans",
    visualEffects: "industrial",
  },
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
