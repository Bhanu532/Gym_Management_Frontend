'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, Modal } from '@/components/ui';
import { INITIAL_MEMBERS } from '@/lib/mockData';

export default function MemberPortalPage() {
  const member = INITIAL_MEMBERS[0]; // Rahul Sharma demo member profile
  const [activeTab, setActiveTab] = useState('pass');
  const [qrModal, setQrModal] = useState(false);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-2">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Badge variant="success" className="mb-1 font-mono text-[10px]">MEMBER SELF-SERVICE PORTAL</Badge>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {member.name}!</h1>
            <p className="text-sm text-slate-500">Track your active plan, digital pass, workouts, diet & class bookings</p>
          </div>

          <Button onClick={() => setQrModal(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            📱 Show Digital QR Pass
          </Button>
        </div>

        {/* Active Membership Status Card */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl mb-6 overflow-hidden relative">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-wider">Active Subscription</p>
                <h2 className="text-xl font-extrabold mt-1">{member.memberships[0]?.plan.name}</h2>
                <p className="text-xs text-slate-300 font-mono mt-0.5">Member Code: {member.memberCode}</p>
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-700/80 pt-4 mt-6 text-xs">
              <div>
                <p className="text-slate-400">Valid Until Expiry</p>
                <p className="font-bold text-white text-sm mt-0.5">{member.memberships[0]?.expiryDate}</p>
              </div>
              <div>
                <p className="text-slate-400">Assigned Trainer</p>
                <p className="font-bold text-blue-400 text-sm mt-0.5">{member.assignedTrainer?.name ?? 'General Training'}</p>
              </div>
              <div>
                <p className="text-slate-400">Gym Check-ins</p>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">{member._count.attendances} Total Visits</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Member Portal Navigation Tabs */}
        <Tabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'pass', label: 'Digital Pass & QR' },
            { id: 'workout', label: 'My Workout Routine' },
            { id: 'diet', label: 'My Diet Plan' },
            { id: 'progress', label: 'Body Metrics' },
            { id: 'classes', label: 'Class Bookings' },
            { id: 'invoices', label: 'Invoices & Receipts' },
          ]}
        />

        <div className="mt-6">
          {activeTab === 'pass' && (
            <Card className="bg-white text-center p-8">
              <CardContent className="space-y-4">
                <p className="text-sm font-semibold text-slate-700">Digital Access Pass for Gym Check-in</p>
                <div className="mx-auto h-48 w-48 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white font-mono p-4 border-4 border-blue-500 shadow-2xl">
                  <span className="font-bold text-sm text-blue-400">[ QR CODE ]</span>
                  <span className="text-xs text-slate-300 mt-2">{member.qrCode}</span>
                </div>
                <p className="font-mono text-sm font-bold text-slate-900">{member.memberCode}</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hold this QR code up to the front desk kiosk scanner or present to the receptionist upon entry.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'workout' && (
            <Card className="bg-white p-6">
              <CardHeader className="px-0 pt-0"><CardTitle className="text-base">Assigned Workout Routine — Push Pull Legs</CardTitle></CardHeader>
              <CardContent className="px-0 space-y-3 text-xs">
                <div className="p-3 rounded-lg border bg-slate-50">
                  <p className="font-bold text-slate-900">Day 1: Chest & Triceps</p>
                  <p className="text-slate-600 mt-1">Barbell Bench Press (4 Sets x 10 Reps), Incline Dumbbell Press (3 Sets x 12 Reps), Tricep Dips</p>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50">
                  <p className="font-bold text-slate-900">Day 2: Back & Biceps</p>
                  <p className="text-slate-600 mt-1">Lat Pulldowns (4 Sets x 10 Reps), Barbell Rows (3 Sets x 10 Reps), Bicep Curls</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'diet' && (
            <Card className="bg-white p-6">
              <CardHeader className="px-0 pt-0"><CardTitle className="text-base">High Protein Nutrition Plan (2,400 kcal)</CardTitle></CardHeader>
              <CardContent className="px-0 space-y-3 text-xs">
                <div className="p-3 rounded-lg border bg-blue-50/50">
                  <p className="font-bold text-slate-900">Breakfast (8:00 AM)</p>
                  <p className="text-slate-600">4 Egg Whites, 2 Whole Eggs, Oats 80g with Almond Milk (550 kcal)</p>
                </div>
                <div className="p-3 rounded-lg border bg-blue-50/50">
                  <p className="font-bold text-slate-900">Lunch (1:30 PM)</p>
                  <p className="text-slate-600">Grilled Chicken 200g, Brown Rice 150g, Salad (650 kcal)</p>
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === 'progress' || activeTab === 'classes' || activeTab === 'invoices') && (
            <Card className="bg-white p-6 text-center">
              <p className="text-sm font-semibold text-slate-800">My Personal {activeTab.toUpperCase()}</p>
              <p className="text-xs text-slate-500 mt-1">All entries synced live with GymPro SaaS backend.</p>
            </Card>
          )}
        </div>

        {/* Digital QR Modal */}
        <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title="Digital Member Pass">
          <div className="flex flex-col items-center justify-center p-4 space-y-3 text-center">
            <div className="h-44 w-44 bg-slate-900 rounded-xl flex items-center justify-center text-white font-mono font-bold text-xs p-4 border-4 border-blue-500 shadow-xl">
              [ SCAN QR PASS ]
              <br />
              <span className="text-[10px] text-blue-400 mt-1 block">{member.qrCode}</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900">{member.memberCode}</p>
            <p className="text-xs text-slate-500">Scan at the front desk scanner for instant check-in verification.</p>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}