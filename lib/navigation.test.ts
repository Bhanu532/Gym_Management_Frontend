import {
  SUPER_ADMIN_NAV,
  GYM_ADMIN_NAV,
  RECEPTIONIST_NAV,
  TRAINER_NAV,
  DIETITIAN_NAV,
  MEMBER_NAV,
  getHomePathForRole,
  getNavigationForRole,
  isPathAllowedForRole,
  normalizeRole,
} from './navigation';

describe('normalizeRole', () => {
  it('resolves every casing/spelling of SUPER_ADMIN', () => {
    expect(normalizeRole('SUPER_ADMIN')).toBe('SUPER_ADMIN');
    expect(normalizeRole('SUPERADMIN')).toBe('SUPER_ADMIN');
    expect(normalizeRole('super_admin')).toBe('SUPER_ADMIN');
    expect(normalizeRole(' Super-Admin ')).toBe('SUPER_ADMIN');
    expect(normalizeRole('platform')).toBe('SUPER_ADMIN');
  });

  it('resolves gym admin aliases', () => {
    expect(normalizeRole('OWNER_ADMIN')).toBe('GYM_ADMIN');
    expect(normalizeRole('OWNER')).toBe('GYM_ADMIN');
    expect(normalizeRole('ADMIN')).toBe('GYM_ADMIN');
    expect(normalizeRole('MANAGER')).toBe('GYM_ADMIN');
  });

  it('keeps remaining roles', () => {
    expect(normalizeRole('RECEPTIONIST')).toBe('RECEPTIONIST');
    expect(normalizeRole('TRAINER')).toBe('TRAINER');
    expect(normalizeRole('TRAINER_ADMIN')).toBe('TRAINER_ADMIN');
    expect(normalizeRole('DIETITIAN')).toBe('DIETITIAN');
    expect(normalizeRole('MEMBER')).toBe('MEMBER');
  });
});

describe('role-based navigation selection', () => {
  it('SUPER_ADMIN sees ONLY platform navigation', () => {
    const nav = getNavigationForRole('SUPER_ADMIN');
    expect(nav.map((i) => i.label)).toEqual([
      'Platform Overview',
      'Tenants & Gyms',
      'SaaS Plans',
      'Subscriptions & Billing',
      'Platform Users',
      'Audit Logs',
      'Platform Settings',
    ]);
    const labels = nav.map((i) => i.label);
    for (const forbidden of ['Members', 'Membership Plans', 'Pending Dues', 'Billing & Invoices', 'Fast Check-in', 'Leads & CRM', 'Classes', 'PT Sessions', 'Trainers', 'Workouts', 'Progress Tracking', 'Diet & Nutrition', 'Staff & Roles', 'Expenses', 'Equipment Assets', 'Reports & Analytics', 'Settings', 'Dashboard']) {
      expect(labels).not.toContain(forbidden);
    }
  });

  it('OWNER / ADMIN see the full gym management navigation', () => {
    for (const role of ['OWNER', 'ADMIN', 'OWNER_ADMIN']) {
      const nav = getNavigationForRole(role);
      expect(nav).toEqual(GYM_ADMIN_NAV);
      const labels = nav.map((i) => i.label);
      expect(labels).toContain('Members');
      expect(labels).toContain('Membership Plans');
      expect(labels).toContain('Billing & Invoices');
      expect(labels).not.toContain('Platform Overview');
    }
  });

  it('RECEPTIONIST sees only receptionist modules', () => {
    const nav = getNavigationForRole('RECEPTIONIST');
    expect(nav).toEqual(RECEPTIONIST_NAV);
    const labels = nav.map((i) => i.label);
    expect(labels).toContain('Front Desk');
    expect(labels).toContain('Fast Check-in');
    expect(labels).not.toContain('Staff & Roles');
    expect(labels).not.toContain('Reports & Analytics');
    expect(labels).not.toContain('Trainers');
    expect(labels).not.toContain('Platform Overview');
  });

  it('TRAINER_ADMIN sees the full gym admin navigation', () => {
    const nav = getNavigationForRole('TRAINER_ADMIN');
    expect(nav).toEqual(GYM_ADMIN_NAV);
    const labels = nav.map((i) => i.label);
    expect(labels).toContain('Members');
    expect(labels).toContain('Billing & Invoices');
    expect(labels).toContain('Staff & Roles');
    expect(labels).toContain('Reports & Analytics');
    expect(labels).not.toContain('Platform Overview');
  });

  it('TRAINER sees only trainer modules', () => {
    const nav = getNavigationForRole('TRAINER');
    expect(nav).toEqual(TRAINER_NAV);
    const labels = nav.map((i) => i.label);
    expect(labels).toContain('Workouts');
    expect(labels).toContain('PT Sessions');
    expect(labels).not.toContain('Staff & Roles');
    expect(labels).not.toContain('Expenses');
    expect(labels).not.toContain('Platform Overview');
  });

  it('DIETITIAN sees only dietitian modules', () => {
    const nav = getNavigationForRole('DIETITIAN');
    expect(nav).toEqual(DIETITIAN_NAV);
    const labels = nav.map((i) => i.label);
    expect(labels).toContain('Diet & Nutrition');
    expect(labels).toContain('Progress Tracking');
    expect(labels).not.toContain('Membership Plans');
    expect(labels).not.toContain('Staff & Roles');
  });

  it('MEMBER sees only the member portal', () => {
    const nav = getNavigationForRole('MEMBER');
    expect(nav).toEqual(MEMBER_NAV);
    expect(nav.map((i) => i.label)).toEqual(['Member Portal']);
  });
});

