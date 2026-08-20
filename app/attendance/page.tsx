'use client';

import { useRef, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/useQuery';

interface Branch {
  id: string;
  name: string;
}

interface CheckInResult {
  attendance: { id: string; checkInAt: string };
  result: string;
  warning?: string | null;
}

export default function AttendancePage() {
  const { data: branchData } = useFetch<{ items: Branch[] }>('/branches');
  const [branchId, setBranchId] = useState('');
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('MANUAL');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function doCheckIn(e?: React.FormEvent) {
    e?.preventDefault();
    if (!branchId || !query.trim()) {
      setError('Select branch and enter member name/phone/ID or scan QR.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post<CheckInResult>('/attendance/check-in', {
        searchQuery: query.trim(),
        branchId,
        method,
      });
      setResult(data);
      setQuery('');
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div>
        <h1 className="text-2xl font-semibold">Check-in Desk</h1>
        <p className="text-sm text-muted-foreground">Scan a QR code or search a member — a few seconds per check-in</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Member check-in</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={doCheckIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Branch *</label>
                <Select required value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  <option value="">Select branch...</option>
                  {(branchData?.items ?? []).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Member (name / phone / member ID / QR) *</label>
                <Input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Scan QR or type to search..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Method</label>
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="QR">QR Scan</option>
                  <option value="MANUAL">Manual</option>
                  <option value="CARD">Member Card</option>
                  <option value="BIOMETRIC">Biometric</option>
                </Select>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? <Spinner /> : 'Check in member'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Result</CardTitle></CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <Badge variant={result.result === 'SUCCESS' ? 'success' : 'warning'}>
                  {result.result}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Checked in at {new Date(result.attendance.checkInAt).toLocaleTimeString()}
                </p>
                {result.warning ? (
                  <p className="rounded bg-amber-50 p-3 text-sm text-amber-800">{result.warning}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Check-in results will appear here.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}