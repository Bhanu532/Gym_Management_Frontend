'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';

const dietPlans = [
  { id: 'd-1', member: 'Rahul Sharma', plan: 'High Protein — 2,400 kcal', status: 'ACTIVE', updated: '2 days ago' },
  { id: 'd-2', member: 'Priya Reddy', plan: 'Lean Bulk — 2,800 kcal', status: 'ACTIVE', updated: '1 week ago' },
  { id: 'd-3', member: 'Amit Patel', plan: 'Fat Loss — 1,900 kcal', status: 'ACTIVE', updated: '4 days ago' },
  { id: 'd-4', member: 'Sneha Kulkarni', plan: 'Vegan Strength — 2,200 kcal', status: 'DRAFT', updated: 'Just now' },
];

export default function DietitianDashboard() {
  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono mb-1">
            🥗 DIETITIAN CONSOLE
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Dietitian Dashboard</h1>
          <p className="text-sm text-slate-500">Member nutrition plans, body metrics & dietary progress</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/diet">
            <Button className="bg-green-600 hover:bg-green-700 shadow-md">📋 Manage Diet Plans</Button>
          </Link>
          <Link href="/progress">
            <Button variant="outline">📈 Body Metrics</Button>
          </Link>
        </div>
      </div>

      {/* Dietitian KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-green-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Diet Plans</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">42</p>
            <p className="text-xs text-slate-500 mt-2">31 strength · 11 weight-loss</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Members Tracked</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">27</p>
            <p className="text-xs text-slate-500 mt-2">Weekly body-metric reviews</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metrics Logged</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">96</p>
            <p className="text-xs text-slate-500 mt-2">Weight · body fat · waist · muscle</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Reviews</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">5</p>
            <p className="text-xs text-amber-700 mt-2">Requires follow-up this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Diet Plan Updates */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-lg">Recent Diet Plan Updates</CardTitle>
            <p className="text-xs text-slate-500">Latest member nutrition plan revisions</p>
          </div>
          <Link href="/diet">
            <Button size="sm" variant="outline">Open Nutrition Module →</Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {dietPlans.map((d) => (
            <div key={d.id} className="p-3 rounded-lg border bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-slate-900">{d.member}</p>
                <p className="text-xs text-slate-500">{d.plan}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{d.updated}</span>
                <Badge variant={d.status === 'ACTIVE' ? 'success' : 'warning'}>{d.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick module links */}
      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        {[
          { href: '/members', label: 'Members', desc: 'View member profiles & nutrition history', emoji: '👥' },
          { href: '/diet', label: 'Diet & Nutrition', desc: 'Create & update member diet plans', emoji: '🥗' },
          { href: '/progress', label: 'Progress Tracking', desc: 'Log body metrics & review progress', emoji: '📈' },
        ].map((m) => (
          <Link key={m.href} href={m.href}>
            <Card className="bg-white hover:border-green-300 transition-colors">
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
