'use client';

import React from 'react';

// ============================================================================
// Centralized role-based navigation configuration (single source of truth).
// The sidebar selects exactly ONE navigation array from the authenticated
// user's role. Arrays are never merged and items are never hidden post-hoc.
// ============================================================================

export interface NavItem {
  href: string;
  label: string;
  category: string;
  icon: React.ReactNode;
}

// Crisp Lucide-style SVG icon set (shared by nav + AppShell chrome).
export const Icons = {
  Dashboard: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  CheckIn: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Members: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Leads: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Plans: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Billing: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Dues: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Trainers: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Workouts: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Diet: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Progress: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Classes: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  PT: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Staff: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4" /></svg>,
  Expenses: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Equipment: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Reports: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>,
  Platform: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Tenants: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7a2 2 0 012-2h4a2 2 0 012 2v14M13 21V5a2 2 0 012-2h2a2 2 0 012 2v16M9 9h.01M9 13h.01M15 9h.01M15 13h.01" /></svg>,
  Subscriptions: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h2m4 0h4M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>,
  Users: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
  Audit: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Menu: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Bell: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Logout: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17l5-5-5-5M20 12H9m4 7H5a2 2 0 01-2-2V7a2 2 0 012-2h8a2 2 0 012 2v2" /></svg>,
  Eye: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>,
  EyeOff: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.94 17.94A10.07 10.07 0 019.879 19.93 10.9 10.9 0 012 12c.74-1.76 2.03-3.28 3.62-4.45M9.88 4.07A10.9 10.9 0 0112 4c6.5 0 10 8 10 8a17.6 17.6 0 01-2.06 3.98M1 1l22 22" /></svg>,
};



// ----------------------------------------------------------------------------
// Role normalization
// ----------------------------------------------------------------------------
export type RoleKey =
  | 'SUPER_ADMIN'
  | 'GYM_ADMIN'
  | 'TRAINER_ADMIN'
  | 'RECEPTIONIST'
  | 'TRAINER'
  | 'DIETITIAN'
  | 'MEMBER';

/**
 * Normalizes inconsistent role spellings to the canonical app roles:
 *   SUPER_ADMIN | SUPERADMIN | super_admin | platform  -> SUPER_ADMIN
 *   OWNER | ADMIN | OWNER_ADMIN | MANAGER | tenant     -> GYM_ADMIN
 *   TRAINER_ADMIN | TRAINERADMIN -> TRAINER_ADMIN
 *   RECEPTIONIST, TRAINER, DIETITIAN, MEMBER -> unchanged
 */
export function normalizeRole(role?: string | null): RoleKey {
  if (!role) return 'GYM_ADMIN';
  const r = role.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN' || r === 'PLATFORM') return 'SUPER_ADMIN';
  if (r === 'OWNER' || r === 'ADMIN' || r === 'OWNER_ADMIN' || r === 'MANAGER' || r === 'ACCOUNTANT' || r === 'TENANT') return 'GYM_ADMIN';
  if (r === 'TRAINER_ADMIN' || r === 'TRAINERADMIN') return 'TRAINER_ADMIN';
  if (r === 'RECEPTIONIST') return 'RECEPTIONIST';
  if (r === 'TRAINER') return 'TRAINER';
  if (r === 'DIETITIAN') return 'DIETITIAN';
  if (r === 'MEMBER') return 'MEMBER';
  return 'GYM_ADMIN';
}

// ----------------------------------------------------------------------------
// Role-based navigation arrays (never merged — the role selects exactly one)
// ----------------------------------------------------------------------------

export const SUPER_ADMIN_NAV: NavItem[] = [
  { href: '/platform', label: 'Platform Overview', category: 'SUPER_ADMIN', icon: Icons.Platform },
  { href: '/platform/tenants', label: 'Tenants & Gyms', category: 'SUPER_ADMIN', icon: Icons.Tenants },
  { href: '/platform/plans', label: 'SaaS Plans', category: 'SUPER_ADMIN', icon: Icons.Plans },
  { href: '/platform/subscriptions', label: 'Subscriptions & Billing', category: 'SUPER_ADMIN', icon: Icons.Subscriptions },
  { href: '/platform/users', label: 'Platform Users', category: 'SUPER_ADMIN', icon: Icons.Users },
  { href: '/platform/audit', label: 'Audit Logs', category: 'SUPER_ADMIN', icon: Icons.Audit },
  { href: '/platform/settings', label: 'Platform Settings', category: 'SUPER_ADMIN', icon: Icons.Settings },
];

