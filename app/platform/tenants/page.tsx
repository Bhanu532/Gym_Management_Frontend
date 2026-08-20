'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { Icons } from '@/lib/navigation';

interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED' | 'ARCHIVED';
  createdAt?: string;
  subscription?: { plan?: { name?: string; priceMonthly?: string | number } } | null;
  branches?: unknown[];
  _count?: { branches?: number; members?: number; users?: number };
}

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: TenantRowStatus;
  planName: string;
  membersCount: number;
  branchesCount: number;
  mrr: number;
  createdAt: string;
}

type TenantRowStatus = ApiTenant['status'];

const PLAN_CODE: Record<string, string> = {
  'Starter Plan': 'starter',
  'Growth Plan': 'growth',
  'Enterprise Plan': 'enterprise',
};

const DEFAULT_PLAN = 'Growth Plan';

function mapTenant(t: ApiTenant): TenantRow {
  const count = t._count ?? {};
  const price = Number(t.subscription?.plan?.priceMonthly ?? 0);
  return {
    id: t.id,
    name: t.name,
    slug: t.slug,
    ownerName: t.ownerName,
    ownerEmail: t.ownerEmail,
    status: t.status,
    planName: t.subscription?.plan?.name ?? '—',
    membersCount: count.members ?? 0,
    branchesCount: count.branches ?? (Array.isArray(t.branches) ? t.branches.length : 0),
    mrr: price,
    createdAt: t.createdAt ? t.createdAt.split('T')[0] : '',
  };
}

function statusBadgeVariant(status: TenantRowStatus): 'success' | 'warning' | 'destructive' | 'outline' {
  if (status === 'ACTIVE') return 'success';
  if (status === 'TRIAL' || status === 'PAST_DUE') return 'warning';
  if (status === 'SUSPENDED' || status === 'CANCELLED' || status === 'ARCHIVED') return 'destructive';
  return 'outline';
}

