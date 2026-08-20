'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface Exercise {
  id: string;
  name: string;
  category: 'CHEST' | 'BACK' | 'LEGS' | 'SHOULDERS' | 'ARMS' | 'CORE' | 'CARDIO';
  equipmentRequired: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string | null;
  branch?: { id: string; name: string } | null;
  member?: { id: string; name: string } | null;
  trainer?: { user?: { name?: string | null } | null } | null;
}

const EXERCISE_LIBRARY: Exercise[] = [
  { id: 'ex-1', name: 'Barbell Bench Press', category: 'CHEST', equipmentRequired: 'Barbell, Flat Bench' },
  { id: 'ex-2', name: 'Incline Dumbbell Press', category: 'CHEST', equipmentRequired: 'Dumbbells, Incline Bench' },
  { id: 'ex-3', name: 'Lat Pulldown', category: 'BACK', equipmentRequired: 'Cable Machine' },
  { id: 'ex-4', name: 'Barbell Squat', category: 'LEGS', equipmentRequired: 'Squat Rack, Barbell' },
  { id: 'ex-5', name: 'Overhead Shoulder Press', category: 'SHOULDERS', equipmentRequired: 'Dumbbells' },
  { id: 'ex-6', name: 'Plank Hold', category: 'CORE', equipmentRequired: 'Mat' },
];

import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function WorkoutsPage() {
  const { data: exerciseData, refetch: refetchExercises } = useFetch<Exercise[]>('/workouts/exercises');
  const { data: planData, refetch: refetchPlans } = useFetch<WorkoutPlan[]>('/workouts/plans');
  const { data: memberData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/members');
  const { data: trainerData } = useFetch<Array<{ id: string; name: string }>>('/trainers');
  const { data: branchData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/branches');

  const exercises = exerciseData ?? EXERCISE_LIBRARY;
  const plans = planData ?? [];
  const [modalOpen, setModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateRoutine(e: React.FormEvent) {
    e.preventDefault();
    if (!routineName) return;
    setSubmitting(true);
    setError(null);
    try {
      const branchId = branchData?.items?.[0]?.id ?? 'default-branch';
      const mId = memberId || memberData?.items?.[0]?.id;
      const tId = trainerData?.[0]?.id;

      if (!mId || !tId) {
        setError('Please select a valid member and trainer.');
        setSubmitting(false);
        return;
      }

      await api.post('/workouts/plans', {
        name: routineName,
        branchId,
        memberId: mId,
        trainerId: tId,
      });
      setModalOpen(false);
      setRoutineName('');
      void refetchExercises();
      void refetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create routine');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workout Builder & Exercise Library</h1>
          <p className="text-sm text-slate-500">Manage exercise database, construct custom workout routines & assign to members</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Create Workout Routine
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exercise Library</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{exercises.length} Exercises</p>
            <p className="text-xs text-slate-500 mt-1">7 Muscle Group Categories</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Workout Templates</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">12 Routines</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">Push Pull Legs, Upper/Lower, Cardio</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Members</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">84 Members</p>
            <p className="text-xs text-slate-500 mt-1">Tracked via Member Portal</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Workout Routines */}
      <Card className="bg-white mb-8">
        <CardHeader className="border-b pb-4">
          <CardTitle>Assigned Workout Routine Plans</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {plans.length === 0 ? (
            <p className="text-xs text-slate-500">No workout routines assigned yet. Create one to see it here.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Routine Name</Th>
                  <Th>Member</Th>
                  <Th>Assigned Trainer</Th>
                  <Th>Branch</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td className="font-semibold text-slate-900">{p.name}</Td>
                    <Td>{p.member?.name ?? '—'}</Td>
                    <Td>{p.trainer?.user?.name ?? '—'}</Td>
                    <Td>{p.branch?.name ?? '—'}</Td>
                    <Td><Badge variant={p.isActive ? 'success' : 'secondary'}>{p.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Exercise Library Table */}
      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Exercise Database</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Exercise Name</Th>
                <Th>Category</Th>
                <Th>Equipment Required</Th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">{ex.name}</Td>
                  <Td><Badge variant="outline">{ex.category ?? 'GENERAL'}</Badge></Td>
                  <Td>{ex.equipmentRequired ?? (ex as any).equipment ?? 'Bodyweight'}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Workout Routine Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Workout Routine Plan">
        <form onSubmit={handleCreateRoutine} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Routine Name *</label>
            <Input required value={routineName} onChange={(e) => setRoutineName(e.target.value)} placeholder="ex: Hypertrophy Push Day Routine" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Assign to Member *</label>
            <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Select Member...</option>
              {(memberData?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save & Assign Routine'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
