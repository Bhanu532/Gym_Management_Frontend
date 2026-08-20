'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';

const sessionPlan = [
  { id: 'pt-1', member: 'Rahul Sharma', time: '07:30 AM', type: 'Strength — Push Day', status: 'SCHEDULED' },
  { id: 'pt-2', member: 'Priya Reddy', time: '09:00 AM', type: 'Hypertrophy — Pull Day', status: 'SCHEDULED' },
  { id: 'pt-3', member: 'Amit Patel', time: '05:30 PM', type: 'Fat Loss Circuit', status: 'SCHEDULED' },
  { id: 'pt-4', member: 'Sneha Kulkarni', time: '06:30 PM', type: 'Mobility & Core', status: 'COMPLETED' },
];

export default function TrainerDashboard() {
  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono mb-1">
            🏋️ TRAINER CONSOLE
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Trainer Dashboard</h1>
          <p className="text-sm text-slate-500">Your sessions, assigned clients, workout programs & classes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/workouts">
            <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md">📋 Manage Workouts</Button>
          </Link>
          <Link href="/pt">
            <Button variant="outline">🗓️ PT Session Log</Button>
          </Link>
        </div>
      </div>

      {/* Trainer KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-emerald-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s Sessions</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">4</p>
            <p className="text-xs text-slate-500 mt-2">1 completed · 3 upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Clients</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">18</p>
            <p className="text-xs text-slate-500 mt-2">Across 3 gym branches</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Programs</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">6</p>
            <p className="text-xs text-slate-500 mt-2">Push · Pull · Legs · Hypertrophy · Fat Loss · Mobility</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Classes This Week</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">9</p>
            <p className="text-xs text-amber-700 mt-2">2 HIIT · 3 Strength · 4 Yoga</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's PT Sessions */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-lg">Today&apos;s PT Sessions</CardTitle>
            <p className="text-xs text-slate-500">Personal training appointments for today</p>
          </div>
          <Link href="/pt">
            <Button size="sm" variant="outline">View All Sessions →</Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {sessionPlan.map((s) => (
            <div key={s.id} className="p-3 rounded-lg border bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-slate-900">{s.member}</p>
                <p className="text-xs text-slate-500">{s.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-600">{s.time}</span>
                <Badge variant={s.status === 'COMPLETED' ? 'success' : 'default'}>{s.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick module links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
        {[
          { href: '/members', label: 'Members', desc: 'View assigned member profiles', emoji: '👥' },
          { href: '/attendance', label: 'Fast Check-in', desc: 'Log member attendance', emoji: '✅' },
          { href: '/classes', label: 'Classes', desc: 'Manage class schedules & bookings', emoji: '📅' },
          { href: '/diet', label: 'Diet & Nutrition', desc: 'Review member nutrition plans', emoji: '🥗' },
        ].map((m) => (
          <Link key={m.href} href={m.href}>
            <Card className="bg-white hover:border-emerald-300 transition-colors">
              <CardContent className="p-5">
                <span className="text-xl">{m.emoji}</span>
                <p className="font-semibold text-slate-900 mt-2">{m.label}</p>
                <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
