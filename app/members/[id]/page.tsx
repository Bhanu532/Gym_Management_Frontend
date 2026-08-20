'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, Table, Th, Td, Modal, LoadingState, ErrorState } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

interface MemberDetail {
  id: string;
  memberCode: string;
  name: string;
  mobile: string;
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  address?: string | null;
  fitnessGoals?: string | null;
  status: string;
  joinedAt?: string | null;
  qrCode?: string | null;
  branch?: { id: string; name: string } | null;
  healthProfile?: { heightCm?: number | string | null; weightKg?: number | string | null; medicalNotes?: string | null; injuryNotes?: string | null } | null;
  emergencyContact?: { name?: string | null; relation?: string | null; phone?: string | null } | null;
  memberships: Array<{ id: string; planNameSnapshot?: string | null; startDate: string; expiryDate: string; status: string; plan?: { name: string; price: number | string } | null }>;
  invoices: Array<{ id: string; invoiceNumber: string; createdAt: string; grandTotal: number | string; paidTotal: number | string; balanceDue: number | string; status: string }>;
  attendances: Array<{ id: string; checkInAt: string; method?: string | null; result?: string | null; branch?: { name: string } | null }>;
  trainerAssignments: Array<{ trainer?: { user?: { name?: string | null } | null } | null }>;
}

function fmtDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default function Member360Page({ params }: { params: { id: string } }) {
  const { data: member, loading, error, refetch } = useFetch<MemberDetail>(`/members/${params.id}`);
  const [activeTab, setActiveTab] = useState('overview');
  const [qrModal, setQrModal] = useState(false);
  const [freezeModal, setFreezeModal] = useState(false);
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);
  const [freezeStart, setFreezeStart] = useState('');
  const [freezeEnd, setFreezeEnd] = useState('');

  const activeMembership = member?.memberships?.find((m) => m.status === 'ACTIVE') ?? member?.memberships?.[0];

  async function handleFreeze(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMembership) return;
    setFreezeSubmitting(true);
    setFreezeMsg(null);
    try {
      await api.post(`/memberships/${activeMembership.id}/freeze`, {
        startDate: freezeStart || new Date().toISOString().slice(0, 10),
        endDate: freezeEnd || undefined,
      });
      setFreezeMsg('Membership frozen successfully.');
      setFreezeModal(false);
      void refetch();
    } catch (err) {
      setFreezeMsg(err instanceof Error ? err.message : 'Could not freeze membership.');
    } finally {
      setFreezeSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <LoadingState rows={6} />
      </AppShell>
    );
  }

  if (error || !member) {
    return (
      <AppShell>
        <ErrorState message={error ?? 'Member not found'} onRetry={refetch} />
      </AppShell>
    );
  }

  return (
    <AppShell>{/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/members" className="hover:underline">Members</Link>
            <span>/</span>
            <span className="font-mono text-slate-700">{member.memberCode}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{member.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQrModal(true)}>
            📱 View Digital QR Pass
          </Button>
          {activeMembership && (
            <Button variant="outline" size="sm" onClick={() => { setFreezeMsg(null); setFreezeModal(true); }}>
              ❄️ Freeze Membership
            </Button>
          )}
          <Link href="/billing">
            <Button variant="outline" size="sm">
              💰 Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Header Summary Card */}
      <Card className="bg-white shadow-md border-slate-200 mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold border-2 border-blue-500 shadow-sm">
                {(member.name[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{member.name}</h2>
                  <Badge variant={member.status === 'ACTIVE' ? 'success' : member.status === 'FROZEN' ? 'warning' : 'destructive'}>
                    {member.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {member.memberCode} • {member.mobile} {member.email ? `• ${member.email}` : ''}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Branch: <span className="font-semibold">{member.branch?.name ?? '—'}</span>
                  {member.joinedAt ? <> | Joined: {fmtDate(member.joinedAt)}</> : null}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 w-full md:w-auto text-xs">
              <div>
                <p className="text-slate-500 font-medium">Active Membership</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {activeMembership ? (activeMembership.plan?.name ?? activeMembership.planNameSnapshot ?? 'Assigned') : 'None'}
                </p>
                <p className="text-[11px] text-slate-500">Exp: {activeMembership ? fmtDate(activeMembership.expiryDate) : '—'}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Assigned Trainer</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {member.trainerAssignments?.[0]?.trainer?.user?.name ?? 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Total Check-ins</p>
                <p className="font-bold text-emerald-600 text-sm mt-0.5">{(member.attendances?.length ?? 0)} Visits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member 360 Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'overview', label: 'Overview & Profile' },
          { id: 'membership', label: 'Memberships' },
          { id: 'payments', label: 'Payments & Invoices' },
          { id: 'attendance', label: 'Attendance History' },
          { id: 'emergency', label: 'Emergency & Health' },
        ]}
      />

      <div className="mt-6">{activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white">
              <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Full Name</span><span className="font-semibold text-slate-900">{member.name}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Member ID</span><span className="font-mono font-semibold text-slate-900">{member.memberCode}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Mobile</span><span className="font-semibold text-slate-900">{member.mobile}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Email</span><span>{member.email || '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Gender</span><span>{member.gender || '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Date of Birth</span><span>{fmtDate(member.dob)}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Fitness Goals</span><span className="font-semibold text-blue-600">{member.fitnessGoals || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Address</span><span>{member.address || '—'}</span></div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader><CardTitle className="text-base">Health & Trainer</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Height</span><span className="font-semibold">{member.healthProfile?.heightCm != null ? `${member.healthProfile.heightCm} cm` : '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Weight</span><span className="font-semibold">{member.healthProfile?.weightKg != null ? `${member.healthProfile.weightKg} kg` : '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Medical Notes</span><span>{member.healthProfile?.medicalNotes || '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Injuries / Limitations</span><span>{member.healthProfile?.injuryNotes || '—'}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Assigned Trainer</span><span className="font-semibold">{member.trainerAssignments?.[0]?.trainer?.user?.name ?? 'Unassigned'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Emergency Contact</span><span>{member.emergencyContact?.name ? `${member.emergencyContact.name} (${member.emergencyContact.relation ?? '—'}) ${member.emergencyContact.phone ?? ''}` : '—'}</span></div>
              </CardContent>
            </Card>
          </div>
        )}{activeTab === 'membership' && (
          <Card className="bg-white">
            <CardHeader><CardTitle className="text-base">Membership History</CardTitle></CardHeader>
            <CardContent>
              {member.memberships.length === 0 ? (
                <p className="text-xs text-slate-500">No memberships assigned yet.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Plan Name</Th>
                      <Th>Start Date</Th>
                      <Th>Expiry Date</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.memberships.map((m) => (
                      <tr key={m.id}>
                        <Td className="font-semibold">{m.plan?.name ?? m.planNameSnapshot ?? '—'}</Td>
                        <Td>{fmtDate(m.startDate)}</Td>
                        <Td>{fmtDate(m.expiryDate)}</Td>
                        <Td><Badge variant={m.status === 'ACTIVE' ? 'success' : 'secondary'}>{m.status}</Badge></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card className="bg-white">
            <CardHeader><CardTitle className="text-base">Invoices & Payment Receipts</CardTitle></CardHeader>
            <CardContent>
              {member.invoices.length === 0 ? (
                <p className="text-xs text-slate-500">No billing records for this member yet.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Invoice #</Th>
                      <Th>Date</Th>
                      <Th>Total</Th>
                      <Th>Paid</Th>
                      <Th>Balance</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <Td className="font-mono text-xs font-bold text-blue-600">{inv.invoiceNumber}</Td>
                        <Td>{fmtDate(inv.createdAt)}</Td>
                        <Td>₹{Number(inv.grandTotal).toLocaleString()}</Td>
                        <Td>₹{Number(inv.paidTotal).toLocaleString()}</Td>
                        <Td className={Number(inv.balanceDue) > 0 ? 'text-rose-600 font-semibold' : ''}>₹{Number(inv.balanceDue).toLocaleString()}</Td>
                        <Td><Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}{activeTab === 'attendance' && (
          <Card className="bg-white">
            <CardHeader><CardTitle className="text-base">Recent Attendance Check-ins</CardTitle></CardHeader>
            <CardContent>
              {member.attendances.length === 0 ? (
                <p className="text-xs text-slate-500">No check-ins recorded yet.</p>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Date & Time</Th>
                      <Th>Branch</Th>
                      <Th>Method</Th>
                      <Th>Result</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.attendances.map((att) => (
                      <tr key={att.id}>
                        <Td className="font-mono text-xs">{new Date(att.checkInAt).toLocaleString()}</Td>
                        <Td>{att.branch?.name ?? '—'}</Td>
                        <Td>{att.method ?? '—'}</Td>
                        <Td><Badge variant={att.result === 'SUCCESS' ? 'success' : 'warning'}>{att.result ?? '—'}</Badge></Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'emergency' && (
          <Card className="bg-white">
            <CardHeader><CardTitle className="text-base">Emergency & Health</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Emergency Contact</span><span className="font-semibold">{member.emergencyContact?.name ?? '—'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Relation</span><span>{member.emergencyContact?.relation ?? '—'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Emergency Phone</span><span className="font-semibold">{member.emergencyContact?.phone ?? '—'}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Medical Notes</span><span>{member.healthProfile?.medicalNotes || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Injuries / Limitations</span><span>{member.healthProfile?.injuryNotes || '—'}</span></div>
            </CardContent>
          </Card>
        )}
      </div>{/* Digital QR Modal */}
      <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title={`Digital Member Pass — ${member.name}`}>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="h-44 w-44 bg-slate-900 rounded-xl flex items-center justify-center text-white font-mono font-bold text-center p-4 border-4 border-blue-500 shadow-xl">
            [ QR SCANNER PASS ]
            <br />
            <span className="text-xs text-blue-400 mt-2 block">{member.qrCode ?? member.memberCode}</span>
          </div>
          <p className="font-mono text-xs font-bold text-slate-800">{member.memberCode}</p>
          <p className="text-xs text-slate-500 text-center">Scan at the front desk scanner for instant check-in verification.</p>
        </div>
      </Modal>

      {/* Freeze Membership Modal */}
      <Modal isOpen={freezeModal} onClose={() => setFreezeModal(false)} title="Freeze Member Subscription">
        <form onSubmit={handleFreeze} className="space-y-4">
          {freezeMsg && <p className="text-xs text-rose-600 font-semibold">{freezeMsg}</p>}
          <p className="text-xs text-slate-600">Temporarily pause membership validity for medical or travel reasons.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold">Start Date</label>
              <input type="date" className="w-full rounded-md border p-2 text-xs" value={freezeStart} onChange={(e) => setFreezeStart(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold">End Date</label>
              <input type="date" className="w-full rounded-md border p-2 text-xs" value={freezeEnd} onChange={(e) => setFreezeEnd(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={freezeSubmitting} className="w-full bg-amber-600 hover:bg-amber-700">
            {freezeSubmitting ? 'Saving...' : 'Confirm Freeze Membership'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}