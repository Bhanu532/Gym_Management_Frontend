'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Badge, Table, Th, Td, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useFetch } from '@/lib/useQuery';

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string | null;
  workingHours: unknown;
  isPrimary: boolean;
  isActive: boolean;
}

interface MyTenant {
  id: string;
  name: string;
  slug: string;
}

export default function BranchManagementPage() {
  const { data: tenantData, loading: tenantLoading } = useFetch<MyTenant>('/tenants/me');
  const { data: branchData, loading, error, refetch } = useFetch<{ items?: Branch[] }>('/branches');

  const branches = branchData?.items ?? [];
  const tenantName = tenantData?.name ?? 'Your Gym';

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gym &amp; Branch Locations</h1>
          <p className="text-sm text-slate-500">
            {tenantLoading ? 'Loading your gym...' : `${tenantName} — ${branches.length} branch${branches.length === 1 ? '' : 'es'}`}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-900">
        <p className="font-semibold">Branches are managed by your SaaS platform administrator.</p>
        <p className="text-blue-700 mt-0.5">
          New branch locations are created by the GymPro support team on request. Contact support to add a new location to {tenantName}.
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Branch Locations</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => void refetch()} />
          ) : branches.length === 0 ? (
            <EmptyState
              title="No branches yet"
              description="Your gym does not have any branch locations yet. Contact your SaaS administrator to provision one."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Branch Code</Th>
                  <Th>Branch Name</Th>
                  <Th>Address</Th>
                  <Th>Contact Phone</Th>
                  <Th>Status</Th>
                  <Th>Primary</Th>
                </tr>
              </thead>
              <tbody>
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <Td className="font-mono text-xs font-bold text-blue-600">{b.code}</Td>
                    <Td className="font-bold text-slate-900">{b.name}</Td>
                    <Td className="text-xs text-slate-600">{b.address ?? '—'}</Td>
                    <Td className="font-mono text-xs">{b.phone ?? '—'}</Td>
                    <Td>
                      {b.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </Td>
                    <Td>
                      {b.isPrimary ? <Badge variant="success">Primary HQ</Badge> : <Badge variant="outline">Branch</Badge>}
                    </Td>
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

