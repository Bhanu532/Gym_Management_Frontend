'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Table, Th, Td, Badge, Button, Skeleton, ErrorState } from '@/components/ui';
import { api } from '@/lib/api';

interface SubscriptionItem {
  id: string;
  tenant: { id: string; name: string; status: string };
  plan: { id: string; code: string; name: string; priceMonthly: string | number };
  billingCycle: string;
  currentPeriodEnd: string;
}

export default function PlatformSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscriptions() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<{ subscriptions?: SubscriptionItem[] }>('/platform/stats/subscriptions');
        setSubscriptions(data.subscriptions ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    }
    void loadSubscriptions();
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenant SaaS Subscriptions & MRR</h1>
          <p className="text-sm text-slate-500">Monitor tenant recurring billing, renewal dates, past due statuses & upgrades</p>
        </div>
      </div>

      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No subscriptions found in the database.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Tenant Name</Th>
                  <Th>Plan</Th>
                  <Th>Billing Cycle</Th>
                  <Th>MRR Revenue</Th>
                  <Th>Renewal Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <Td className="font-bold text-slate-900">{s.tenant.name}</Td>
                    <Td><Badge variant="outline" className="font-mono">{s.plan.name}</Badge></Td>
                    <Td className="text-xs">{s.billingCycle ?? 'MONTHLY'}</Td>
                    <Td className="font-bold text-emerald-700">₹{Number(s.plan.priceMonthly).toLocaleString()}</Td>
                    <Td className="text-xs text-slate-600">{s.currentPeriodEnd ? s.currentPeriodEnd.split('T')[0] : '—'}</Td>
                    <Td><Badge variant={s.tenant.status === 'ACTIVE' ? 'success' : 'warning'}>{s.tenant.status}</Badge></Td>
                    <Td><Button size="sm" variant="outline">Change Plan</Button></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

