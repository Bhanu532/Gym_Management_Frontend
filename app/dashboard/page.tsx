'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppShell } from '@/components/AppShell';
import { Badge, Button, Card, CardContent, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import { api, useAuth } from '@/lib/api';

type RangeKey = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';
type Tone = 'blue' | 'emerald' | 'amber' | 'red' | 'slate';

interface Metric { value?: number; total?: number; count?: number; changePct?: number | null; currency?: string }
interface AttentionItem { id: string; title: string; count?: number; href: string; type?: 'error' | 'warning' | 'info' }
interface ActivityItem { id: string; title: string; timestamp?: string; user?: string }
interface DashboardOverview {
  kpis?: Record<string, Metric>;
  cards?: Record<string, number | { count?: number; total?: number }>;
  dailyRevenue?: Array<{ date: string; revenue: number }>;
  revenueChart?: Array<{ date?: string; period?: string; revenue: number }>;
  revenue?: Array<{ period: string; revenue: number; payments: number; refunds: number; net: number }>;
  attendance?: { totalCheckedInToday?: number; currentlyInside?: number; peakTimeWindow?: string; attendanceRatePct?: number };
  attention?: AttentionItem[];
  activity?: ActivityItem[];
  recentActivity?: ActivityItem[];
}

const ranges: Array<{ value: RangeKey; label: string }> = [
  { value: 'TODAY', label: 'Today' }, { value: 'THIS_WEEK', label: 'This week' },
  { value: 'THIS_MONTH', label: 'This month' }, { value: 'LAST_MONTH', label: 'Last month' },
];
const financeRoles = new Set(['OWNER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN']);

function Icon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    check: <path d="m5 12 4 4L19 6" />, wallet: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M16 12h2M3 9h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    userPlus: <><path d="M15 19v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.9-4M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14.9 4M20 19v-4h-4" /></>,
    alert: <><path d="M10.3 4.3 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-9" /><path d="M15 6h6v6" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>, plus: <path d="M12 5v14M5 12h14" />,
    receipt: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z" /><path d="M8 8h8M8 12h8" /></>,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 12h8" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatCurrency(value: number, currency = '₹') { return `${currency}${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`; }
function metricValue(metric: Metric | undefined) { return metric?.value ?? metric?.total ?? metric?.count ?? 0; }
function Change({ change, inverse = false }: { change?: number | null; inverse?: boolean }) {
  if (change === null || change === undefined || Number.isNaN(change)) return <span className="text-[11px] font-medium text-slate-400">No comparison data</span>;
  const favorable = inverse ? change <= 0 : change >= 0;
  return <span className={`text-[11px] font-semibold ${favorable ? 'text-emerald-700' : 'text-red-600'}`}>{change > 0 ? '+' : ''}{change.toFixed(1)}% <span className="font-medium text-slate-400">vs previous period</span></span>;
}
function KpiCard({ label, metric, icon, tone = 'blue', currency, inverse, featured = false }: { label: string; metric?: Metric; icon: string; tone?: Tone; currency?: boolean; inverse?: boolean; featured?: boolean }) {
  const colors: Record<Tone, string> = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600', slate: 'bg-slate-100 text-slate-600' };
  const value = metricValue(metric);
  if (featured) return <Card className="relative overflow-hidden border-slate-950 bg-slate-950 shadow-none transition-colors hover:border-blue-600 sm:col-span-2"><span className="absolute inset-y-0 left-0 w-1 bg-blue-500" /><CardContent className="relative p-4 pl-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-200">{label}</p><p className="mt-1 text-[11px] font-medium text-slate-400">Collection pulse</p></div><span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white"><Icon name={icon} /></span></div><p className="mt-3 text-3xl font-bold tracking-tight text-white">{currency ? formatCurrency(value, metric?.currency) : value.toLocaleString('en-IN')}</p><div className="mt-1.5 min-h-4"><Change change={metric?.changePct} inverse={inverse} /></div></CardContent></Card>;
  return <Card className="border-slate-200 shadow-none transition-colors hover:border-slate-300"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[0.09em] text-slate-500">{label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-md ${colors[tone]}`}><Icon name={icon} /></span></div><p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{currency ? formatCurrency(value, metric?.currency) : value.toLocaleString('en-IN')}</p><div className="mt-1.5 min-h-4"><Change change={metric?.changePct} inverse={inverse} /></div></CardContent></Card>;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [range, setRange] = useState<RangeKey>('THIS_MONTH');
  const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const isFinanceUser = financeRoles.has(user?.role ?? 'OWNER_ADMIN');
  const selectedBranch = branchId || (user?.branchIds?.length === 1 ? user.branchIds[0] : '');
  const customRangeIncomplete = range === 'CUSTOM' && (!from || !to);

  const fetchOverview = useCallback(async () => {
    if (range === 'CUSTOM' && (!from || !to)) { setLoading(false); return; }
    setLoading(true); setError(null);
    const query = new URLSearchParams({ range });
    if (range === 'CUSTOM') { query.set('from', from); query.set('to', to); }
    if (selectedBranch) query.set('branchId', selectedBranch);
    try { setOverview(await api.get<DashboardOverview>(`/dashboard/overview?${query.toString()}`)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load dashboard data.'); }
    finally { setLoading(false); }
  }, [from, range, selectedBranch, to]);
  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const kpis = useMemo<Record<string, Metric>>(() => {
    const cards = overview?.cards ?? {};
    const fromCard = (key: string): Metric => { const item = cards[key]; return typeof item === 'number' ? { value: item } : item ?? {}; };
    return {
      activeMembers: overview?.kpis?.activeMembers ?? fromCard('activeMembers'), todayCheckIns: overview?.kpis?.todayCheckIns ?? fromCard('todayCheckIns'), monthlyRevenue: overview?.kpis?.revenue ?? overview?.kpis?.monthlyRevenue ?? fromCard('monthlyRevenue'), expiringMemberships: overview?.kpis?.expiringMemberships ?? fromCard('expiringMemberships'), newMembers: overview?.kpis?.newMembers ?? fromCard('newMembers'), renewals: overview?.kpis?.renewals ?? fromCard('renewals'), outstandingDues: overview?.kpis?.outstandingDues ?? fromCard('pendingDues'), netProfit: overview?.kpis?.netProfit ?? fromCard('profit'),
    };
  }, [overview]);
  const chartData = (overview?.revenue ?? overview?.dailyRevenue ?? overview?.revenueChart ?? []).map((item) => ({ ...item, label: 'date' in item && item.date ? new Date(`${item.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ('period' in item ? item.period ?? '' : '') }));
  const attention = overview?.attention ?? []; const activity = overview?.activity ?? overview?.recentActivity ?? [];
  const permissions = user?.permissions; const can = (permission: string) => !permissions || permissions.includes('*') || permissions.includes(permission);
  const quickActions = [
    { href: '/members/new', label: 'Add member', description: 'Create a member profile', icon: 'userPlus', permission: 'members.create' }, { href: '/attendance', label: 'Check in member', description: 'Open the front desk', icon: 'scan', permission: 'attendance.create' }, { href: '/billing', label: 'Record payment', description: 'Add a payment receipt', icon: 'receipt', permission: 'payments.create' }, { href: '/leads', label: 'Manage leads', description: 'Follow up with prospects', icon: 'plus', permission: 'leads.manage' },
  ].filter((action) => can(action.permission));
  const visibleCards = isFinanceUser ? [
    ['Active members', 'activeMembers', 'users', 'blue'], ["Today's check-ins", 'todayCheckIns', 'check', 'emerald'], ['Revenue', 'monthlyRevenue', 'wallet', 'blue', true], ['Expiring soon', 'expiringMemberships', 'clock', 'amber', false, true], ['New members', 'newMembers', 'userPlus', 'blue'], ['Renewals', 'renewals', 'refresh', 'emerald'], ['Outstanding dues', 'outstandingDues', 'alert', 'red', true, true], ['Net profit', 'netProfit', 'trend', 'emerald', true],
  ] as const : [
    ['Active members', 'activeMembers', 'users', 'blue'], ["Today's check-ins", 'todayCheckIns', 'check', 'emerald'], ['Expiring soon', 'expiringMemberships', 'clock', 'amber', false, true], ['New members', 'newMembers', 'userPlus', 'blue'], ['Renewals', 'renewals', 'refresh', 'emerald'],
  ] as const;

  return <AppShell><main className="-m-4 w-auto space-y-5 p-4 md:-m-8 md:p-5 xl:p-6">
    <header className="border-b border-slate-200 pb-5"><div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Operations overview</p><span className="text-xs text-slate-400">Live workspace</span></div><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Good morning, {user?.name?.split(' ')[0] ?? 'there'}.</h1><p className="mt-1 text-sm text-slate-500">Daily performance, member health, and the work that needs attention.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Date range">{ranges.map((option) => <button key={option.value} type="button" onClick={() => setRange(option.value)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${range === option.value ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>{option.label}</button>)}<button type="button" onClick={() => setRange('CUSTOM')} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${range === 'CUSTOM' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}>Custom</button></div>{user?.branchIds && user.branchIds.length > 1 ? <select aria-label="Branch" value={branchId} onChange={(event) => setBranchId(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"><option value="">All branches</option>{user.branchIds.map((id) => <option key={id} value={id}>{id}</option>)}</select> : null}</div></div>{range === 'CUSTOM' ? <div className="mt-4 border-t border-slate-100 pt-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><label className="grid gap-1 text-xs font-semibold text-slate-600">Start date<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-9 w-full sm:w-40" /></label><label className="grid gap-1 text-xs font-semibold text-slate-600">End date<Input type="date" min={from || undefined} value={to} onChange={(event) => setTo(event.target.value)} className="h-9 w-full sm:w-40" /></label><Button size="sm" onClick={fetchOverview} disabled={customRangeIncomplete}>Apply range</Button></div>{customRangeIncomplete ? <p role="status" className="mt-2 text-xs font-medium text-amber-700">Select both dates to load a custom range. The last applied dashboard is still shown below.</p> : null}</div> : null}</div></header>
    {error ? <ErrorState message={error} onRetry={fetchOverview} /> : <>
      <section aria-label="Key performance indicators" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{loading || authLoading ? Array.from({ length: isFinanceUser ? 8 : 5 }).map((_, index) => <Card key={index} className="border-slate-200 shadow-none"><CardContent className="p-4"><Skeleton className="h-3 w-24" /><Skeleton className="mt-5 h-7 w-28" /><Skeleton className="mt-3 h-3 w-36" /></CardContent></Card>) : visibleCards.map(([label, key, icon, tone, currency, inverse]) => <KpiCard key={key} label={label} metric={kpis[key]} icon={icon} tone={tone as Tone} currency={currency} inverse={inverse} featured={isFinanceUser && key === 'monthlyRevenue'} />)}</section>
      <section className={`grid gap-5 ${isFinanceUser ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>{isFinanceUser ? <Card className="border-slate-200 shadow-none xl:col-span-2"><CardContent className="p-0"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Revenue trend</h2><p className="mt-0.5 text-xs text-slate-500">Successful payments across the selected period</p></div><span className="text-xs font-semibold text-slate-500">{range === 'CUSTOM' ? 'Custom range' : ranges.find((item) => item.value === range)?.label}</span></div><div className="h-72 p-4">{loading ? <Skeleton className="h-full w-full" /> : chartData.length === 0 ? <EmptyState title="No revenue data for this period" description="Payments recorded in this range will appear here." /> : <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(value) => `₹${Number(value) / 1000}k`} /><Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} labelStyle={{ color: '#0f172a' }} contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 8px 24px rgb(15 23 42 / 0.08)' }} /><Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.25} fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer>}</div></CardContent></Card> : null}
      <Card className="border-slate-200 shadow-none"><CardContent className="p-0"><div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold text-slate-950">Today&apos;s attendance</h2><p className="mt-0.5 text-xs text-slate-500">Current floor activity</p></div><Badge variant="success" className="border-0 text-[10px]">Live</Badge></div></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-20 w-full" /><Skeleton className="h-16 w-full" /></div> : <div className="p-5"><div className="flex items-end justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Checked in</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{overview?.attendance?.totalCheckedInToday?.toLocaleString() ?? '—'}</p></div><Link className="text-xs font-semibold text-blue-600 hover:text-blue-700" href="/attendance">Open desk →</Link></div><dl className="mt-4 grid grid-cols-2 gap-3"><div className="border-l-2 border-blue-600 pl-3"><dt className="text-[11px] font-medium text-slate-500">Currently inside</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{overview?.attendance?.currentlyInside?.toLocaleString() ?? '—'}</dd></div><div className="border-l-2 border-emerald-500 pl-3"><dt className="text-[11px] font-medium text-slate-500">Attendance rate</dt><dd className="mt-1 text-lg font-semibold text-slate-950">{overview?.attendance?.attendanceRatePct !== undefined ? `${overview.attendance.attendanceRatePct}%` : '—'}</dd></div></dl><div className="mt-4 rounded-md bg-slate-50 px-3 py-2.5"><p className="text-[11px] font-medium text-slate-500">Peak window</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{overview?.attendance?.peakTimeWindow ?? 'No check-in pattern yet'}</p></div></div>}</CardContent></Card></section>
      <section className="grid gap-5 xl:grid-cols-3"><Card className="border-slate-200 shadow-none xl:col-span-2"><CardContent className="p-0"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Needs attention</h2><p className="mt-0.5 text-xs text-slate-500">Prioritized work queues for your team</p></div><Icon name="alert" className="h-5 w-5 text-amber-500" /></div><div className="p-3">{loading ? <div className="space-y-2"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></div> : attention.length === 0 ? <EmptyState title="All caught up" description="There are no operational items needing follow-up." /> : <div className="divide-y divide-slate-100">{attention.map((item) => { const color = item.type === 'error' ? 'bg-red-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'; return <Link key={item.id} href={item.href} className="flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors hover:bg-slate-50"><span className="flex min-w-0 items-center gap-3"><i className={`h-2 w-2 shrink-0 rounded-full ${color}`} /><span className="truncate text-sm font-medium text-slate-800">{item.title}</span></span><span className="flex shrink-0 items-center gap-2"><span className="text-sm font-bold text-slate-950">{item.count ?? '—'}</span><Icon name="arrow" className="h-4 w-4 text-slate-400" /></span></Link>; })}</div>}</div></CardContent></Card><Card className="border-slate-200 shadow-none"><CardContent className="p-0"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-950">Quick actions</h2><p className="mt-0.5 text-xs text-slate-500">Based on your access</p></div><div className="p-3">{quickActions.length === 0 ? <EmptyState title="No actions available" description="Ask an admin to update your permissions." /> : quickActions.map((action) => <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-blue-50"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600"><Icon name={action.icon} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-800">{action.label}</span><span className="block truncate text-[11px] text-slate-500">{action.description}</span></span><Icon name="arrow" className="h-4 w-4 text-slate-400" /></Link>)}</div></CardContent></Card></section>
      <section><Card className="border-slate-200 shadow-none"><CardContent className="p-0"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-slate-950">Recent activity</h2><p className="mt-0.5 text-xs text-slate-500">Latest member and operational events</p></div><Link className="text-xs font-semibold text-blue-600 hover:text-blue-700" href="/audit">View audit log</Link></div>{loading ? <div className="space-y-3 p-5"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div> : activity.length === 0 ? <div className="p-5"><EmptyState title="No recent activity" description="New events will be listed here as they happen." /></div> : <div className="divide-y divide-slate-100">{activity.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5"><div className="flex min-w-0 items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" /><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{item.title}</p>{item.user ? <p className="mt-0.5 text-xs text-slate-500">{item.user}</p> : null}</div></div><time className="shrink-0 text-xs text-slate-500">{item.timestamp ?? 'Just now'}</time></div>)}</div>}</CardContent></Card></section>
    </>}
  </main></AppShell>;
}
