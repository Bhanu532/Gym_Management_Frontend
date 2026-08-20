'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input } from '@/components/ui';

interface DietPlan {
  id: string;
  name: string;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  meals: Array<{ name: string; items: string; calories: number }>;
}

const INITIAL_DIETS: DietPlan[] = [
  {
    id: 'dt-1',
    name: 'High Protein Lean Muscle Diet (2,400 kcal)',
    targetCalories: 2400,
    proteinGrams: 180,
    carbsGrams: 220,
    fatGrams: 60,
    meals: [
      { name: 'Breakfast (8:00 AM)', items: '4 Egg Whites, 2 Whole Eggs, Oats 80g with Almond Milk', calories: 550 },
      { name: 'Morning Snack (11:00 AM)', items: '1 Scoop Whey Protein, 1 Banana, 10 Almonds', calories: 300 },
      { name: 'Lunch (1:30 PM)', items: 'Grilled Chicken Breast 200g, Brown Rice 150g, Green Salad', calories: 650 },
      { name: 'Evening Snack (5:00 PM)', items: 'Paneer 100g or Greek Yogurt 200g', calories: 300 },
      { name: 'Dinner (8:30 PM)', items: 'Fish/Tofu 200g, Steamed Vegetables, Quinoa 100g', calories: 600 },
    ],
  },
  {
    id: 'dt-2',
    name: 'Fat Loss Deficit Diet (1,700 kcal)',
    targetCalories: 1700,
    proteinGrams: 140,
    carbsGrams: 130,
    fatGrams: 45,
    meals: [
      { name: 'Breakfast (8:30 AM)', items: 'Sprouted Moong Salad, 3 Egg Whites, Green Tea', calories: 350 },
      { name: 'Lunch (1:30 PM)', items: 'Roti 2, Dal 1 Bowl, Chicken/Paneer 150g, Cucumber', calories: 550 },
      { name: 'Evening Snack (5:30 PM)', items: 'Roasted Chana, Black Coffee', calories: 200 },
      { name: 'Dinner (8:00 PM)', items: 'Clear Vegetable Soup, Grilled Chicken/Fish 150g', calories: 600 },
    ],
  },
];

import { Select } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function DietPage() {
  const { data: dietData, refetch } = useFetch<DietPlan[]>('/diet/templates');
  const { data: memberData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/members');
  const { data: trainerData } = useFetch<Array<{ id: string; name: string }>>('/trainers');
  const { data: branchData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/branches');

  const diets = dietData ?? INITIAL_DIETS;
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDietName, setSelectedDietName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const [planName, setPlanName] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [carbsGrams, setCarbsGrams] = useState('');
  const [fatGrams, setFatGrams] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!planName) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/diet/templates', {
        name: planName,
        proteinGrams: Number(proteinGrams || 150),
        carbsGrams: Number(carbsGrams || 30),
        fatGrams: Number(fatGrams || 100),
      });
      setModalOpen(false);
      setPlanName('');
      setProteinGrams('');
      setCarbsGrams('');
      setFatGrams('');
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignDiet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMemberId) return;
    setSubmitting(true);
    setError(null);
    try {
      const branchId = branchData?.items?.[0]?.id ?? 'default-branch';
      const trainerId = trainerData?.[0]?.id ?? 'default-trainer';

      await api.post('/diet/plans/assign', {
        memberId: selectedMemberId,
        trainerId,
        branchId,
        name: selectedDietName || 'Assigned Diet Plan',
      });
      setAssignModalOpen(false);
      alert('Diet plan successfully assigned to member!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign diet');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diet & Nutrition Templates</h1>
          <p className="text-sm text-slate-500">Design meal plans, track daily macro splits & assign nutrition guides to gym members</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Create Diet Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {diets.map((d) => (
          <Card key={d.id} className="bg-white border-slate-200 shadow-md">
            <CardHeader className="border-b pb-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">{d.name}</CardTitle>
                <Badge variant="success" className="font-mono">{d.targetCalories} kcal</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold mt-2 text-slate-700">
                <span>Proteins: <strong className="text-blue-600">{d.proteinGrams}g</strong></span>
                <span>Carbs: <strong className="text-amber-600">{d.carbsGrams}g</strong></span>
                <span>Fats: <strong className="text-purple-600">{d.fatGrams}g</strong></span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {(d.meals ?? []).map((m, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-slate-50/70 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{m.name}</span>
                    <span className="text-slate-500 font-mono">{m.calories} kcal</span>
                  </div>
                  <p className="text-slate-600">{m.items}</p>
                </div>
              ))}

              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setSelectedDietName(d.name);
                  setAssignModalOpen(true);
                }}
              >
                Assign to Member
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Diet Template Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Nutrition Template">
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Plan Name *</label>
            <Input required value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="ex: Keto Fat Loss Protocol (1,800 kcal)" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[11px] font-semibold">Protein (g)</label><Input type="number" value={proteinGrams} onChange={(e) => setProteinGrams(e.target.value)} placeholder="ex: 150" /></div>
            <div><label className="text-[11px] font-semibold">Carbs (g)</label><Input type="number" value={carbsGrams} onChange={(e) => setCarbsGrams(e.target.value)} placeholder="ex: 30" /></div>
            <div><label className="text-[11px] font-semibold">Fats (g)</label><Input type="number" value={fatGrams} onChange={(e) => setFatGrams(e.target.value)} placeholder="ex: 110" /></div>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save Nutrition Plan'}
          </Button>
        </form>
      </Modal>

      {/* Assign Diet Modal */}
      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title={`Assign ${selectedDietName} to Member`}>
        <form onSubmit={handleAssignDiet} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select Member *</label>
            <Select required value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
              <option value="">Select Member...</option>
              {(memberData?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={submitting || !selectedMemberId} className="w-full bg-emerald-600 hover:bg-emerald-700">
            {submitting ? 'Assigning...' : 'Confirm Diet Assignment'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
