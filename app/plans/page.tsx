'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input, Select, LoadingState, ErrorState, EmptyState } from '@/components/ui';

interface Plan {
  id: string;
  name: string;
  description?: string | null;
  durationValue: number;
  durationUnit: string;
  price: number;
  joiningFee: number;
  taxPercent: number;
  ptSessionsIncluded: number;
  classAccess: boolean;
  allBranchAccess: boolean;
  freezeAllowed: boolean;
  maxFreezeDays: number;
}

interface RawPlan extends Omit<Plan, 'price' | 'joiningFee' | 'taxPercent'> {
  price: number | string;
  joiningFee: number | string;
  taxPercent: number | string;
}

/** The API serializes Decimal columns as strings; normalize to numbers for display/form. */
function normalizePlan(raw: RawPlan): Plan {
  return { ...raw, price: Number(raw.price), joiningFee: Number(raw.joiningFee), taxPercent: Number(raw.taxPercent) };
}

const EMPTY_FORM = {
  name: '',
  description: '',
  durationValue: '1',
  durationUnit: 'MONTHS',
  price: '',
  joiningFee: '0',
  taxPercent: 18,
  ptSessionsIncluded: 0,
  classAccess: false,
  allBranchAccess: false,
  freezeAllowed: true,
  maxFreezeDays: 20,
};

import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function MembershipPlansPage() {
  const { data, loading, error, refetch } = useFetch<{ items: RawPlan[] }>('/memberships/plans');
  const plans = (data?.items ?? []).map(normalizePlan);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(plan: Plan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      durationValue: String(plan.durationValue),
      durationUnit: plan.durationUnit,
      price: String(plan.price),
      joiningFee: String(plan.joiningFee),
      taxPercent: plan.taxPercent,
      ptSessionsIncluded: plan.ptSessionsIncluded,
      classAccess: plan.classAccess,
      allBranchAccess: plan.allBranchAccess,
      freezeAllowed: plan.freezeAllowed,
      maxFreezeDays: plan.maxFreezeDays,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const durationValue = Number(form.durationValue || 1);
    if (!form.name.trim()) {
      setFormError('Plan name is required.');
      setSubmitting(false);
      return;
    }
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      setFormError('Duration value must be greater than 0.');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      durationValue,
      durationUnit: form.durationUnit,
      price: Number(form.price || 0),
      joiningFee: Number(form.joiningFee || 0),
      taxPercent: Number(form.taxPercent || 0),
      ptSessionsIncluded: Number(form.ptSessionsIncluded || 0),
      classAccess: Boolean(form.classAccess),
      allBranchAccess: Boolean(form.allBranchAccess),
      freezeAllowed: Boolean(form.freezeAllowed),
      maxFreezeDays: Number(form.maxFreezeDays || 0),
    };

    try {
      if (editingId) {
        await api.patch('/memberships/plans/' + editingId, payload);
      } else {
        await api.post('/memberships/plans', payload);
      }
      setModalOpen(false);
      setEditingId(null);
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Plan could not be ' + (editingId ? 'updated' : 'created') + '.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership Plans Catalog</h1>
          <p className="text-sm text-slate-500">Define pricing tiers, entitlements, tax rules, PT session bundles & freeze policies</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          + Create New Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow relative overflow-hidden">
            <div className="h-2 bg-blue-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <Badge variant="outline">{p.durationValue} {p.durationUnit}</Badge>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900">₹{p.price.toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium"> + {p.taxPercent}% GST</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2 text-xs">
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Joining Fee:</span>
                  <span className="font-semibold text-slate-800">₹{p.joiningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Included PT Sessions:</span>
                  <span className="font-semibold text-blue-600">{p.ptSessionsIncluded} Sessions</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Group Class Access:</span>
                  <span>{p.classAccess ? '✅ Included' : '❌ Not Included'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Multi-Branch Access:</span>
                  <span>{p.allBranchAccess ? '🌐 All Branches' : '📍 Single Branch'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Freeze Allowance:</span>
                  <span>{p.freezeAllowed ? `Up to ${p.maxFreezeDays} Days` : 'Not allowed'}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={() => openEdit(p)}>
                    Edit Plan
                  </Button>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Builder Modal (Create / Edit) */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Membership Plan' : 'Create Custom Membership Plan'}>
        <form onSubmit={handleSavePlan} className="space-y-4">
          {formError && <p className="text-xs text-rose-600 font-semibold">{formError}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Plan Name *</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Half-Yearly Transformation Plan" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Description</label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short plan description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Duration Value</label>
              <Input type="number" value={form.durationValue} onChange={(e) => setForm({ ...form, durationValue: e.target.value })} placeholder="ex: 6" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Duration Unit</label>
              <Select value={form.durationUnit} onChange={(e) => setForm({ ...form, durationUnit: e.target.value })}>
                <option value="MONTHS">Months</option>
                <option value="DAYS">Days</option>
                <option value="YEARS">Years</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Price (₹) *</label>
              <Input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="ex: 7999" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Joining Fee (₹)</label>
              <Input type="number" value={form.joiningFee} onChange={(e) => setForm({ ...form, joiningFee: e.target.value })} placeholder="ex: 500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Tax (GST %) </label>
              <Input type="number" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })} placeholder="ex: 18" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Included PT Sessions</label>
              <Input type="number" value={form.ptSessionsIncluded} onChange={(e) => setForm({ ...form, ptSessionsIncluded: Number(e.target.value) })} placeholder="ex: 4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Freeze Allowed</label>
              <Select value={form.freezeAllowed ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, freezeAllowed: e.target.value === 'yes' })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Max Freeze Days</label>
              <Input type="number" value={form.maxFreezeDays} onChange={(e) => setForm({ ...form, maxFreezeDays: Number(e.target.value) })} placeholder="ex: 20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Group Class Access</label>
              <Select value={form.classAccess ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, classAccess: e.target.value === 'yes' })}>
                <option value="yes">Included</option>
                <option value="no">Not Included</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Multi-Branch Access</label>
              <Select value={form.allBranchAccess ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, allBranchAccess: e.target.value === 'yes' })}>
                <option value="yes">All Branches</option>
                <option value="no">Single Branch</option>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Save Membership Plan'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}