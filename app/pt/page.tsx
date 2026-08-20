'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface PTPackageAssignment {
  id: string;
  memberName: string;
  trainerName: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
}

const INITIAL_PT_ASSIGNMENTS: PTPackageAssignment[] = [
  {
    id: 'pt-101',
    memberName: 'Rahul Sharma',
    trainerName: 'Vikram Singh',
    packageName: '12 Session Transformation Package',
    totalSessions: 12,
    usedSessions: 8,
    remainingSessions: 4,
    expiryDate: '2026-09-30',
    status: 'ACTIVE',
  },
  {
    id: 'pt-102',
    memberName: 'Priya Reddy',
    trainerName: 'Ananya Verma',
    packageName: '24 Session Premium PT',
    totalSessions: 24,
    usedSessions: 10,
    remainingSessions: 14,
    expiryDate: '2026-11-15',
    status: 'ACTIVE',
  },
];

import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function PTManagementPage() {
  const { data: ptData, refetch } = useFetch<PTPackageAssignment[]>('/pt/assignments');
  const { data: memberData } = useFetch<{ items: Array<{ id: string; name: string; memberCode: string }> }>('/members');
  const { data: trainerData } = useFetch<Array<{ id: string; name: string }>>('/trainers');

  const assignments = ptData ?? INITIAL_PT_ASSIGNMENTS;
  const [modalOpen, setModalOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [packageName, setPackageName] = useState('');
  const [sessionCount, setSessionCount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssignPackage(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !trainerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/pt/packages/assign', {
        memberId,
        trainerId,
        packageName: packageName || 'Personal Training Package',
        sessionCount: Number(sessionCount || 12),
      });
      setModalOpen(false);
      setPackageName('');
      setSessionCount('');
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign package');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogSession(id: string) {
    try {
      await api.post('/pt/sessions/log', {
        memberPtPackageId: id,
      });
      void refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to log session');
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personal Training (PT) Packages & Sessions</h1>
          <p className="text-sm text-slate-500">Track 1-on-1 PT client packages, log completed sessions & monitor trainer payouts</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Assign PT Package
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Active Client PT Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Assigned Trainer</Th>
                <Th>Package Name</Th>
                <Th>Sessions Done / Total</Th>
                <Th>Remaining</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((pt) => (
                <tr key={pt.id} className="hover:bg-slate-50">
                  <Td className="font-bold text-slate-900">{pt.memberName}</Td>
                  <Td className="font-medium text-blue-600">{pt.trainerName}</Td>
                  <Td>{pt.packageName}</Td>
                  <Td className="font-mono text-xs font-semibold">{pt.usedSessions} / {pt.totalSessions}</Td>
                  <Td className="font-bold text-emerald-600">{pt.remainingSessions} Sessions Left</Td>
                  <Td>{pt.expiryDate}</Td>
                  <Td><Badge variant={pt.status === 'ACTIVE' ? 'success' : 'secondary'}>{pt.status}</Badge></Td>
                  <Td>
                    {pt.remainingSessions > 0 ? (
                      <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-700" onClick={() => handleLogSession(pt.id)}>
                        ✅ Log Completed Session
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Completed</span>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Assign New PT Package">
        <form onSubmit={handleAssignPackage} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select Member *</label>
            <Select required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Select Member...</option>
              {(memberData?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.memberCode})</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Assign Trainer *</label>
            <Select required value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
              <option value="">Select Trainer...</option>
              {(trainerData ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Package Name</label>
            <Input required value={packageName} onChange={(e) => setPackageName(e.target.value)} placeholder="ex: 12 Session Transformation Package" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Total Purchased Sessions</label>
            <Input type="number" required value={sessionCount} onChange={(e) => setSessionCount(e.target.value)} placeholder="ex: 12" />
          </div>
          <Button type="submit" disabled={submitting || !memberId || !trainerId} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save PT Package Assignment'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
