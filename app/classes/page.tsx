'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface GroupClass {
  id: string;
  title: string;
  trainerName: string;
  timeSlot: string;
  room: string;
  capacity: number;
  bookedCount: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

const INITIAL_CLASSES: GroupClass[] = [
  {
    id: 'cls-1',
    title: 'Morning High-Intensity Zumba',
    trainerName: 'Ananya Verma',
    timeSlot: 'Today, 07:00 AM - 08:00 AM',
    room: 'Studio A (Main Hall)',
    capacity: 25,
    bookedCount: 22,
    status: 'SCHEDULED',
  },
  {
    id: 'cls-2',
    title: 'Power Yoga & Flexibility',
    trainerName: 'Meera Deshmukh',
    timeSlot: 'Today, 08:30 AM - 09:30 AM',
    room: 'Studio B (Mind & Body)',
    capacity: 15,
    bookedCount: 15,
    status: 'SCHEDULED',
  },
  {
    id: 'cls-3',
    title: 'CrossFit & Conditioning Blast',
    trainerName: 'Vikram Singh',
    timeSlot: 'Today, 06:00 PM - 07:00 PM',
    room: 'CrossFit Zone',
    capacity: 20,
    bookedCount: 14,
    status: 'SCHEDULED',
  },
];

import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function ClassesPage() {
  const { data: sessionData, refetch } = useFetch<GroupClass[]>('/classes/sessions');
  const { data: trainerData } = useFetch<Array<{ id: string; name: string }>>('/trainers');
  const { data: memberData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/members');
  const { data: branchData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/branches');

  const classes = sessionData ?? INITIAL_CLASSES;
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScheduleClass(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const branchId = branchData?.items?.[0]?.id ?? 'default-branch';
      const trId = trainerId || trainerData?.[0]?.id || 'tr-1';
      const startAt = new Date().toISOString();
      const endAt = new Date(Date.now() + 3600000).toISOString();

      await api.post('/classes/sessions', {
        title,
        branchId,
        trainerId: trId,
        startAt,
        endAt,
        capacity: Number(capacity || 20),
      });
      setModalOpen(false);
      setTitle('');
      setCapacity('');
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule class');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBookMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClassId || !selectedMemberId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/classes/sessions/${selectedClassId}/book`, {
        memberId: selectedMemberId,
      });
      setBookingModalOpen(false);
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Group Classes & Schedule</h1>
          <p className="text-sm text-slate-500">Schedule group classes, track room capacities, book members & waitlists</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Schedule Class
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {classes.map((c) => (
          <Card key={c.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.title}</CardTitle>
                <Badge variant={c.bookedCount >= c.capacity ? 'warning' : 'success'}>
                  {c.bookedCount >= c.capacity ? 'Full' : 'Open'}
                </Badge>
              </div>
              <p className="text-xs text-blue-600 font-semibold mt-1">🧘 Coach: {c.trainerName}</p>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Time Slot:</span>
                <span className="font-semibold text-slate-900">{c.timeSlot}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Room / Zone:</span>
                <span className="font-medium text-slate-800">{c.room}</span>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Occupancy ({c.bookedCount} / {c.capacity})</span>
                  <span>{Math.round((c.bookedCount / c.capacity) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(100, (c.bookedCount / c.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedClassId(c.id);
                  setBookingModalOpen(true);
                }}
              >
                Book Member into Class
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule New Group Class">
        <form onSubmit={handleScheduleClass} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Class Title *</label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Morning Spinning & HIIT" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Trainer</label>
              <Select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
                <option value="">Select Trainer...</option>
                {(trainerData ?? []).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Capacity Limit</label>
              <Input type="number" required value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="ex: 20" />
            </div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Scheduling...' : 'Save Class Schedule'}
          </Button>
        </form>
      </Modal>

      {/* Book Member Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title="Book Member into Class Session">
        <form onSubmit={handleBookMember} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select Member to Book *</label>
            <Select required value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
              <option value="">Select Member...</option>
              {(memberData?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={submitting || !selectedMemberId} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {submitting ? 'Booking...' : 'Confirm Member Booking'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
