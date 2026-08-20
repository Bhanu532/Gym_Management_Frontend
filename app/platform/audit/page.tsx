'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Table, Th, Td, Badge, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useFetch } from '@/lib/useQuery';

interface PlatformAuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
}

function targetOf(entry: PlatformAuditEntry): string {
  const name = entry.metadata?.tenantName ?? entry.metadata?.branchName;
  if (typeof name === 'string' && name) return name;
  return entry.entityId ?? '—';
}

export default function PlatformAuditPage() {
  const { data, loading, error, refetch } = useFetch<{ items?: PlatformAuditEntry[] }>('/platform/audit-logs');
  const logs = data?.items ?? [];

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Audit Logs</h1>
          <p className="text-sm text-slate-500">Cross-tenant platform administrative logs and security events</p>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Super Admin Action Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={() => void refetch()} />
          ) : logs.length === 0 ? (
            <EmptyState title="No platform audit events yet" description="Super Admin actions (tenant provisioning, branch management, status changes) will appear here." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Timestamp</Th>
                  <Th>Super Admin Actor</Th>
                  <Th>Action Event</Th>
                  <Th>Target Entity</Th>
                  <Th>Entity</Th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <Td className="font-mono text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </Td>
                    <Td className="font-semibold text-slate-900">{log.actor?.name ?? 'Platform Super Admin'}</Td>
                    <Td><Badge variant="outline" className="font-mono">{log.action}</Badge></Td>
                    <Td className="text-xs text-slate-700">{targetOf(log)}</Td>
                    <Td className="font-mono text-xs text-slate-500">{log.entity}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
