'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select, Textarea, LoadingState, ErrorState, EmptyState } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

interface Lead {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  source: string;
  status: string;
  interest?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  branch?: { id: string; name: string } | null;
  createdAt?: string | null;
}

function fmtCreated(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

export default function LeadsCRMPage() {
  const { data, loading, error, refetch } = useFetch<{ items: Lead[] }>('/leads');
  const leads = data?.items ?? [];
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [newLeadModal, setNewLeadModal] = useState(false);
  const [convertModal, setConvertModal] = useState<Lead | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    mobile: '',
    email: '',
    source: 'WALK_IN' as const,
    interest: 'Personal Training',
    notes: '',
  });

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const branchRes = await api.get<{ items: Array<{ id: string }> }>('/branches');
      const branchId = branchRes.items?.[0]?.id;
      if (!branchId) {
        setFormError('No active branch found. Please ask your administrator to create a branch.');
        setSubmitting(false);
        return;
      }
      await api.post('/leads', {
        name: newLeadData.name.trim(),
        mobile: newLeadData.mobile,
        email: newLeadData.email || undefined,
        source: newLeadData.source,
        interest: newLeadData.interest || undefined,
        notes: newLeadData.notes || undefined,
        branchId,
      });
      setNewLeadModal(false);
      setNewLeadData({ name: '', mobile: '', email: '', source: 'WALK_IN', interest: 'Personal Training', notes: '' });
      void refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Array<{ status: Lead['status']; label: string; color: string }> = [
    { status: 'NEW', label: 'New Enquiries', color: 'border-l-blue-500 bg-blue-50/30' },
    { status: 'CONTACTED', label: 'Contacted', color: 'border-l-purple-500 bg-purple-50/30' },
    { status: 'TRIAL_SCHEDULED', label: 'Trial Booked', color: 'border-l-amber-500 bg-amber-50/30' },
    { status: 'FOLLOW_UP', label: 'Follow Up', color: 'border-l-indigo-500 bg-indigo-50/30' },
    { status: 'CONVERTED', label: 'Converted', color: 'border-l-emerald-500 bg-emerald-50/30' },
    { status: 'LOST', label: 'Lost Lead', color: 'border-l-rose-500 bg-rose-50/30' },
  ];

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads & CRM Pipeline</h1>
          <p className="text-sm text-slate-500">Track prospects, follow-ups, trial bookings & member conversion</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border bg-white p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              📋 Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              📑 Data Table
            </button>
          </div>

          <Button onClick={() => setNewLeadModal(true)} className="bg-blue-600 hover:bg-blue-700">
            + Register Lead
          </Button>
        </div>
      </div>

      {/* Pipeline */}
      {loading ? (
        <LoadingState rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : leads.length === 0 ? (
        <EmptyState title="No leads yet" description="Register your first lead enquiry to start building the pipeline." />
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {columns.map((col) => {
            const items = leads.filter((l) => l.status === col.status);
            return (
              <div key={col.status} className="flex flex-col rounded-xl border bg-white p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.label}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">{items.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {items.map((lead) => (
                    <div key={lead.id} className={`p-3 rounded-lg border-l-4 ${col.color} border bg-white shadow-xs hover:shadow-md transition-shadow space-y-2`}>
                      <div className="flex items-start justify-between">
                        <p className="font-bold text-sm text-slate-900">{lead.name}</p>
                        <Badge variant="outline" className="text-[9px] uppercase">{lead.source.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-mono">{lead.mobile}</p>
                      {lead.interest && <p className="text-[11px] text-blue-700 font-medium">{lead.interest}</p>}
                      <p className="text-[11px] text-slate-500 line-clamp-2">{lead.notes}</p>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">{fmtCreated(lead.createdAt)}</span>
                        {lead.status !== 'CONVERTED' && (
                          <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 text-emerald-700 border-emerald-300" onClick={() => setConvertModal(lead)}>
                            Convert →
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white">
          <CardHeader><CardTitle>All Enquiries & Leads</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Source</Th>
                  <Th>Interest</Th>
                  <Th>Follow Up</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <Td className="font-semibold">{l.name}</Td>
                    <Td>{l.mobile}</Td>
                    <Td><Badge variant="secondary">{l.source}</Badge></Td>
                    <Td>{l.interest}</Td>
                    <Td className="text-xs text-slate-500">{l.followUpDate ?? 'Not set'}</Td>
                    <Td><Badge variant={l.status === 'CONVERTED' ? 'success' : 'default'}>{l.status}</Badge></Td>
                    <Td>
                      {l.status !== 'CONVERTED' && (
                        <Button size="sm" variant="outline" onClick={() => setConvertModal(l)}>Convert to Member</Button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={newLeadModal} onClose={() => setNewLeadModal(false)} title="Register New Lead Enquiry">
        <form onSubmit={handleCreateLead} className="space-y-4">
          {formError && <p className="text-xs text-rose-600 font-semibold">{formError}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Prospect Full Name *</label>
            <Input required value={newLeadData.name} onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })} placeholder="Amit Patel" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Mobile Number *</label>
              <Input required value={newLeadData.mobile} onChange={(e) => setNewLeadData({ ...newLeadData, mobile: e.target.value })} placeholder="+91 98765 00000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Lead Source</label>
              <Select value={newLeadData.source} onChange={(e) => setNewLeadData({ ...newLeadData, source: e.target.value as any })}>
                <option value="WALK_IN">Walk-in Visit</option>
                <option value="PHONE">Phone Call</option>
                <option value="WEBSITE">Website Form</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="REFERRAL">Member Referral</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Program Interest</label>
            <Input value={newLeadData.interest} onChange={(e) => setNewLeadData({ ...newLeadData, interest: e.target.value })} placeholder="Personal Training / Group Class" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Enquiry Notes</label>
            <Textarea value={newLeadData.notes} onChange={(e) => setNewLeadData({ ...newLeadData, notes: e.target.value })} placeholder="Details discussed..." />
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save Lead Record'}
          </Button>
        </form>
      </Modal>

      {/* Convert Lead Modal */}
      <Modal isOpen={!!convertModal} onClose={() => setConvertModal(null)} title={`Convert Lead to Member — ${convertModal?.name}`}>
        <div className="space-y-4">
          <p className="text-xs text-slate-600">This will automatically transfer prospect data into the Member Onboarding wizard.</p>
          <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs">
            <p className="font-bold">{convertModal?.name}</p>
            <p>{convertModal?.mobile}</p>
            <p className="text-blue-700">Interest: {convertModal?.interest}</p>
          </div>
          <Link href="/members/new">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setConvertModal(null)}>
              🚀 Proceed to Full Member Registration & Invoice
            </Button>
          </Link>
        </div>
      </Modal>
    </AppShell>
  );
}