export const GYM_ADMIN_NAV: NavItem[] = [
  // OVERVIEW
  { href: '/dashboard', label: 'Dashboard', category: 'OVERVIEW', icon: Icons.Dashboard },

  // MEMBERSHIP
  { href: '/members', label: 'Members', category: 'MEMBERSHIP', icon: Icons.Members },
  { href: '/plans', label: 'Membership Plans', category: 'MEMBERSHIP', icon: Icons.Plans },
  { href: '/dues', label: 'Pending Dues', category: 'MEMBERSHIP', icon: Icons.Dues },
  { href: '/billing', label: 'Billing & Invoices', category: 'MEMBERSHIP', icon: Icons.Billing },

  // OPERATIONS
  { href: '/attendance', label: 'Fast Check-in', category: 'OPERATIONS', icon: Icons.CheckIn },
  { href: '/leads', label: 'Leads & CRM', category: 'OPERATIONS', icon: Icons.Leads },
  { href: '/classes', label: 'Classes', category: 'OPERATIONS', icon: Icons.Classes },
  { href: '/pt', label: 'PT Sessions', category: 'OPERATIONS', icon: Icons.PT },

  // TRAINING
  { href: '/trainers', label: 'Trainers', category: 'TRAINING', icon: Icons.Trainers },
  { href: '/workouts', label: 'Workouts', category: 'TRAINING', icon: Icons.Workouts },
  { href: '/progress', label: 'Progress Tracking', category: 'TRAINING', icon: Icons.Progress },

  // HEALTH
  { href: '/diet', label: 'Diet & Nutrition', category: 'HEALTH', icon: Icons.Diet },

  // STAFF
  { href: '/staff', label: 'Staff & Roles', category: 'STAFF', icon: Icons.Staff },

  // FINANCE & REPORTS
  { href: '/expenses', label: 'Expenses', category: 'FINANCE', icon: Icons.Expenses },
  { href: '/equipment', label: 'Equipment Assets', category: 'FINANCE', icon: Icons.Equipment },
  { href: '/reports', label: 'Reports & Analytics', category: 'FINANCE', icon: Icons.Reports },
  { href: '/settings', label: 'Settings', category: 'FINANCE', icon: Icons.Settings },
];

export const RECEPTIONIST_NAV: NavItem[] = [
  // OVERVIEW
  { href: '/receptionist', label: 'Front Desk', category: 'OVERVIEW', icon: Icons.Dashboard },

  // MEMBERSHIP
  { href: '/members', label: 'Members', category: 'MEMBERSHIP', icon: Icons.Members },
  { href: '/plans', label: 'Membership Plans', category: 'MEMBERSHIP', icon: Icons.Plans },
  { href: '/dues', label: 'Pending Dues', category: 'MEMBERSHIP', icon: Icons.Dues },
  { href: '/billing', label: 'Billing & Invoices', category: 'MEMBERSHIP', icon: Icons.Billing },

  // OPERATIONS
  { href: '/attendance', label: 'Fast Check-in', category: 'OPERATIONS', icon: Icons.CheckIn },
  { href: '/leads', label: 'Leads & CRM', category: 'OPERATIONS', icon: Icons.Leads },
  { href: '/classes', label: 'Classes', category: 'OPERATIONS', icon: Icons.Classes },
];

export const TRAINER_NAV: NavItem[] = [
  // OVERVIEW
  { href: '/trainer/dashboard', label: 'Dashboard', category: 'OVERVIEW', icon: Icons.Dashboard },

  // MEMBERS
  { href: '/members', label: 'Members', category: 'MEMBERSHIP', icon: Icons.Members },

  // OPERATIONS
  { href: '/attendance', label: 'Fast Check-in', category: 'OPERATIONS', icon: Icons.CheckIn },
  { href: '/classes', label: 'Classes', category: 'OPERATIONS', icon: Icons.Classes },
  { href: '/pt', label: 'PT Sessions', category: 'OPERATIONS', icon: Icons.PT },

  // TRAINING
  { href: '/workouts', label: 'Workouts', category: 'TRAINING', icon: Icons.Workouts },

  // HEALTH
  { href: '/diet', label: 'Diet & Nutrition', category: 'HEALTH', icon: Icons.Diet },
];

export const DIETITIAN_NAV: NavItem[] = [
  // OVERVIEW
  { href: '/dietitian/dashboard', label: 'Dashboard', category: 'OVERVIEW', icon: Icons.Dashboard },

  // MEMBERS
  { href: '/members', label: 'Members', category: 'MEMBERSHIP', icon: Icons.Members },

  // HEALTH
  { href: '/diet', label: 'Diet & Nutrition', category: 'HEALTH', icon: Icons.Diet },

  // TRAINING
  { href: '/progress', label: 'Progress Tracking', category: 'TRAINING', icon: Icons.Progress },
];

export const MEMBER_NAV: NavItem[] = [
  { href: '/member', label: 'Member Portal', category: 'OVERVIEW', icon: Icons.Members },
];

const NAV_BY_ROLE: Record<RoleKey, NavItem[]> = {
  SUPER_ADMIN: SUPER_ADMIN_NAV,
  GYM_ADMIN: GYM_ADMIN_NAV,
  TRAINER_ADMIN: GYM_ADMIN_NAV,
  RECEPTIONIST: RECEPTIONIST_NAV,
  TRAINER: TRAINER_NAV,
  DIETITIAN: DIETITIAN_NAV,
  MEMBER: MEMBER_NAV,
};