describe('post-login home redirects', () => {
  it('maps every role to its own home', () => {
    expect(getHomePathForRole('SUPER_ADMIN')).toBe('/platform');
    expect(getHomePathForRole('SUPERADMIN')).toBe('/platform');
    expect(getHomePathForRole('OWNER')).toBe('/dashboard');
    expect(getHomePathForRole('ADMIN')).toBe('/dashboard');
    expect(getHomePathForRole('OWNER_ADMIN')).toBe('/dashboard');
    expect(getHomePathForRole('RECEPTIONIST')).toBe('/receptionist');
    expect(getHomePathForRole('TRAINER')).toBe('/trainer/dashboard');
    expect(getHomePathForRole('TRAINER_ADMIN')).toBe('/dashboard');
    expect(getHomePathForRole('DIETITIAN')).toBe('/dietitian/dashboard');
    expect(getHomePathForRole('MEMBER')).toBe('/member');
  });
});

describe('route access guard', () => {
  it('SUPER_ADMIN can only open platform routes', () => {
    expect(isPathAllowedForRole('/platform', 'SUPER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/platform/tenants', 'SUPER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/members', 'SUPER_ADMIN')).toBe(false);
    expect(isPathAllowedForRole('/dashboard', 'SUPER_ADMIN')).toBe(false);
    expect(isPathAllowedForRole('/billing', 'SUPER_ADMIN')).toBe(false);
  });

  it('gym admins are blocked from platform routes but allowed gym routes', () => {
    expect(isPathAllowedForRole('/dashboard', 'OWNER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/members/new', 'OWNER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/invoices/INV-1', 'OWNER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/platform', 'OWNER_ADMIN')).toBe(false);
    expect(isPathAllowedForRole('/member', 'OWNER_ADMIN')).toBe(false);
  });

  it('trainer admin is treated like gym admin for route access', () => {
    expect(isPathAllowedForRole('/dashboard', 'TRAINER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/members/new', 'TRAINER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/staff', 'TRAINER_ADMIN')).toBe(true);
    expect(isPathAllowedForRole('/platform', 'TRAINER_ADMIN')).toBe(false);
  });

  it('member is blocked from gym admin routes', () => {
    expect(isPathAllowedForRole('/member', 'MEMBER')).toBe(true);
    expect(isPathAllowedForRole('/dashboard', 'MEMBER')).toBe(false);
    expect(isPathAllowedForRole('/platform', 'MEMBER')).toBe(false);
  });
});
