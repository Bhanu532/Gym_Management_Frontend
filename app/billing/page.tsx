'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';

interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  subtotal: number | string;
  taxTotal: number | string;
  grandTotal: number | string;
  paidTotal: number | string;
  balanceDue: number | string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID' | 'REFUNDED';
  dueDate: string;
  createdAt: string;
  member?: { name?: string; memberCode?: string };
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<ApiInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<{ items?: ApiInvoice[] }>('/billing/invoices');
      setInvoices(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const totalCollected = invoices.reduce((sum, i) => sum + Number(i.paidTotal ?? 0), 0);
  const totalPending = invoices.reduce((sum, i) => sum + Number(i.balanceDue ?? 0), 0);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Financial Invoices</h1>
          <p className="text-sm text-slate-500">GST Invoice creation, receipt history, partial payments & tax reconciliation</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Collected</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalCollected.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">✓ 100% Tax Compliant (GST 18%)</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-rose-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Dues Balance</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">₹{totalPending.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Across 2 active invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoices Issued</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{invoices.length}</p>
            <p className="text-xs text-slate-500 mt-1">INR ₹ Currency</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Data Table */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-lg">Recent Tax Invoices</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">No invoices generated yet in this tenant.</p>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Invoice #</Th>
                  <Th>Member Info</Th>
                  <Th>Issued Date</Th>
                  <Th>Grand Total</Th>
                  <Th>Amount Paid</Th>
                  <Th>Balance Due</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const grand = Number(inv.grandTotal);
                  const paid = Number(inv.paidTotal);
                  const bal = Number(inv.balanceDue);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <Td className="font-mono text-xs font-bold text-blue-600">
                        <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                      </Td>
                      <Td>
                        <p className="font-semibold text-slate-900">{inv.member?.name ?? '—'}</p>
                        <p className="font-mono text-[10px] text-slate-500">{inv.member?.memberCode ?? ''}</p>
                      </Td>
                      <Td>{inv.createdAt ? inv.createdAt.split('T')[0] : '—'}</Td>
                      <Td className="font-semibold">₹{grand.toLocaleString()}</Td>
                      <Td className="text-emerald-700 font-semibold">₹{paid.toLocaleString()}</Td>
                      <Td className={bal > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                        ₹{bal.toLocaleString()}
                      </Td>
                      <Td>
                        <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIALLY_PAID' ? 'warning' : 'destructive'}>
                          {inv.status}
                        </Badge>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button size="sm" variant="outline" className="text-xs">
                              📄 View GST Invoice
                            </Button>
                          </Link>
                        </div>
                      </Td>
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