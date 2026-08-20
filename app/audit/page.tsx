'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Table, Th, Td, Badge, Input } from '@/components/ui';

interface AuditItem {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
  ipAddress: string;
}

const INITIAL_AUDITS: AuditItem[] = [
  { id: 'aud-1', user: 'Vikramaditya Rao (Owner)', action: 'RENEW_MEMBERSHIP', entity: 'Member #GYM-1001 (Rahul Sharma)', timestamp: '2026-08-17 14:10:02', ipAddress: '106.51.24.12' },
  { id: 'aud-2', user: 'Pooja Sharma (Receptionist)', action: 'CHECK_IN_SUCCESS', entity: 'Member #GYM-1002 (Priya Reddy)', timestamp: '2026-08-17 08:00:15', ipAddress: '106.51.24.15' },
  { id: 'aud-3', user: 'Vikramaditya Rao (Owner)', action: 'RECORD_PAYMENT', entity: 'Invoice #INV-2026-002 (₹3,000)', timestamp: '2026-08-16 16:45:00', ipAddress: '106.51.24.12' },
  { id: 'aud-4', user: 'Vikramaditya Rao (Owner)', action: 'UPDATE_SETTINGS', entity: 'Tenant GSTIN Configuration', timestamp: '2026-08-15 11:20:00', ipAddress: '106.51.24.12' },
];

export default function AuditLogsPage() {
  const [audits] = useState<AuditItem[]>(INITIAL_AUDITS);
  const [search, setSearch] = useState('');

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Audit & Security Logs</h1>
          <p className="text-sm text-slate-500">Immutable audit trial tracking all financial, membership & administrative actions</p>
        </div>

        <Input
          placeholder="Filter by action, user or entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs text-xs"
        />
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Audit Log Records</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Timestamp</Th>
                <Th>Actor User</Th>
                <Th>Action Event</Th>
                <Th>Target Entity</Th>
                <Th>IP Address</Th>
              </tr>
            </thead>
            <tbody>
              {audits.map((aud) => (
                <tr key={aud.id} className="hover:bg-slate-50">
                  <Td className="font-mono text-xs text-slate-500">{aud.timestamp}</Td>
                  <Td className="font-semibold text-slate-900">{aud.user}</Td>
                  <Td><Badge variant="outline" className="font-mono">{aud.action}</Badge></Td>
                  <Td className="text-xs text-slate-700">{aud.entity}</Td>
                  <Td className="font-mono text-xs text-slate-500">{aud.ipAddress}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}