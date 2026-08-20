'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select } from '@/components/ui';

export default function PlatformSettingsPage() {
  const [platform, setPlatform] = useState({
    platformName: 'GymPro SaaS',
    baseUrl: 'https://gympro-saas.example.com',
    supportEmail: 'support@platform.local',
    defaultCurrency: 'INR',
    defaultTimezone: 'Asia/Kolkata',
    sessionTimeoutMins: '30',
    allowTenantSelfService: 'true',
    maintenanceMode: 'false',
  });

  function update(field: string, value: string) {
    setPlatform((p) => ({ ...p, [field]: value }));
  }

  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono mb-1">
            ⚡ PLATFORM ADMINISTRATION
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-sm text-slate-500">Global SaaS platform configuration, security & tenant policies</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
          {saved ? '✓ Settings Saved' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Platform Configuration</CardTitle>
            <p className="text-xs text-slate-500">Branding & general platform identity</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform Name</label>
              <Input value={platform.platformName} onChange={(e) => update('platformName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Platform Base URL</label>
              <Input value={platform.baseUrl} onChange={(e) => update('baseUrl', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Support Email</label>
              <Input value={platform.supportEmail} onChange={(e) => update('supportEmail', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Defaults & Localization</CardTitle>
            <p className="text-xs text-slate-500">New tenant defaults and regional settings</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Default Currency</label>
              <Select value={platform.defaultCurrency} onChange={(e) => update('defaultCurrency', e.target.value)} className="w-full">
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="AED">AED — UAE Dirham</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Default Timezone</label>
              <Select value={platform.defaultTimezone} onChange={(e) => update('defaultTimezone', e.target.value)} className="w-full">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="UTC">UTC</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Session Timeout (minutes)</label>
              <Input value={platform.sessionTimeoutMins} onChange={(e) => update('sessionTimeoutMins', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Security & Tenant Policies</CardTitle>
            <p className="text-xs text-slate-500">Global controls applied to every tenant workspace</p>
          </CardHeader>
          <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tenant Self-Service Provisioning</label>
              <Select value={platform.allowTenantSelfService} onChange={(e) => update('allowTenantSelfService', e.target.value)} className="w-full">
                <option value="true">Enabled — tenants can self-provision</option>
                <option value="false">Disabled — super admin only</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Maintenance Mode</label>
              <Select value={platform.maintenanceMode} onChange={(e) => update('maintenanceMode', e.target.value)} className="w-full">
                <option value="false">Off — platform is live</option>
                <option value="true">On — read-only maintenance</option>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                <p className="font-semibold">Platform security</p>
                <p className="text-blue-700 mt-1">
                  All /platform/* APIs are restricted to platform-scoped SUPER_ADMIN accounts. Tenant APIs are
                  isolated by tenantId and protected by RBAC permissions. Changes here apply globally.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

