import { describe, it, expect } from 'vitest';
import { PORTAL_CONFIG } from '../../apps/internal-portals/config/portals';
import type { PortalID } from '../../apps/internal-portals/config/portals';

describe('PORTAL_CONFIG', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(PORTAL_CONFIG)).toBe(true);
    expect(PORTAL_CONFIG.length).toBeGreaterThan(0);
  });

  it('should have exactly 15 portals', () => {
    expect(PORTAL_CONFIG).toHaveLength(15);
  });

  it('should have all required fields on each portal entry', () => {
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
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique portal names', () => {
    const names = PORTAL_CONFIG.map(p => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have valid hex color codes for all portals', () => {
    const hexColorPattern = /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/;
    for (const portal of PORTAL_CONFIG) {
      expect(portal.color).toMatch(hexColorPattern);
    }
  });

  it('should include expected core department portals', () => {
    const ids = PORTAL_CONFIG.map(p => p.id);
    expect(ids).toContain('administration');
    expect(ids).toContain('it');
    expect(ids).toContain('finance');
    expect(ids).toContain('transport');
    expect(ids).toContain('production');
    expect(ids).toContain('hr');
    expect(ids).toContain('customer_service');
    expect(ids).toContain('marketing');
  });

  it('should have non-empty id and name strings', () => {
    for (const portal of PORTAL_CONFIG) {
      expect(portal.id.trim()).not.toBe('');
      expect(portal.name.trim()).not.toBe('');
      expect(portal.icon.trim()).not.toBe('');
    }
  });

  it('should contain the administration portal with correct properties', () => {
    const admin = PORTAL_CONFIG.find(p => p.id === 'administration');
    expect(admin).toBeDefined();
    expect(admin?.name).toBe('Administration');
    expect(admin?.color).toBe('#2C3E50');
    expect(admin?.icon).toBe('Settings');
  });

  it('should contain the IT portal with correct properties', () => {
    const it = PORTAL_CONFIG.find(p => p.id === 'it');
    expect(it).toBeDefined();
    expect(it?.name).toBe('Information Technology');
    expect(it?.color).toBe('#00FF41');
    expect(it?.icon).toBe('Terminal');
  });

  it('should contain the transport portal with correct properties', () => {
    const transport = PORTAL_CONFIG.find(p => p.id === 'transport');
    expect(transport).toBeDefined();
    expect(transport?.name).toBe('Transport');
    expect(transport?.color).toBe('#F1C40F');
    expect(transport?.icon).toBe('Truck');
  });

  it('should contain the finance portal with correct properties', () => {
    const finance = PORTAL_CONFIG.find(p => p.id === 'finance');
    expect(finance).toBeDefined();
    expect(finance?.name).toBe('Finance');
    expect(finance?.color).toBe('#27AE60');
    expect(finance?.icon).toBe('DollarSign');
  });

  it('should contain the production portal with correct properties', () => {
    const production = PORTAL_CONFIG.find(p => p.id === 'production');
    expect(production).toBeDefined();
    expect(production?.name).toBe('Production');
    expect(production?.color).toBe('#E67E22');
    expect(production?.icon).toBe('Layers');
  });

  it('should contain the customer_service portal with correct properties', () => {
    const cs = PORTAL_CONFIG.find(p => p.id === 'customer_service');
    expect(cs).toBeDefined();
    expect(cs?.name).toBe('Customer Service');
    expect(cs?.color).toBe('#16A085');
    expect(cs?.icon).toBe('Headset');
  });

  it('should contain the security portal', () => {
    const security = PORTAL_CONFIG.find(p => p.id === 'security');
    expect(security).toBeDefined();
    expect(security?.name).toBe('Security & Surveillance');
    expect(security?.color).toBe('#C0392B');
    expect(security?.icon).toBe('Shield');
  });

  it('should contain the housekeeping portal', () => {
    const housekeeping = PORTAL_CONFIG.find(p => p.id === 'housekeeping');
    expect(housekeeping).toBeDefined();
    expect(housekeeping?.name).toBe('Housekeeping');
    expect(housekeeping?.color).toBe('#1ABC9C');
    expect(housekeeping?.icon).toBe('Sparkles');
  });

  it('should allow looking up portals by id', () => {
    const lookup = (id: PortalID) => PORTAL_CONFIG.find(p => p.id === id);
    expect(lookup('administration')).toBeDefined();
    expect(lookup('it')).toBeDefined();
    expect(lookup('hr')).toBeDefined();
  });

  it('should have all portal IDs as valid identifier strings (no spaces)', () => {
    for (const portal of PORTAL_CONFIG) {
      expect(portal.id).not.toContain(' ');
    }
  });

  it('should return undefined for unknown portal id lookup', () => {
    const unknown = PORTAL_CONFIG.find(p => p.id === 'nonexistent_portal' as PortalID);
    expect(unknown).toBeUndefined();
  });

  it('should list portals in a predictable order starting with administration', () => {
    expect(PORTAL_CONFIG[0].id).toBe('administration');
  });

  it('should have the hr portal with correct properties', () => {
    const hr = PORTAL_CONFIG.find(p => p.id === 'hr');
    expect(hr).toBeDefined();
    expect(hr?.name).toBe('Human Resource');
    expect(hr?.icon).toBe('Users');
  });

  it('should have the maintenance portal with correct properties', () => {
    const maintenance = PORTAL_CONFIG.find(p => p.id === 'maintenance');
    expect(maintenance).toBeDefined();
    expect(maintenance?.name).toBe('Maintenance');
    expect(maintenance?.color).toBe('#D35400');
  });
});