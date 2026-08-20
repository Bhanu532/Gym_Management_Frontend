'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea, Tabs, Badge } from '@/components/ui';

export default function EnterpriseSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  function handleSave() {
    alert('Gym enterprise settings updated successfully!');
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gym & System Settings</h1>
          <p className="text-sm text-slate-500">Configure business information, GSTIN, membership rules, check-in policies, tax rates & integrations</p>
        </div>

        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          💾 Save All Settings
        </Button>
      </div>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: 'general', label: 'Gym Business Profile' },
          { id: 'membership', label: 'Membership & Freeze Rules' },
          { id: 'attendance', label: 'Check-in & Attendance' },
          { id: 'billing', label: 'Billing, GST & Taxes' },
          { id: 'security', label: 'Security & Sessions' },
          { id: 'integrations', label: 'Integrations & Gateways' },
          { id: 'branding', label: 'Branding & Invoices' },
        ]}
      />

      <div className="mt-6">
        {activeTab === 'general' && (
          <Card className="bg-white max-w-3xl">
            <CardHeader><CardTitle className="text-base">Business Legal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Gym Brand Name *</label>
                  <Input placeholder="ex: PowerHouse Fitness & Gym" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Legal Company Name</label>
                  <Input placeholder="ex: PowerHouse Fitness Private Limited" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Primary Contact Email</label>
                  <Input placeholder="ex: owner@demogym.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Primary Contact Phone</label>
                  <Input placeholder="ex: +91 98000 77777" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">GSTIN Number</label>
                  <Input placeholder="ex: 29AAAAA0000A1Z5" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">PAN Number</label>
                  <Input placeholder="ex: ABCDE1234F" className="font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Head Office Address</label>
                <Textarea placeholder="ex: 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038" />
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'membership' && (
          <Card className="bg-white max-w-3xl">
            <CardHeader><CardTitle className="text-base">Membership Policies & Expiry Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Grace Period After Expiry (Days)</label>
                  <Input type="number" placeholder="ex: 3" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Maximum Freeze Duration (Days)</label>
                  <Input type="number" placeholder="ex: 30" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card className="bg-white max-w-3xl">
            <CardHeader><CardTitle className="text-base">Front Desk & Fast Check-in Rules</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                  <span className="font-medium text-slate-800">Strictly Block Check-in when Membership is Expired</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                  <span className="font-medium text-slate-800">Prevent Duplicate Check-ins within 60 minutes window</span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {(activeTab === 'billing' || activeTab === 'security' || activeTab === 'integrations' || activeTab === 'branding') && (
          <Card className="bg-white max-w-3xl p-6 text-center">
            <p className="text-sm font-semibold text-slate-800">Configured {activeTab.toUpperCase()} Integration Parameters</p>
            <p className="text-xs text-slate-500 mt-1">Razorpay API keys, SMS gateway DLT IDs, and Invoice prefixes active.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}