export default function PlatformTenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    planName: DEFAULT_PLAN,
    initialPassword: '',
  });

  // Branch creation (SUPER_ADMIN only) — provisioned against the selected tenant.
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchTenant, setBranchTenant] = useState<TenantRow | null>(null);
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [branchFormError, setBranchFormError] = useState<string | null>(null);
  const [branchSuccess, setBranchSuccess] = useState<string | null>(null);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
  });

  // Load real tenants from the platform API (tenant source of truth is PostgreSQL).
  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ items?: ApiTenant[] }>('/platform/tenants');
      setTenants((data.items ?? []).map(mapTenant));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  // Auto-dismiss the branch-created success banner.
  useEffect(() => {
    if (!branchSuccess) return;
    const t = setTimeout(() => setBranchSuccess(null), 4000);
    return () => clearTimeout(t);
  }, [branchSuccess]);

  function planCodeFor(planName: string): string {
    return PLAN_CODE[planName] ?? 'growth';
  }

  function resetForm() {
    setNewTenant({
      name: '',
      slug: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      planName: DEFAULT_PLAN,
      initialPassword: '',
    });
    setShowPassword(false);
    setFormError(null);
  }

  function generatePassword() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const length = 14;
    const values = new Uint32Array(length);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 0xffffffff);
    }
    let password = '';
    for (let i = 0; i < length; i += 1) {
      password += charset[values[i] % charset.length];
    }
    setNewTenant((prev) => ({ ...prev, initialPassword: password }));
    setShowPassword(true);
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFormError(null);
    setSubmitting(true);
    try {
      // Provision via the real platform API. The owner's initial password is
      // hashed server-side (argon2id) and never persisted or returned in plaintext.
      await api.post('/platform/tenants', {
        name: newTenant.name.trim(),
        ownerName: newTenant.ownerName.trim(),
        ownerEmail: newTenant.ownerEmail.trim().toLowerCase(),
        ownerPhone: newTenant.ownerPhone.trim() || undefined,
        planCode: planCodeFor(newTenant.planName),
        initialPassword: newTenant.initialPassword,
      });
      resetForm();
      setModalOpen(false);
      // Refresh the list immediately so the newly created gym appears without a manual browser refresh.
      await loadTenants();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to provision tenant');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBranchCreate(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!branchTenant) return;
    setBranchFormError(null);
    setBranchSubmitting(true);
    setBranchSuccess(null);
    try {
      await api.post(`/platform/tenants/${branchTenant.id}/branches`, {
        name: newBranch.name.trim(),
        code: newBranch.code.trim(),
        address: newBranch.address.trim() || undefined,
        phone: newBranch.phone.trim() || undefined,
        email: newBranch.email.trim() || undefined,
      });
      setBranchModalOpen(false);
      setNewBranch({ name: '', code: '', address: '', phone: '', email: '' });
      setBranchSuccess(`Branch "${newBranch.name.trim()}" created under ${branchTenant.name}.`);
      await loadTenants();
    } catch (err) {
      setBranchFormError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally {
      setBranchSubmitting(false);
    }
  }

  async function toggleStatus(id: string) {
    const current = tenants.find((t) => t.id === id);
    if (!current) return;
    const next: TenantRowStatus = current.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/platform/tenants/${id}/status`, { status: next });
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tenant status');
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Tenants & Gym Accounts</h1>
          <p className="text-sm text-slate-500">Provision, audit, suspend or upgrade gym tenants across the SaaS platform</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Provision New Gym Tenant
        </Button>
      </div>

      {branchSuccess ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
          {branchSuccess}
        </div>
      ) : null}

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Gym Tenants List</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => void loadTenants()} />
          ) : tenants.length === 0 ? (
            <EmptyState title="No gym tenants yet" description="Provision a new gym tenant to get started." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Tenant Name / Slug</Th>
                  <Th>Gym Owner Contact</Th>
                  <Th>Assigned Plan</Th>
                  <Th>Branches</Th>
                  <Th>Active Members</Th>
                  <Th>MRR Revenue</Th>
                  <Th>Created</Th>
                  <Th>Status</Th>
                  <Th>Platform Actions</Th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <Td>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="font-mono text-xs text-slate-500">slug: {t.slug}</p>
                    </Td>
                    <Td>
                      <p className="font-semibold text-xs">{t.ownerName}</p>
                      <p className="font-mono text-[10px] text-slate-500">{t.ownerEmail}</p>
                    </Td>
                    <Td><Badge variant="outline" className="font-mono">{t.planName}</Badge></Td>
                    <Td>{t.branchesCount} HQ</Td>
                    <Td className="font-semibold">{t.membersCount}</Td>
                    <Td className="font-bold text-emerald-700">₹{t.mrr.toLocaleString()}</Td>
                    <Td className="text-xs text-slate-500">{t.createdAt || '—'}</Td>
                    <Td><Badge variant={statusBadgeVariant(t.status)}>{t.status}</Badge></Td>
                    <Td>
                      <div className="flex flex-col items-stretch gap-1.5 min-w-[150px]">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => router.push(`/platform/tenants/${t.id}`)}>
                          View / Manage
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setBranchTenant(t);
                            setBranchFormError(null);
                            setBranchSuccess(null);
                            setNewBranch({ name: '', code: '', address: '', phone: '', email: '' });
                            setBranchModalOpen(true);
                          }}
                        >
                          + Add Branch
                        </Button>
                        <Button
                          size="sm"
                          variant={t.status === 'ACTIVE' ? 'destructive' : 'outline'}
                          className="text-xs"
                          onClick={() => toggleStatus(t.id)}
                        >
                          {t.status === 'ACTIVE' ? 'Suspend Tenant' : 'Activate Tenant'}
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Provision New Gym Tenant Account">
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Gym Name *</label>
            <Input required value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} placeholder="Gold Classic Gym" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Owner Full Name *</label>
              <Input required value={newTenant.ownerName} onChange={(e) => setNewTenant({ ...newTenant, ownerName: e.target.value })} placeholder="Vikram Patel" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Owner Email *</label>
              <Input type="email" required value={newTenant.ownerEmail} onChange={(e) => setNewTenant({ ...newTenant, ownerEmail: e.target.value })} placeholder="owner@goldclassic.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Initial Password *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newTenant.initialPassword}
                  onChange={(e) => setNewTenant({ ...newTenant, initialPassword: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? Icons.EyeOff : Icons.Eye}
                </button>
              </div>
              <Button type="button" variant="outline" className="shrink-0" onClick={generatePassword}>
                Generate
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">
              The owner signs in with this password and can change it later from their profile/security settings.
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select SaaS Plan</label>
            <Select value={newTenant.planName} onChange={(e) => setNewTenant({ ...newTenant, planName: e.target.value })}>
              <option value="Starter Plan">Starter Plan (₹999 / mo)</option>
              <option value="Growth Plan">Growth Plan (₹2,999 / mo)</option>
              <option value="Enterprise Plan">Enterprise Plan (₹9,999 / mo)</option>
            </Select>
          </div>
          {formError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {formError}
            </p>
          ) : null}
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Provisioning...' : 'Provision Gym Tenant'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={branchModalOpen} onClose={() => setBranchModalOpen(false)} title={branchTenant ? `Add Branch — ${branchTenant.name}` : 'Add Branch'}>
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
