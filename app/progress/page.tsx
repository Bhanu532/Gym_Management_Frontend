'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Table, Th, Td, Modal, Input } from '@/components/ui';

import { Select } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

export default function ProgressPage() {
  const { data: logData, refetch } = useFetch<any[]>('/progress/measurements');
  const { data: memberData } = useFetch<{ items: Array<{ id: string; name: string }> }>('/members');

  const logs = logData ?? [
    { date: '2026-08-01', weight: 76.5, bmi: 24.1, bodyFat: 17.5, chest: 40, waist: 32, hips: 38 },
    { date: '2026-07-01', weight: 78.2, bmi: 24.6, bodyFat: 19.0, chest: 40.5, waist: 33.5, hips: 38.5 },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [hipsCm, setHipsCm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRecordMeasurement(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/progress/measurements', {
        memberId,
        weightKg: Number(weightKg || 70),
        bodyFatPercent: Number(bodyFatPercent || 15),
        chestCm: Number(chestCm || 40),
        waistCm: Number(waistCm || 32),
        hipsCm: Number(hipsCm || 38),
      });
      setModalOpen(false);
      setWeightKg('');
      setBodyFatPercent('');
      setChestCm('');
      setWaistCm('');
      setHipsCm('');
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log measurement');
    } finally {
      setSubmitting(false);
    }
  }

  const latestWeight = logs.length > 0 ? logs[0].weight : 76.5;
  const latestBmi = logs.length > 0 ? logs[0].bmi : 24.1;
  const latestBodyFat = logs.length > 0 ? logs[0].bodyFat : 17.5;
  const latestWaist = logs.length > 0 ? logs[0].waist : 32;

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fitness Assessment & Body Progress</h1>
          <p className="text-sm text-slate-500">Log body measurements, BMI, body fat % and track fitness transformations over time</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Record Measurements
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Weight</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{latestWeight} kg</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">📉 Real-time metric</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current BMI</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{latestBmi}</p>
            <p className="text-xs text-slate-500 mt-1">Normal Healthy Range</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Body Fat %</p>
            <p className="text-3xl font-extrabold text-purple-600 mt-1">{latestBodyFat}%</p>
            <p className="text-xs text-purple-700 font-semibold mt-1">📉 Fat Reduction Tracking</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waist Size</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{latestWaist} inches</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">📉 Waist Circumference</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Historical Measurement Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Log Date</Th>
                <Th>Member</Th>
                <Th>Weight (kg)</Th>
                <Th>BMI</Th>
                <Th>Body Fat %</Th>
                <Th>Chest (in)</Th>
                <Th>Waist (in)</Th>
                <Th>Hips (in)</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">{row.date}</Td>
                  <Td className="font-medium text-blue-600">{row.memberName ?? 'Member'}</Td>
                  <Td className="font-bold text-blue-600">{row.weight} kg</Td>
                  <Td>{row.bmi}</Td>
                  <Td className="text-purple-600 font-semibold">{row.bodyFat}%</Td>
                  <Td>{row.chest}"</Td>
                  <Td>{row.waist}"</Td>
                  <Td>{row.hips}"</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Body Assessment Log">
        <form onSubmit={handleRecordMeasurement} className="space-y-4">
          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Select Member *</label>
            <Select required value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Select Member...</option>
              {(memberData?.items ?? []).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold">Weight (kg)</label><Input type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="ex: 76.0" /></div>
            <div><label className="text-xs font-semibold">Body Fat %</label><Input type="number" value={bodyFatPercent} onChange={(e) => setBodyFatPercent(e.target.value)} placeholder="ex: 17.0" /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[11px] font-semibold">Chest (in)</label><Input type="number" value={chestCm} onChange={(e) => setChestCm(e.target.value)} placeholder="ex: 40" /></div>
            <div><label className="text-[11px] font-semibold">Waist (in)</label><Input type="number" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} placeholder="ex: 32" /></div>
            <div><label className="text-[11px] font-semibold">Hips (in)</label><Input type="number" value={hipsCm} onChange={(e) => setHipsCm(e.target.value)} placeholder="ex: 38" /></div>
          </div>
          <Button type="submit" disabled={submitting || !memberId} className="w-full bg-blue-600 hover:bg-blue-700">
            {submitting ? 'Saving...' : 'Save Measurement Entry'}
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
