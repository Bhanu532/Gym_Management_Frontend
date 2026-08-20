'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input } from '@/components/ui';

interface SaaSPlanDef {
  code: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxBranches: number;
  maxStaff: number;
  maxMembers: number;
  storageMb: number;
  enabledModules: string[];
}

const INITIAL_SAAS_PLANS: SaaSPlanDef[] = [
  { code: 'starter', name: 'Starter Plan', priceMonthly: 999, priceYearly: 9990, maxBranches: 1, maxStaff: 5, maxMembers: 100, storageMb: 1024, enabledModules: ['members', 'memberships', 'billing', 'attendance'] },
  { code: 'growth', name: 'Growth Plan', priceMonthly: 2999, priceYearly: 29990, maxBranches: 3, maxStaff: 15, maxMembers: 500, storageMb: 5120, enabledModules: ['members', 'memberships', 'billing', 'attendance', 'workouts', 'diet', 'progress', 'classes', 'pt'] },
  { code: 'enterprise', name: 'Enterprise Plan', priceMonthly: 9999, priceYearly: 99990, maxBranches: 100, maxStaff: 1000, maxMembers: 100000, storageMb: 51200, enabledModules: ['all'] },
];

export default function PlatformPlansPage() {
  const [plans] = useState<SaaSPlanDef[]>(INITIAL_SAAS_PLANS);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SaaS Subscription Plans & Entitlements</h1>
          <p className="text-sm text-slate-500">Configure platform tier pricing, branch limits, staff/member caps & module flags</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Create SaaS Plan Tier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.code} className="bg-white border-slate-200 hover:shadow-xl transition-shadow relative overflow-hidden">
            <div className="h-2 bg-blue-600" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <Badge variant="outline" className="font-mono uppercase">{p.code}</Badge>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-slate-900">₹{p.priceMonthly.toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium"> / month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2 text-xs">
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between"><span className="text-slate-500">Max Branches:</span><span className="font-bold text-slate-900">{p.maxBranches}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Max Staff Accounts:</span><span className="font-bold text-slate-900">{p.maxStaff}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Max Members Cap:</span><span className="font-bold text-blue-600">{p.maxMembers.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cloud Storage:</span><span>{p.storageMb / 1024} GB</span></div>
              </div>

              <div className="pt-2">
                <p className="font-semibold text-slate-700 mb-1">Enabled Modules:</p>
                <div className="flex flex-wrap gap-1">
                  {p.enabledModules.map((m) => (
                    <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>
                  ))}
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full">Edit Plan Entitlements</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New SaaS Tier">
        <div className="space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-semibold">Tier Name</label><Input placeholder="ex: Custom Agency Plan" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold">Monthly Price (₹)</label><Input type="number" placeholder="ex: 4999" /></div>
            <div><label className="text-xs font-semibold">Max Members</label><Input type="number" placeholder="ex: 1000" /></div>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setModalOpen(false); alert('Plan created!'); }}>
            Save SaaS Plan
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
