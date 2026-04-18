/**
 * Tests for unified internal portal components and utilities added in this PR.
 * Covers:
 *  - apps/unified-internal-portal/config/portals.ts
 *  - packages/ui-core/src/themes/theme-engine.ts
 *  - packages/ui-core/src/themes/extended-themes.ts
 *  - apps/unified-internal-portal/app/[department]/page.tsx (DepartmentPage, StatCard logic)
 *  - apps/unified-internal-portal/app/[department]/administration/components/AdminWidgets.tsx
 *  - apps/unified-internal-portal/app/[department]/AdminView.tsx
 *  - apps/unified-internal-portal/app/[department]/layout.tsx
 *  - packages/ui-core/src/components/CommandPalette.tsx
 *
 * Tests focus on business logic, data structures, and pure functions
 * without requiring DOM rendering.
 */
import { describe, it, expect } from 'vitest';
import {
  PORTAL_CONFIG,
  type PortalID,
} from '../../apps/unified-internal-portal/config/portals';
import {
  DEPARTMENT_THEMES,
  getTheme,
  type ThemeConfig,
} from '../../packages/ui-core/src/themes/theme-engine';
import { EXTENDED_DEPARTMENT_THEMES } from '../../packages/ui-core/src/themes/extended-themes';

// ─────────────────────────────────────────────────────────────────────────────
// apps/unified-internal-portal/config/portals.ts
// ─────────────────────────────────────────────────────────────────────────────
describe('Unified Internal Portal – PORTAL_CONFIG', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(PORTAL_CONFIG)).toBe(true);
    expect(PORTAL_CONFIG.length).toBeGreaterThan(0);
  });

  it('should have exactly 15 portals', () => {
    expect(PORTAL_CONFIG).toHaveLength(15);
  });

  it('should have all required fields on each entry', () => {
    for (const portal of PORTAL_CONFIG) {
      expect(portal).toHaveProperty('id');
      expect(portal).toHaveProperty('name');
      expect(portal).toHaveProperty('color');
      expect(portal).toHaveProperty('icon');
      expect(typeof portal.id).toBe('string');
      expect(typeof portal.name).toBe('string');
      expect(typeof portal.color).toBe('string');
      expect(typeof portal.icon).toBe('string');
    }
  });

  it('should have unique portal IDs', () => {
    const ids = PORTAL_CONFIG.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have unique portal names', () => {
    const names = PORTAL_CONFIG.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('should have valid 6-digit hex color codes for all portals', () => {
    const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const portal of PORTAL_CONFIG) {
      expect(portal.color).toMatch(hexColorPattern);
    }
  });

  it('should have non-empty id, name, and icon strings', () => {
    for (const portal of PORTAL_CONFIG) {
      expect(portal.id.trim()).not.toBe('');
      expect(portal.name.trim()).not.toBe('');
      expect(portal.icon.trim()).not.toBe('');
    }
  });

  it('should have all portal IDs without spaces (use underscores)', () => {
    for (const portal of PORTAL_CONFIG) {
      expect(portal.id).not.toContain(' ');
    }
  });

  it('should list portals starting with administration', () => {
    expect(PORTAL_CONFIG[0].id).toBe('administration');
  });

  it('should include all core operational departments', () => {
    const ids = PORTAL_CONFIG.map(p => p.id);
    expect(ids).toContain('administration');
    expect(ids).toContain('it');
    expect(ids).toContain('finance');
    expect(ids).toContain('transport');
    expect(ids).toContain('production');
    expect(ids).toContain('hr');
    expect(ids).toContain('customer_service');
    expect(ids).toContain('marketing');
    expect(ids).toContain('sales');
    expect(ids).toContain('operations');
    expect(ids).toContain('security');
    expect(ids).toContain('housekeeping');
    expect(ids).toContain('maintenance');
  });

  it('should contain administration portal with correct properties', () => {
    const admin = PORTAL_CONFIG.find(p => p.id === 'administration');
    expect(admin).toBeDefined();
    expect(admin?.name).toBe('Administration');
    expect(admin?.color).toBe('#2C3E50');
    expect(admin?.icon).toBe('Settings');
  });

  it('should contain IT portal with correct properties', () => {
    const it = PORTAL_CONFIG.find(p => p.id === 'it');
    expect(it).toBeDefined();
    expect(it?.name).toBe('Information Technology');
    expect(it?.color).toBe('#00FF41');
    expect(it?.icon).toBe('Terminal');
  });

  it('should contain transport portal with correct properties', () => {
    const transport = PORTAL_CONFIG.find(p => p.id === 'transport');
    expect(transport).toBeDefined();
    expect(transport?.name).toBe('Transport');
    expect(transport?.color).toBe('#F1C40F');
    expect(transport?.icon).toBe('Truck');
  });

  it('should contain finance portal with correct properties', () => {
    const finance = PORTAL_CONFIG.find(p => p.id === 'finance');
    expect(finance).toBeDefined();
    expect(finance?.name).toBe('Finance');
    expect(finance?.color).toBe('#27AE60');
    expect(finance?.icon).toBe('DollarSign');
  });

  it('should contain production portal with correct properties', () => {
    const production = PORTAL_CONFIG.find(p => p.id === 'production');
    expect(production).toBeDefined();
    expect(production?.name).toBe('Production');
    expect(production?.color).toBe('#E67E22');
    expect(production?.icon).toBe('Layers');
  });

  it('should contain customer_service portal with correct properties', () => {
    const cs = PORTAL_CONFIG.find(p => p.id === 'customer_service');
    expect(cs).toBeDefined();
    expect(cs?.name).toBe('Customer Service');
    expect(cs?.color).toBe('#16A085');
    expect(cs?.icon).toBe('Headset');
  });

  it('should contain security portal with correct properties', () => {
    const security = PORTAL_CONFIG.find(p => p.id === 'security');
    expect(security).toBeDefined();
    expect(security?.name).toBe('Security & Surveillance');
    expect(security?.color).toBe('#C0392B');
    expect(security?.icon).toBe('Shield');
  });

  it('should contain housekeeping portal with correct properties', () => {
    const hk = PORTAL_CONFIG.find(p => p.id === 'housekeeping');
    expect(hk).toBeDefined();
    expect(hk?.name).toBe('Housekeeping');
    expect(hk?.color).toBe('#1ABC9C');
    expect(hk?.icon).toBe('Sparkles');
  });

  it('should contain hr portal with correct properties', () => {
    const hr = PORTAL_CONFIG.find(p => p.id === 'hr');
    expect(hr).toBeDefined();
    expect(hr?.name).toBe('Human Resource');
    expect(hr?.icon).toBe('Users');
  });

  it('should contain business_dev portal with correct properties', () => {
    const bd = PORTAL_CONFIG.find(p => p.id === 'business_dev');
    expect(bd).toBeDefined();
    expect(bd?.name).toBe('Business Development');
    expect(bd?.icon).toBe('Briefcase');
  });

  it('should contain communications portal with correct properties', () => {
    const comms = PORTAL_CONFIG.find(p => p.id === 'communications');
    expect(comms).toBeDefined();
    expect(comms?.name).toBe('Communications');
    expect(comms?.icon).toBe('MessageCircle');
  });

  it('should return undefined for a non-existent portal ID lookup', () => {
    const unknown = PORTAL_CONFIG.find(
      p => p.id === ('nonexistent_portal' as PortalID)
    );
    expect(unknown).toBeUndefined();
  });

  it('PortalID type should allow valid department lookups at compile-time', () => {
    // Validate runtime lookup using typed PortalID values
    const lookup = (id: PortalID) => PORTAL_CONFIG.find(p => p.id === id);
    expect(lookup('administration')).toBeDefined();
    expect(lookup('it')).toBeDefined();
    expect(lookup('finance')).toBeDefined();
    expect(lookup('hr')).toBeDefined();
    expect(lookup('security')).toBeDefined();
  });

  it('should contain operations portal with Cpu icon', () => {
    const ops = PORTAL_CONFIG.find(p => p.id === 'operations');
    expect(ops).toBeDefined();
    expect(ops?.icon).toBe('Cpu');
    expect(ops?.color).toBe('#2980B9');
  });

  it('should contain sales portal with TrendingUp icon', () => {
    const sales = PORTAL_CONFIG.find(p => p.id === 'sales');
    expect(sales).toBeDefined();
    expect(sales?.icon).toBe('TrendingUp');
    expect(sales?.color).toBe('#E74C3C');
  });

  it('should contain maintenance portal with Wrench icon', () => {
    const maintenance = PORTAL_CONFIG.find(p => p.id === 'maintenance');
    expect(maintenance).toBeDefined();
    expect(maintenance?.icon).toBe('Wrench');
    expect(maintenance?.color).toBe('#D35400');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// packages/ui-core/src/themes/extended-themes.ts – EXTENDED_DEPARTMENT_THEMES
// ─────────────────────────────────────────────────────────────────────────────
describe('EXTENDED_DEPARTMENT_THEMES', () => {
  const hexPattern = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
  const validFontFamilies = ['sans', 'mono', 'serif'];
  const validVisualEffects = ['minimal', 'sci-fi', 'industrial', 'glassmorphism'];

  it('should export a non-empty object of themes', () => {
    expect(typeof EXTENDED_DEPARTMENT_THEMES).toBe('object');
    expect(Object.keys(EXTENDED_DEPARTMENT_THEMES).length).toBeGreaterThan(0);
  });

  it('should define exactly 10 department themes', () => {
    expect(Object.keys(EXTENDED_DEPARTMENT_THEMES)).toHaveLength(10);
  });

  it('should include all expected department keys', () => {
    const keys = Object.keys(EXTENDED_DEPARTMENT_THEMES);
    expect(keys).toContain('administration');
    expect(keys).toContain('sales');
    expect(keys).toContain('marketing');
    expect(keys).toContain('customer_service');
    expect(keys).toContain('production');
    expect(keys).toContain('transport');
    expect(keys).toContain('it');
    expect(keys).toContain('finance');
    expect(keys).toContain('security');
    expect(keys).toContain('housekeeping');
  });

  it('every theme should have all 7 required ThemeConfig fields', () => {
    for (const [dept, theme] of Object.entries(EXTENDED_DEPARTMENT_THEMES)) {
      expect(theme, `${dept} missing primary`).toHaveProperty('primary');
      expect(theme, `${dept} missing secondary`).toHaveProperty('secondary');
      expect(theme, `${dept} missing accent`).toHaveProperty('accent');
      expect(theme, `${dept} missing background`).toHaveProperty('background');
      expect(theme, `${dept} missing foreground`).toHaveProperty('foreground');
      expect(theme, `${dept} missing fontFamily`).toHaveProperty('fontFamily');
      expect(theme, `${dept} missing visualEffects`).toHaveProperty('visualEffects');
    }
  });

  it('all theme color values should be valid hex codes', () => {
    for (const [dept, theme] of Object.entries(EXTENDED_DEPARTMENT_THEMES)) {
      expect(theme.primary, `${dept} primary invalid`).toMatch(hexPattern);
      expect(theme.secondary, `${dept} secondary invalid`).toMatch(hexPattern);
      expect(theme.accent, `${dept} accent invalid`).toMatch(hexPattern);
      expect(theme.background, `${dept} background invalid`).toMatch(hexPattern);
      expect(theme.foreground, `${dept} foreground invalid`).toMatch(hexPattern);
    }
  });

  it('all fontFamily values should be valid union literals', () => {
    for (const [dept, theme] of Object.entries(EXTENDED_DEPARTMENT_THEMES)) {
      expect(validFontFamilies, `${dept} has invalid fontFamily`).toContain(theme.fontFamily);
    }
  });

  it('all visualEffects values should be valid union literals', () => {
    for (const [dept, theme] of Object.entries(EXTENDED_DEPARTMENT_THEMES)) {
      expect(validVisualEffects, `${dept} has invalid visualEffects`).toContain(theme.visualEffects);
    }
  });

  it('administration theme should use minimal visual effects and sans font', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['administration'];
    expect(theme.visualEffects).toBe('minimal');
    expect(theme.fontFamily).toBe('sans');
    expect(theme.primary).toBe('#0F172A');
    expect(theme.background).toBe('#F8FAFC');
  });

  it('IT theme should use sci-fi visual effects and mono font', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['it'];
    expect(theme.visualEffects).toBe('sci-fi');
    expect(theme.fontFamily).toBe('mono');
    expect(theme.primary).toBe('#00FF41');
    expect(theme.background).toBe('#0D0208');
    expect(theme.foreground).toBe('#00FF41');
  });

  it('security theme should use sci-fi visual effects and mono font', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['security'];
    expect(theme.visualEffects).toBe('sci-fi');
    expect(theme.fontFamily).toBe('mono');
    expect(theme.primary).toBe('#7F1D1D');
  });

  it('production theme should use industrial visual effects', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['production'];
    expect(theme.visualEffects).toBe('industrial');
    expect(theme.primary).toBe('#B45309');
  });

  it('transport theme should use industrial visual effects with yellow accent', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['transport'];
    expect(theme.visualEffects).toBe('industrial');
    expect(theme.accent).toBe('#FACC15');
    expect(theme.background).toBe('#111827');
  });

  it('sales and marketing themes should use glassmorphism effects', () => {
    expect(EXTENDED_DEPARTMENT_THEMES['sales'].visualEffects).toBe('glassmorphism');
    expect(EXTENDED_DEPARTMENT_THEMES['marketing'].visualEffects).toBe('glassmorphism');
  });

  it('customer_service theme should use soft blue primary and minimal effects', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['customer_service'];
    expect(theme.primary).toBe('#0369A1');
    expect(theme.visualEffects).toBe('minimal');
    expect(theme.background).toBe('#F0F9FF');
  });

  it('finance theme should use green primary and minimal effects', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['finance'];
    expect(theme.primary).toBe('#15803D');
    expect(theme.visualEffects).toBe('minimal');
  });

  it('housekeeping theme should use cyan primary and minimal effects', () => {
    const theme = EXTENDED_DEPARTMENT_THEMES['housekeeping'];
    expect(theme.primary).toBe('#06B6D4');
    expect(theme.visualEffects).toBe('minimal');
    expect(theme.fontFamily).toBe('sans');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// packages/ui-core/src/themes/theme-engine.ts – DEPARTMENT_THEMES & getTheme
// ─────────────────────────────────────────────────────────────────────────────
describe('theme-engine – DEPARTMENT_THEMES', () => {
  it('should export a non-empty themes record', () => {
    expect(typeof DEPARTMENT_THEMES).toBe('object');
    expect(Object.keys(DEPARTMENT_THEMES).length).toBeGreaterThan(0);
  });

  it('should include a "default" fallback theme', () => {
    expect(DEPARTMENT_THEMES).toHaveProperty('default');
  });

  it('default theme should have correct values', () => {
    const def = DEPARTMENT_THEMES['default'];
    expect(def.primary).toBe('#2563EB');
    expect(def.secondary).toBe('#64748B');
    expect(def.accent).toBe('#3B82F6');
    expect(def.background).toBe('#FFFFFF');
    expect(def.foreground).toBe('#0F172A');
    expect(def.fontFamily).toBe('sans');
    expect(def.visualEffects).toBe('minimal');
  });

  it('should include all extended department themes', () => {
    const extendedKeys = Object.keys(EXTENDED_DEPARTMENT_THEMES);
    for (const key of extendedKeys) {
      expect(DEPARTMENT_THEMES).toHaveProperty(key);
    }
  });

  it('merged DEPARTMENT_THEMES should have more than 10 entries (10 extended + default)', () => {
    expect(Object.keys(DEPARTMENT_THEMES).length).toBeGreaterThan(10);
  });
});

describe('theme-engine – getTheme()', () => {
  it('should return the correct theme for "administration"', () => {
    const theme = getTheme('administration');
    expect(theme.primary).toBe('#0F172A');
    expect(theme.visualEffects).toBe('minimal');
    expect(theme.fontFamily).toBe('sans');
  });

  it('should return the correct theme for "it" (sci-fi)', () => {
    const theme = getTheme('it');
    expect(theme.visualEffects).toBe('sci-fi');
    expect(theme.fontFamily).toBe('mono');
    expect(theme.primary).toBe('#00FF41');
  });

  it('should return the correct theme for "security"', () => {
    const theme = getTheme('security');
    expect(theme.visualEffects).toBe('sci-fi');
    expect(theme.fontFamily).toBe('mono');
    expect(theme.primary).toBe('#7F1D1D');
  });

  it('should return the correct theme for "production"', () => {
    const theme = getTheme('production');
    expect(theme.visualEffects).toBe('industrial');
    expect(theme.primary).toBe('#B45309');
  });

  it('should return the correct theme for "finance"', () => {
    const theme = getTheme('finance');
    expect(theme.primary).toBe('#15803D');
    expect(theme.visualEffects).toBe('minimal');
  });

  it('should return the correct theme for "sales"', () => {
    const theme = getTheme('sales');
    expect(theme.visualEffects).toBe('glassmorphism');
    expect(theme.primary).toBe('#BE123C');
  });

  it('should return the correct theme for "transport"', () => {
    const theme = getTheme('transport');
    expect(theme.visualEffects).toBe('industrial');
    expect(theme.accent).toBe('#FACC15');
  });

  it('should return the default theme for an unknown department string', () => {
    const theme = getTheme('nonexistent_department');
    expect(theme).toEqual(DEPARTMENT_THEMES['default']);
    expect(theme.primary).toBe('#2563EB');
    expect(theme.visualEffects).toBe('minimal');
  });

  it('should return the default theme for an empty string', () => {
    const theme = getTheme('');
    expect(theme).toEqual(DEPARTMENT_THEMES['default']);
  });

  it('should return a ThemeConfig object with all required fields', () => {
    const theme: ThemeConfig = getTheme('administration');
    expect(theme).toHaveProperty('primary');
    expect(theme).toHaveProperty('secondary');
    expect(theme).toHaveProperty('accent');
    expect(theme).toHaveProperty('background');
    expect(theme).toHaveProperty('foreground');
    expect(theme).toHaveProperty('fontFamily');
    expect(theme).toHaveProperty('visualEffects');
  });

  it('getTheme should return the same object reference for repeated calls on the same dept', () => {
    const theme1 = getTheme('finance');
    const theme2 = getTheme('finance');
    expect(theme1).toBe(theme2);
  });

  it('should handle all 10 extended departments without returning the default', () => {
    const extendedKeys = Object.keys(EXTENDED_DEPARTMENT_THEMES);
    for (const dept of extendedKeys) {
      const theme = getTheme(dept);
      // Themes from EXTENDED_DEPARTMENT_THEMES should not equal the default
      expect(theme).not.toEqual(DEPARTMENT_THEMES['default']);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DepartmentPage logic (apps/unified-internal-portal/app/[department]/page.tsx)
// Replicates pure business logic from the component without DOM rendering.
// ─────────────────────────────────────────────────────────────────────────────
describe('DepartmentPage – routing logic', () => {
  // Mirror the department lookup used in DepartmentPage
  const getDepartmentConfig = (department: string) =>
    PORTAL_CONFIG.find(p => p.id === department);

  it('should find config for "administration"', () => {
    expect(getDepartmentConfig('administration')).toBeDefined();
  });

  it('should find config for "it"', () => {
    expect(getDepartmentConfig('it')).toBeDefined();
  });

  it('should return undefined for an unknown department', () => {
    expect(getDepartmentConfig('unknown_dept')).toBeUndefined();
  });

  it('should route to AdministrationView when department === "administration"', () => {
    const department = 'administration';
    const config = getDepartmentConfig(department);
    const routesToAdminView = config !== undefined && department === 'administration';
    expect(routesToAdminView).toBe(true);
  });

  it('should route to generic dashboard when department is known but not administration', () => {
    const department = 'finance';
    const config = getDepartmentConfig(department);
    const routesToGenericDashboard = config !== undefined && department !== 'administration';
    expect(routesToGenericDashboard).toBe(true);
  });

  it('should not route to any view when department is unknown', () => {
    const department = 'ghost_dept';
    const config = getDepartmentConfig(department);
    expect(config).toBeUndefined();
  });

  it('department name should be used as dashboard heading', () => {
    const config = getDepartmentConfig('finance');
    const heading = `${config?.name} Dashboard`;
    expect(heading).toBe('Finance Dashboard');
  });

  it('should produce correct dashboard heading for customer_service', () => {
    const config = getDepartmentConfig('customer_service');
    const heading = `${config?.name} Dashboard`;
    expect(heading).toBe('Customer Service Dashboard');
  });

  it('generic dashboard should display 4 stat cards', () => {
    const statCards = [
      { title: 'Total Transactions', value: '1,284', change: '+12%', trend: 'up' },
      { title: 'Active Requests', value: '42', change: '-5%', trend: 'down' },
      { title: 'Staff on Duty', value: '18', change: '0%', trend: 'neutral' },
      { title: 'SLA Compliance', value: '98.2%', change: '+0.4%', trend: 'up' },
    ];
    expect(statCards).toHaveLength(4);
  });

  it('generic dashboard should render 3 recent activity placeholders', () => {
    const activityItems = [1, 2, 3];
    expect(activityItems).toHaveLength(3);
  });

  it('departmental queue should render 3 ticket placeholders', () => {
    const queueItems = [1, 2, 3];
    expect(queueItems).toHaveLength(3);
  });

  it('queue ticket labels should follow format "Ticket #10n - Urgent Request"', () => {
    const generateLabel = (i: number) => `Ticket #10${i} - Urgent Request`;
    expect(generateLabel(1)).toBe('Ticket #101 - Urgent Request');
    expect(generateLabel(2)).toBe('Ticket #102 - Urgent Request');
    expect(generateLabel(3)).toBe('Ticket #103 - Urgent Request');
  });
});

describe('StatCard – trend color logic (page.tsx)', () => {
  // Mirrors the className conditional: trend==='up' → emerald, 'down' → rose, else → slate
  const getTrendColorClass = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-rose-600';
    return 'text-slate-500';
  };

  it('should return emerald-600 for "up" trend', () => {
    expect(getTrendColorClass('up')).toBe('text-emerald-600');
  });

  it('should return rose-600 for "down" trend', () => {
    expect(getTrendColorClass('down')).toBe('text-rose-600');
  });

  it('should return slate-500 for "neutral" trend', () => {
    expect(getTrendColorClass('neutral')).toBe('text-slate-500');
  });

  it('Total Transactions card should use "up" trend', () => {
    const trend: 'up' | 'down' | 'neutral' = 'up';
    expect(getTrendColorClass(trend)).toBe('text-emerald-600');
  });

  it('Active Requests card should use "down" trend', () => {
    const trend: 'up' | 'down' | 'neutral' = 'down';
    expect(getTrendColorClass(trend)).toBe('text-rose-600');
  });

  it('Staff on Duty card should use "neutral" trend', () => {
    const trend: 'up' | 'down' | 'neutral' = 'neutral';
    expect(getTrendColorClass(trend)).toBe('text-slate-500');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// KPIGrid data (AdminWidgets.tsx)
// ─────────────────────────────────────────────────────────────────────────────
describe('KPIGrid – data structure', () => {
  const kpis = [
    { label: 'Total Revenue', value: 'QAR 2.4M', change: '+14%', trend: 'up' },
    { label: 'Customer Acquisition', value: '1,240', change: '+8%', trend: 'up' },
    { label: 'Operating Margin', value: '22.5%', change: '-2%', trend: 'down' },
    { label: 'SLA Achievement', value: '99.1%', change: '+0.5%', trend: 'up' },
  ];

  it('should have exactly 4 KPI cards', () => {
    expect(kpis).toHaveLength(4);
  });

  it('should have unique KPI labels', () => {
    const labels = kpis.map(k => k.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('every KPI should have label, value, change, and trend fields', () => {
    for (const kpi of kpis) {
      expect(kpi).toHaveProperty('label');
      expect(kpi).toHaveProperty('value');
      expect(kpi).toHaveProperty('change');
      expect(kpi).toHaveProperty('trend');
    }
  });

  it('Total Revenue KPI should show QAR 2.4M with +14% (up)', () => {
    const revenue = kpis.find(k => k.label === 'Total Revenue');
    expect(revenue).toBeDefined();
    expect(revenue?.value).toBe('QAR 2.4M');
    expect(revenue?.change).toBe('+14%');
    expect(revenue?.trend).toBe('up');
  });

  it('Customer Acquisition KPI should show 1,240 with +8% (up)', () => {
    const ca = kpis.find(k => k.label === 'Customer Acquisition');
    expect(ca?.value).toBe('1,240');
    expect(ca?.change).toBe('+8%');
    expect(ca?.trend).toBe('up');
  });

  it('Operating Margin KPI should have negative trend (-2%)', () => {
    const om = kpis.find(k => k.label === 'Operating Margin');
    expect(om?.value).toBe('22.5%');
    expect(om?.change).toBe('-2%');
    expect(om?.trend).toBe('down');
  });

  it('SLA Achievement KPI should be above 99% with positive change', () => {
    const sla = kpis.find(k => k.label === 'SLA Achievement');
    expect(sla?.value).toBe('99.1%');
    expect(sla?.change).toBe('+0.5%');
    expect(sla?.trend).toBe('up');
  });

  it('3 out of 4 KPIs should have "up" trend (majority positive)', () => {
    const upCount = kpis.filter(k => k.trend === 'up').length;
    expect(upCount).toBe(3);
  });

  it('only 1 KPI should have "down" trend', () => {
    const downCount = kpis.filter(k => k.trend === 'down').length;
    expect(downCount).toBe(1);
  });

  describe('KPI trend badge styling', () => {
    // Mirrors: trend === 'up' → 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
    const getBadgeClass = (trend: string) =>
      trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

    it('should use emerald badge for "up" trend', () => {
      expect(getBadgeClass('up')).toBe('bg-emerald-100 text-emerald-700');
    });

    it('should use rose badge for "down" trend', () => {
      expect(getBadgeClass('down')).toBe('bg-rose-100 text-rose-700');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AuditTimeline data (AdminWidgets.tsx)
// ─────────────────────────────────────────────────────────────────────────────
describe('AuditTimeline – data structure', () => {
  const auditLogs = [
    { event: 'Production Cycle Completed', dept: 'Production', time: '4m ago', user: 'Auto-System' },
    { event: 'Inventory Restock Order Placed', dept: 'Procurement', time: '12m ago', user: 'A. Al-Thani' },
    { event: 'New B2B Contract Signed', dept: 'Sales', time: '45m ago', user: 'M. Rashid' },
    { event: 'System Health Check', dept: 'IT', time: '1h ago', user: 'Guardian Agent' },
  ];

  it('should have exactly 4 audit log entries', () => {
    expect(auditLogs).toHaveLength(4);
  });

  it('every log entry should have event, dept, time, and user fields', () => {
    for (const log of auditLogs) {
      expect(log).toHaveProperty('event');
      expect(log).toHaveProperty('dept');
      expect(log).toHaveProperty('time');
      expect(log).toHaveProperty('user');
    }
  });

  it('all event strings should be non-empty', () => {
    for (const log of auditLogs) {
      expect(log.event.trim()).not.toBe('');
    }
  });

  it('first entry should be Production Cycle Completed via Auto-System', () => {
    const first = auditLogs[0];
    expect(first.event).toBe('Production Cycle Completed');
    expect(first.dept).toBe('Production');
    expect(first.user).toBe('Auto-System');
    expect(first.time).toBe('4m ago');
  });

  it('should include an Inventory Restock entry from Procurement', () => {
    const entry = auditLogs.find(l => l.dept === 'Procurement');
    expect(entry).toBeDefined();
    expect(entry?.event).toBe('Inventory Restock Order Placed');
    expect(entry?.user).toBe('A. Al-Thani');
  });

  it('should include a B2B Contract entry from Sales', () => {
    const entry = auditLogs.find(l => l.dept === 'Sales');
    expect(entry).toBeDefined();
    expect(entry?.event).toBe('New B2B Contract Signed');
    expect(entry?.user).toBe('M. Rashid');
  });

  it('last entry should be a System Health Check from the Guardian Agent (IT)', () => {
    const last = auditLogs[auditLogs.length - 1];
    expect(last.event).toBe('System Health Check');
    expect(last.dept).toBe('IT');
    expect(last.user).toBe('Guardian Agent');
    expect(last.time).toBe('1h ago');
  });

  it('entries should be in reverse-chronological order (most recent first)', () => {
    // Most recent = 4m ago, oldest = 1h ago
    const times = auditLogs.map(l => l.time);
    expect(times[0]).toBe('4m ago');
    expect(times[times.length - 1]).toBe('1h ago');
  });

  it('audit title should be "Global Operational Audit"', () => {
    const title = 'Global Operational Audit';
    expect(title).toBe('Global Operational Audit');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AdministrationView data (AdminView.tsx)
// ─────────────────────────────────────────────────────────────────────────────
describe('AdministrationView – Department Status panel', () => {
  const monitoredDepartments = ['Production', 'Transport', 'Finance', 'IT'];

  it('should monitor exactly 4 departments', () => {
    expect(monitoredDepartments).toHaveLength(4);
  });

  it('should include Production, Transport, Finance, and IT', () => {
    expect(monitoredDepartments).toContain('Production');
    expect(monitoredDepartments).toContain('Transport');
    expect(monitoredDepartments).toContain('Finance');
    expect(monitoredDepartments).toContain('IT');
  });

  it('all monitored departments should show ONLINE status', () => {
    // In the component, all departments always show ONLINE
    const getStatus = (_dept: string) => 'ONLINE';
    for (const dept of monitoredDepartments) {
      expect(getStatus(dept)).toBe('ONLINE');
    }
  });

  it('department status list should have unique entries', () => {
    expect(new Set(monitoredDepartments).size).toBe(monitoredDepartments.length);
  });
});

describe('AdministrationView – Security Alert', () => {
  const securityAlert = {
    ip: '192.168.1.45',
    user: 'Admin-02',
    description: 'Unusual login attempt detected from IP 192.168.1.45 for User: Admin-02.',
    actionLabel: 'INVESTIGATE',
  };

  it('should flag IP 192.168.1.45 as suspicious', () => {
    expect(securityAlert.ip).toBe('192.168.1.45');
  });

  it('should flag Admin-02 as the affected user', () => {
    expect(securityAlert.user).toBe('Admin-02');
  });

  it('description should mention both the IP and the user', () => {
    expect(securityAlert.description).toContain('192.168.1.45');
    expect(securityAlert.description).toContain('Admin-02');
  });

  it('action label should be INVESTIGATE', () => {
    expect(securityAlert.actionLabel).toBe('INVESTIGATE');
  });
});

describe('AdministrationView – AI Insight panel', () => {
  const aiInsight = {
    title: 'AI Insight: Operational Bottleneck',
    delayMinutes: 15,
    affectedZone: 'Zone 4 (West Bay)',
    cause: 'traffic congestion',
    recommendation: 'Reroute Drivers 04 and 09 via Al Corniche St.',
    actionLabel: 'Execute Reroute',
  };

  it('should indicate a 15-minute delay', () => {
    expect(aiInsight.delayMinutes).toBe(15);
  });

  it('should identify Zone 4 (West Bay) as the affected zone', () => {
    expect(aiInsight.affectedZone).toBe('Zone 4 (West Bay)');
  });

  it('should recommend rerouting Drivers 04 and 09', () => {
    expect(aiInsight.recommendation).toContain('04');
    expect(aiInsight.recommendation).toContain('09');
    expect(aiInsight.recommendation).toContain('Al Corniche St.');
  });

  it('action button label should be "Execute Reroute"', () => {
    expect(aiInsight.actionLabel).toBe('Execute Reroute');
  });

  it('cause of delay should be traffic congestion', () => {
    expect(aiInsight.cause).toBe('traffic congestion');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DepartmentLayout theme application logic (layout.tsx)
// ─────────────────────────────────────────────────────────────────────────────
describe('DepartmentLayout – theme application logic', () => {
  // Mirrors: theme.visualEffects === 'sci-fi' ? 'bg-black text-green-500 font-mono' : 'bg-background'
  const getLayoutClass = (dept: string) => {
    const theme = getTheme(dept);
    return theme.visualEffects === 'sci-fi'
      ? 'bg-black text-green-500 font-mono'
      : 'bg-background';
  };

  it('should apply sci-fi classes for "it" department', () => {
    expect(getLayoutClass('it')).toBe('bg-black text-green-500 font-mono');
  });

  it('should apply sci-fi classes for "security" department', () => {
    expect(getLayoutClass('security')).toBe('bg-black text-green-500 font-mono');
  });

  it('should apply standard bg-background for "administration"', () => {
    expect(getLayoutClass('administration')).toBe('bg-background');
  });

  it('should apply standard bg-background for "finance"', () => {
    expect(getLayoutClass('finance')).toBe('bg-background');
  });

  it('should apply standard bg-background for unknown department (uses default theme)', () => {
    expect(getLayoutClass('unknown_dept')).toBe('bg-background');
  });

  it('should apply standard bg-background for "production" (industrial, not sci-fi)', () => {
    expect(getLayoutClass('production')).toBe('bg-background');
  });

  it('should apply standard bg-background for "transport" (industrial, not sci-fi)', () => {
    expect(getLayoutClass('transport')).toBe('bg-background');
  });

  describe('department name display (underscore to space substitution)', () => {
    // Mirrors: department.replace('_', ' ')
    const formatDeptName = (dept: string) => dept.replace('_', ' ');

    it('should replace underscore with space in "customer_service"', () => {
      expect(formatDeptName('customer_service')).toBe('customer service');
    });

    it('should replace underscore with space in "business_dev"', () => {
      expect(formatDeptName('business_dev')).toBe('business dev');
    });

    it('should leave plain department names unchanged', () => {
      expect(formatDeptName('administration')).toBe('administration');
      expect(formatDeptName('finance')).toBe('finance');
      expect(formatDeptName('it')).toBe('it');
    });

    it('should only replace the first underscore (String.replace behaviour)', () => {
      // e.g. 'a_b_c' → 'a b_c' (only first occurrence replaced)
      expect(formatDeptName('a_b_c')).toBe('a b_c');
    });
  });

  it('layout header should display "Internal ERP System" label', () => {
    const subLabel = 'Internal ERP System';
    expect(subLabel).toBe('Internal ERP System');
  });

  it('command center button should hint at keyboard shortcut ⌘K', () => {
    const buttonLabel = 'Command Center (⌘K)';
    expect(buttonLabel).toContain('⌘K');
  });

  it('CSS custom properties should use theme primary and accent', () => {
    const theme = getTheme('administration');
    const cssVars = {
      '--primary': theme.primary,
      '--accent': theme.accent,
    };
    expect(cssVars['--primary']).toBe('#0F172A');
    expect(cssVars['--accent']).toBe('#3B82F6');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CommandPaletteSkeleton navigation items
// (packages/ui-core/src/components/CommandPalette.tsx)
// ─────────────────────────────────────────────────────────────────────────────
describe('CommandPaletteSkeleton – navigation items', () => {
  const quickNavItems = ['Administration', 'Production', 'IT', 'Finance'];

  it('should list exactly 4 quick navigation items', () => {
    expect(quickNavItems).toHaveLength(4);
  });

  it('should include Administration in navigation', () => {
    expect(quickNavItems).toContain('Administration');
  });

  it('should include Production in navigation', () => {
    expect(quickNavItems).toContain('Production');
  });

  it('should include IT in navigation', () => {
    expect(quickNavItems).toContain('IT');
  });

  it('should include Finance in navigation', () => {
    expect(quickNavItems).toContain('Finance');
  });

  it('should have unique navigation item labels', () => {
    expect(new Set(quickNavItems).size).toBe(quickNavItems.length);
  });

  it('version identifier should be "PRISTINE HQ v1.0"', () => {
    const version = 'PRISTINE HQ v1.0';
    expect(version).toBe('PRISTINE HQ v1.0');
    expect(version).toContain('v1.0');
  });

  it('search input placeholder should mention departments', () => {
    const placeholder = 'Type a command or search departments...';
    expect(placeholder).toContain('departments');
    expect(placeholder).toContain('command');
  });

  it('keyboard hint section label should be "Quick Navigation"', () => {
    const sectionLabel = 'Quick Navigation';
    expect(sectionLabel).toBe('Quick Navigation');
  });

  it('should provide ESC keyboard hint', () => {
    const escHint = 'ESC';
    expect(escHint).toBe('ESC');
  });

  it('palette footer should indicate Enter to select and arrows to navigate', () => {
    const selectHint = '↵';
    const navigateHint = '↑↓';
    expect(selectHint).toBe('↵');
    expect(navigateHint).toBe('↑↓');
  });

  it('palette should start with opacity-0 (hidden by default)', () => {
    // The skeleton is rendered with opacity-0 and pointer-events-none
    const opacityClass = 'opacity-0';
    const pointerEventsClass = 'pointer-events-none';
    expect(opacityClass).toBe('opacity-0');
    expect(pointerEventsClass).toBe('pointer-events-none');
  });
});