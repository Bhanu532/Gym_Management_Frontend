'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input, Select } from '@/components/ui';

interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  phone: string;
  email: string;
  assignedMembersCount: number;
  ptSessionsCompleted: number;
  rating: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

const INITIAL_TRAINERS: Trainer[] = [
  {
    id: 'tr-1',
    name: 'Vikram Singh',
    specialization: 'Strength & Conditioning, Bodybuilding',
    experienceYears: 7,
    phone: '+91 98765 11111',
    email: 'vikram.singh@gympro.in',
    assignedMembersCount: 24,
    ptSessionsCompleted: 142,
    rating: 4.9,
    status: 'ACTIVE',
  },
  {
    id: 'tr-2',
    name: 'Ananya Verma',
    specialization: 'Weight Loss, Functional Training, Yoga',
    experienceYears: 5,
    phone: '+91 98765 22222',
    email: 'ananya.v@gympro.in',
    assignedMembersCount: 18,
    ptSessionsCompleted: 98,
    rating: 4.8,
    status: 'ACTIVE',
  },
  {
    id: 'tr-3',
    name: 'Rajesh Kumar',
    specialization: 'CrossFit & Rehabilitation',
    experienceYears: 4,
    phone: '+91 98765 33333',
    email: 'rajesh.k@gympro.in',
    assignedMembersCount: 12,
    ptSessionsCompleted: 64,
    rating: 4.7,
    status: 'ACTIVE',
  },
];

import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function TrainersPage() {
  const { data: trainerData, refetch } = useFetch<Trainer[]>('/trainers');
  const { data: branchData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/branches');

  const trainers = trainerData ?? INITIAL_TRAINERS;
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTrainer, setNewTrainer] = useState({
    name: '',
    specialization: '',
    experienceYears: '',
    phone: '',
    email: '',
  });

  async function handleAddTrainer(e: React.FormEvent) {
    e.preventDefault();
    if (!newTrainer.name) return;
    setSubmitting(true);
    setError(null);
    try {
      const branchId = branchData?.items?.[0]?.id ?? 'default-branch';
      await api.post('/trainers', {
        name: newTrainer.name,
        specialization: newTrainer.specialization || undefined,
        experienceYears: Number(newTrainer.experienceYears || 1),
        phone: newTrainer.phone || undefined,
        email: newTrainer.email || undefined,
        branchId,
      });
      setModalOpen(false);
      setNewTrainer({
        name: '',
        specialization: '',
        experienceYears: '',
        phone: '',
        email: '',
      });
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add trainer');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fitness Trainers & Coaches</h1>
          <p className="text-sm text-slate-500">Manage trainer profiles, client assignments, PT sessions & performance</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add Trainer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {trainers.map((t) => (
          <Card key={t.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <p className="text-xs text-slate-500">{t.experienceYears} Years Exp</p>
                  </div>
                </div>
                <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Specialization</p>
                <p className="font-semibold text-slate-900 mt-0.5">{t.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border">
                <div>
                  <p className="text-slate-500">Assigned Clients</p>
                  <p className="font-bold text-sm text-blue-600 mt-0.5">{t.assignedMembersCount} Members</p>
                </div>
                <div>
                  <p className="text-slate-500">PT Sessions Done</p>
                  <p className="font-bold text-sm text-emerald-600 mt-0.5">{t.ptSessionsCompleted} Sessions</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Rating: ⭐ {t.rating} / 5.0</span>
                <span className="font-mono">{t.phone}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Trainer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Personal Trainer">
        <form onSubmit={handleAddTrainer} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Trainer Full Name *</label>
            <Input required value={newTrainer.name} onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })} placeholder="ex: Karan Sharma" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Specialization</label>
            <Input value={newTrainer.specialization} onChange={(e) => setNewTrainer({ ...newTrainer, specialization: e.target.value })} placeholder="ex: Strength & Conditioning, Calisthenics" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Phone (+91)</label>
              <Input value={newTrainer.phone} onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })} placeholder="ex: +91 98765 00000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Experience Years</label>
              <Input type="number" value={newTrainer.experienceYears} onChange={(e) => setNewTrainer({ ...newTrainer, experienceYears: e.target.value })} placeholder="ex: 5" />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save Trainer Profile'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