/** Returns the single navigation array for the authenticated role. */
export function getNavigationForRole(role?: string | null): NavItem[] {
  return NAV_BY_ROLE[normalizeRole(role)] ?? GYM_ADMIN_NAV;
}


// ----------------------------------------------------------------------------
// Role home pages (post-login redirects)
// ----------------------------------------------------------------------------
export const HOME_PATH_BY_ROLE: Record<RoleKey, string> = {
  SUPER_ADMIN: '/platform',
  GYM_ADMIN: '/dashboard',
  TRAINER_ADMIN: '/dashboard',
  RECEPTIONIST: '/receptionist',
  TRAINER: '/trainer/dashboard',
  DIETITIAN: '/dietitian/dashboard',
  MEMBER: '/member',
};

export function getHomePathForRole(role?: string | null): string {
  return HOME_PATH_BY_ROLE[normalizeRole(role)] ?? '/dashboard';
}

// ----------------------------------------------------------------------------
// Route access control (client-side guard). Backend still enforces auth.
// ----------------------------------------------------------------------------
export const ROLE_ROUTE_PREFIXES: Record<RoleKey, string[]> = {
  SUPER_ADMIN: ['/platform'],
  GYM_ADMIN: [
    '/dashboard', '/members', '/plans', '/dues', '/billing', '/invoices',
    '/attendance', '/leads', '/classes', '/pt', '/trainers', '/workouts',
    '/progress', '/diet', '/staff', '/expenses', '/equipment', '/reports',
    '/settings', '/branches', '/notifications', '/audit', '/receptionist',
  ],
  TRAINER_ADMIN: [
    '/dashboard', '/members', '/plans', '/dues', '/billing', '/invoices',
    '/attendance', '/leads', '/classes', '/pt', '/trainers', '/workouts',
    '/progress', '/diet', '/staff', '/expenses', '/equipment', '/reports',
    '/settings', '/branches', '/notifications', '/audit', '/receptionist',
  ],
  RECEPTIONIST: [
    '/receptionist', '/members', '/plans', '/dues', '/billing', '/invoices',
    '/attendance', '/leads', '/classes', '/notifications',
  ],
  TRAINER: [
    '/trainer', '/members', '/attendance', '/classes', '/pt', '/workouts',
    '/diet', '/notifications',
  ],
  DIETITIAN: ['/dietitian', '/members', '/diet', '/progress', '/notifications'],
  MEMBER: ['/member', '/notifications'],
};

/** True when the current path belongs to the authenticated role's area. */
export function isPathAllowedForRole(pathname: string, role?: string | null): boolean {
  const prefixes = ROLE_ROUTE_PREFIXES[normalizeRole(role)] ?? [];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// ----------------------------------------------------------------------------
// Role-aware global search quick links
// ----------------------------------------------------------------------------
export const QUICK_LINKS: Record<RoleKey, { label: string; href: string }[]> = {
  SUPER_ADMIN: [
    { label: 'Tenants & Gyms', href: '/platform/tenants' },
    { label: 'SaaS Plans', href: '/platform/plans' },
    { label: 'Subscriptions & Billing', href: '/platform/subscriptions' },
    { label: 'Platform Users', href: '/platform/users' },
  ],
  GYM_ADMIN: [
    { label: 'Members List', href: '/members' },
    { label: 'Lead CRM', href: '/leads' },
    { label: 'Check-in Desk', href: '/attendance' },
    { label: 'Billing & Invoices', href: '/billing' },
  ],
  TRAINER_ADMIN: [
    { label: 'Members List', href: '/members' },
    { label: 'Lead CRM', href: '/leads' },
    { label: 'Check-in Desk', href: '/attendance' },
    { label: 'Billing & Invoices', href: '/billing' },
  ],
  RECEPTIONIST: [
    { label: 'Check-in Desk', href: '/attendance' },
    { label: 'New Member', href: '/members/new' },
    { label: 'Leads & CRM', href: '/leads' },
    { label: 'Billing & Invoices', href: '/billing' },
  ],
  TRAINER: [
    { label: 'Members', href: '/members' },
    { label: 'Workouts', href: '/workouts' },
    { label: 'PT Sessions', href: '/pt' },
    { label: 'Classes', href: '/classes' },
  ],
  DIETITIAN: [
    { label: 'Members', href: '/members' },
    { label: 'Diet & Nutrition', href: '/diet' },
    { label: 'Progress Tracking', href: '/progress' },
    { label: 'Dashboard', href: '/dietitian/dashboard' },
  ],
  MEMBER: [
    { label: 'Digital Pass', href: '/member' },
    { label: 'My Workouts', href: '/member' },
    { label: 'My Diet Plan', href: '/member' },
    { label: 'Body Metrics', href: '/member' },
  ],
};

