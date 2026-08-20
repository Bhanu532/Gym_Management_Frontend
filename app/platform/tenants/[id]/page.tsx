'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

interface ApiTenantDetail {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'ARCHIVED';
  createdAt?: string;
  subscription?: { plan?: { name?: string; priceMonthly?: string | number } } | null;
  usage?: { memberCount?: number; branchCount?: number } | null;
  branches?: unknown[];
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  status: ApiTenantDetail['status'];
  planName?: string;
  mrr: number;
  membersCount: number;
  branchesCount: number;
  createdAt?: string;
}

function mapTenant(t: ApiTenantDetail): TenantDetail {
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    ownerName: t.ownerName,
    ownerEmail: t.ownerEmail,
    ownerPhone: t.ownerPhone,
    status: t.status,
    planName: t.subscription?.plan?.name ?? '—',
    mrr: Number(t.subscription?.plan?.priceMonthly ?? 0),
    membersCount: t.usage?.memberCount ?? 0,
    branchesCount: t.usage?.branchCount ?? (Array.isArray(t.branches) ? t.branches.length : 0),
    createdAt: t.createdAt,
  };
}

interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

function statusBadgeVariant(status: TenantDetail['status']): 'success' | 'warning' | 'destructive' | 'outline' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'TRIAL' || status === 'PAST_DUE') return 'warning';
  if (status === 'SUSPENDED' || status === 'CANCELLED' || status === 'ARCHIVED') return 'destructive';
  return 'outline';
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenantApi, loading: tenantLoading, error: tenantError } = useFetch<ApiTenantDetail>(id ? `/platform/tenants/${id}` : null);
  const tenant: TenantDetail | null = tenantApi ? mapTenant(tenantApi) : null;
  const { data: branchData, loading: branchLoading, error: branchError, refetch: refetchBranches } = useFetch<{ items?: Branch[] }>(id ? `/platform/tenants/${id}/branches` : null);

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchFormError, setBranchFormError] = useState<string | null>(null);
  const [branchSuccess, setBranchSuccess] = useState<string | null>(null);
  const [newBranch, setNewBranch] = useState({ name: '', code: '', address: '', phone: '', email: '' });

  // Auto-dismiss the branch-created success banner.
  useEffect(() => {
    if (!branchSuccess) return;
    const t = setTimeout(() => setBranchSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [branchSuccess]);

  const branches = branchData?.items ?? [];

  async function handleBranchCreate(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    setBranchFormError(null);
    setBranchSubmitting(true);
    try {
      await api.post(`/platform/tenants/${id}/branches`, {
        name: newBranch.name.trim(),
        code: newBranch.code.trim(),
        address: newBranch.address.trim() || undefined,
        phone: newBranch.phone.trim() || undefined,
        email: newBranch.email.trim() || undefined,
      });
      setBranchModalOpen(false);
      setNewBranch({ name: '', code: '', address: '', phone: '', email: '' });
      setBranchSuccess(`Branch "${newBranch.name.trim()}" created.`);
      await refetchBranches();
    } catch (err) {
      setBranchFormError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally {
      setBranchSubmitting(false);
    }
  }

  if (tenantLoading) {
    return (
      <AppShell>
        <div className="space-y-2"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
      </AppShell>
    );
  }

  if (tenantError) {
    return (
      <AppShell>
        <ErrorState message={tenantError} onRetry={() => undefined} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{tenant?.name}</h1>
        <p className="text-sm text-slate-500">Tenant overview &amp; physical branch management</p>
      </div>

      {branchSuccess ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          {branchSuccess}
        </div>
      ) : null}
      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Gym Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div><p className="text-xs font-semibold text-slate-500">Status</p><Badge variant={statusBadgeVariant(tenant?.status ?? 'TRIAL')}>{tenant?.status ?? 'TRIAL'}</Badge></div>
            <div><p className="text-xs font-semibold text-slate-500">Plan</p><p className="font-semibold">{tenant?.planName ?? '—'}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">Owner</p><p className="font-semibold">{tenant?.ownerName}</p><p className="font-mono text-[10px] text-slate-500">{tenant?.ownerEmail}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">Phone</p><p className="text-sm">{tenant?.ownerPhone ?? '—'}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">Branches</p><p className="text-sm font-semibold">{tenant?.branchesCount ?? 0}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">Active Members</p><p className="text-sm font-semibold">{tenant?.membersCount ?? 0}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">MRR</p><p className="text-sm font-bold text-emerald-700">₹{(tenant?.mrr ?? 0).toLocaleString()}</p></div>
            <div><p className="text-xs font-semibold text-slate-500">Created</p><p className="text-sm">{tenant?.createdAt ? tenant.createdAt.split('T')[0] : '—'}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4 mb-4 mt-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Branches</h2>
          <p className="text-sm text-slate-500">Physical locations under this gym tenant</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setBranchFormError(null); setBranchSuccess(null); setNewBranch({ name: '', code: '', address: '', phone: '', email: '' }); setBranchModalOpen(true); }}>
          + Add Branch
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4"><CardTitle>Branch Locations</CardTitle></CardHeader>
        <CardContent className="pt-4">
          {branchLoading ? (
            <div className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          ) : branchError ? (
            <ErrorState message={branchError} onRetry={() => void refetchBranches()} />
          ) : branches.length === 0 ? (
            <EmptyState title="No branches yet" description="No branch locations have been created for this tenant. Use Add Branch to create the first location." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Branch Code</Th>
                  <Th>Branch Name</Th>
                  <Th>Address</Th>
                  <Th>Phone</Th>
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
                    <Td>{b.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</Td>
                    <Td>{b.isPrimary ? <Badge variant="success">Primary HQ</Badge> : <Badge variant="outline">Branch</Badge>}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)} title="Add Branch">
        <form onSubmit={handleBranchCreate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Branch Name *</label>
            <Input required value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} placeholder="ex: Koramangala Branch" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Branch Code *</label>
              <Input required value={newBranch.code} onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })} placeholder="ex: BR-002" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Phone</label>
              <Input value={newBranch.phone} onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })} placeholder="ex: +91 98000 12345" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Address</label>
            <Input value={newBranch.address} onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })} placeholder="ex: 24, 100 Feet Road, Koramangala, Bengaluru" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Contact Email</label>
            <Input type="email" value={newBranch.email} onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })} placeholder="ex: koramangala@powerhouse.com" />
          </div>
          {branchFormError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {branchFormError}
            </p>
          ) : null}
          <Button type="submit" disabled={branchSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {branchSubmitting ? 'Creating branch...' : 'Create Branch'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}

