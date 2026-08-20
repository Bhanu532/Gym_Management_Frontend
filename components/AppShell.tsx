'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/api';
import { cn, Modal, Drawer, Input, Badge } from '@/components/ui';
import {
  Icons,
  QUICK_LINKS,
  getHomePathForRole,
  getNavigationForRole,
  isPathAllowedForRole,
  normalizeRole,
} from '@/lib/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.scope !== 'tenant') return;
    async function loadBranches() {
      try {
        const { api } = await import('@/lib/api');
        const res = await api.get<{ items?: Array<{ id: string; name: string; code?: string }> }>('/branches');
        if (res?.items && res.items.length > 0) {
          setBranches(res.items);
          setSelectedBranch((prev) => prev || res.items![0].id);
        }
      } catch {
        // fallback
      }
    }
    void loadBranches();
  }, [user]);

  // Single source of truth: the authenticated role selects the nav array.
  const roleKey = normalizeRole(user?.role);
  const displayRole = user?.role ?? 'OWNER_ADMIN';
  const navItems = getNavigationForRole(user?.role);
  const homePath = getHomePathForRole(user?.role);
  const quickLinks = QUICK_LINKS[roleKey] ?? [];

  // Client-side route guard: block unauthenticated users and users who
  // manually navigate to URLs outside their role's area. The backend also
  // enforces scope/permission on every API request.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!isPathAllowedForRole(pathname, user.role)) {
      router.replace(homePath);
    }
  }, [authLoading, user, pathname, homePath, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = Array.from(new Set(navItems.map((i) => i.category)));

  const searchPlaceholder =
    roleKey === 'SUPER_ADMIN'
      ? 'Search tenants, plans, subscriptions, platform users...'
      : roleKey === 'MEMBER'
        ? 'Search my workouts, diet plans, classes, invoices...'
        : 'Search members, leads, invoices, payments, trainers...';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Dark Navy Sticky & Scrollable Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-900 text-slate-300 md:flex border-r border-slate-800 h-screen sticky top-0 z-30">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg shadow-md">
              ⚡
            </div>
            <div>
              <p className="text-base font-bold text-white tracking-wide">GymPro SaaS</p>
              <p className="text-[11px] text-slate-400 font-medium">
                {roleKey === 'SUPER_ADMIN' ? 'SaaS Platform Console' : 'Enterprise Platform'}
              </p>
            </div>
          </div>
        </div>

        {/* Branch Selector (gym roles only) */}
        {roleKey !== 'SUPER_ADMIN' && roleKey !== 'MEMBER' && (
          <div className="p-3 shrink-0 border-b border-slate-800/80 bg-slate-900">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 px-1">
              Active Gym Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-200 border border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.code ? `(${b.code})` : ''}
                  </option>
                ))
              ) : (
                <option value="">Main Branch</option>
              )}
            </select>
          </div>
        )}

        {/* Scrollable Grouped Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 min-h-0 divide-y-0 scrollbar-thin">
          {categories.map((cat) => {
            const items = navItems.filter((i) => i.category === cat);
            return (
              <div key={cat} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {cat}
                </p>
                {items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && item.href !== '/platform' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                        active
                          ? 'bg-blue-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Footer Profile Card */}
        <div className="shrink-0 border-t border-slate-800 p-4 bg-slate-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs border border-blue-400">
                {user?.name?.[0] ?? 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Demo Owner'}</p>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">{displayRole.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {Icons.Logout}
            </button>
          </div>
        </div>
      </aside>


      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6 shadow-xs z-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {Icons.Menu}
          </button>

          <div className="flex-1 max-w-md mx-2 md:mx-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center w-full gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all text-left"
            >
              {Icons.Leads}
              <span className="flex-1 truncate">{searchPlaceholder}</span>
              <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex bg-blue-50 text-blue-700 border-blue-200 font-mono text-[11px]">
              {displayRole}
            </Badge>

            <button
              onClick={() => setNotifOpen(true)}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              {Icons.Bell}
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/70">{children}</main>
      </div>

      {/* Global Search Modal */}
      <Modal isOpen={searchOpen} onClose={() => setSearchOpen(false)} title="Global Command Search (Cmd + K)">
        <div className="space-y-4">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Navigation Links</p>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(link.href);
                  }}
                  className="p-2.5 rounded-lg border text-left text-xs font-medium hover:bg-blue-50"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Notifications Drawer */}
      <Drawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications & Alerts">
        <div className="space-y-4">
          {roleKey === 'SUPER_ADMIN' ? (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex gap-3 text-xs text-blue-900">
              <div>
                <p className="font-semibold">Platform Alert</p>
                <p className="text-blue-700">Iron Pulse Gym &amp; CrossFit trial expires in 7 days.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex gap-3 text-xs text-blue-900">
                <div>
                  <p className="font-semibold">3 Expiring Memberships</p>
                  <p className="text-blue-700">Rahul Sharma, Priya Reddy expire within 7 days.</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3 text-xs text-amber-900">
                <div>
                  <p className="font-semibold">Pending Dues Alert</p>
                  <p className="text-amber-800">Priya Reddy has ₹2,308 balance outstanding.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}

