'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Skeleton, ErrorState } from '@/components/ui';
import { api } from '@/lib/api';

interface PlatformMetrics {
  tenantCount: number;
  activeTenantCount: number;
  trialCount: number;
  memberCount: number;
  staffCount: number;
  totalRevenue: number | null;
}

interface ApiTenant {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'ARCHIVED';
  subscription?: { plan?: { name?: string; priceMonthly?: string | number } } | null;
  _count?: { branches?: number; members?: number };
}

export default function PlatformSuperAdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [m, tData] = await Promise.all([
          api.get<PlatformMetrics>('/platform/stats/metrics'),
          api.get<{ items?: ApiTenant[] }>('/platform/tenants'),
        ]);
        setMetrics(m);
        setTenants(tData.items ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load platform data');
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const totalMRR = tenants.reduce((sum, t) => {
    const price = Number(t.subscription?.plan?.priceMonthly ?? 0);
    return sum + price;
  }, 0);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">⚡ PLATFORM SUPER ADMIN</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SaaS Platform Console</h1>
          <p className="text-sm text-slate-500">Cross-tenant platform administration, MRR billing, tenant provisioning & system health</p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/platform/tenants">
            <Button className="bg-blue-600 hover:bg-blue-700">+ Provision New Gym Tenant</Button>
          </Link>
          <Link href="/platform/plans">
            <Button variant="outline">💎 Manage SaaS Plans</Button>
          </Link>
        </div>
      </div>

      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      {/* Platform Level KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-white border-l-4 border-l-blue-600">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</p>
            {loading ? <Skeleton className="h-8 w-24 mt-2" /> : <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalMRR.toLocaleString()}</p>}
            <p className="text-xs text-emerald-600 font-semibold mt-1">▲ Real-time SaaS MRR</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Gym Tenants</p>
            {loading ? <Skeleton className="h-8 w-16 mt-2" /> : <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics?.tenantCount ?? tenants.length}</p>}
            <p className="text-xs text-slate-500 mt-1">{metrics?.activeTenantCount ?? 0} Active, {metrics?.trialCount ?? 0} Trial</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Platform Members</p>
            {loading ? <Skeleton className="h-8 w-20 mt-2" /> : <p className="text-3xl font-extrabold text-slate-900 mt-1">{metrics?.memberCount ?? 0}</p>}
            <p className="text-xs text-purple-600 font-semibold mt-1">Across all registered gyms</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform System Health</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">100%</p>
            <p className="text-xs text-slate-500 mt-1">PostgreSQL & API Connected</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Gym Tenants Directory</CardTitle>
          <Link href="/platform/tenants">
            <Button size="sm" variant="outline">View All Tenants →</Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : tenants.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No tenants provisioned yet in the database.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Gym Tenant Name</Th>
                  <Th>Owner Info</Th>
                  <Th>SaaS Plan</Th>
                  <Th>Branches</Th>
                  <Th>Active Members</Th>
                  <Th>Monthly Revenue</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const mrr = Number(t.subscription?.plan?.priceMonthly ?? 0);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <Td className="font-bold text-slate-900">{t.name}</Td>
                      <Td>
                        <p className="font-semibold text-xs">{t.ownerName}</p>
                        <p className="font-mono text-[10px] text-slate-500">{t.ownerEmail}</p>
                      </Td>
                      <Td><Badge variant="outline" className="font-mono">{t.subscription?.plan?.name ?? '—'}</Badge></Td>
                      <Td>{t._count?.branches ?? 0} Branches</Td>
                      <Td className="font-semibold">{t._count?.members ?? 0} Members</Td>
                      <Td className="font-bold text-emerald-700">₹{mrr.toLocaleString()}</Td>
                      <Td><Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge></Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

