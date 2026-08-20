'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Badge,
  Th,
  Td,
  Table,
  LoadingState,
  ErrorState,
  EmptyState,
} from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

interface MemberRow {
  id: string;
  memberCode: string;
  name: string;
  mobile: string;
  email?: string;
  status: string;
  branch: { id: string; name: string };
  memberships: Array<{ plan: { name: string }; expiryDate: string }>;
  _count: { attendances: number; invoices: number };
}

const statusColor: Record<string, 'success' | 'warning' | 'destructive' | 'secondary' | 'default'> = {
  ACTIVE: 'success',
  FROZEN: 'warning',
  SUSPENDED: 'destructive',
  ARCHIVED: 'secondary',
};

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const { data, loading, error, refetch } = useFetch<{ items: MemberRow[]; total: number }>(
    `/members?search=${encodeURIComponent(query)}`,
    [query],
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Members</h1>
          <p className="text-sm text-muted-foreground">Manage your gym members</p>
        </div>
        <Link href="/members/new">
          <Button>+ Add Member</Button>
        </Link>
      </div>

      <div className="mt-6 flex gap-2">
        <Input
          placeholder="Search by name, phone, member ID or QR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
          className="max-w-sm"
        />
        <Button variant="secondary" onClick={() => setQuery(search)}>
          Search
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All members ({data?.total ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState rows={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              title="No members found"
              description="Add your first member or adjust your search."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Member ID</Th>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Status</Th>
                  <Th>Branch</Th>
                  <Th>Active Plan</Th>
                  <Th>Expiry</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((m) => {
                  const active = m.memberships[0];
                  return (
                    <tr key={m.id} className="hover:bg-muted/40">
                      <Td className="font-mono text-xs">{m.memberCode}</Td>
                      <Td>
                        <Link href={`/members/${m.id}`} className="font-medium text-primary hover:underline">
                          {m.name}
                        </Link>
                      </Td>
                      <Td>
                        {m.mobile}
                        {m.email ? (
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        ) : null}
                      </Td>
                      <Td>
                        <Badge variant={statusColor[m.status] ?? 'secondary'}>{m.status}</Badge>
                      </Td>
                      <Td>{m.branch.name}</Td>
                      <Td>{active?.plan.name ?? '—'}</Td>
                      <Td>{active ? new Date(active.expiryDate).toLocaleDateString() : '—'}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
