'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td } from '@/components/ui';
import { INITIAL_INVOICES } from '@/lib/mockData';

export default function PendingDuesPage() {
  const pendingInvoices = INITIAL_INVOICES.filter((i) => i.balanceDue > 0);

  function handleSendReminder(name: string, phone: string, amount: number) {
    alert(`Payment reminder sent via WhatsApp & SMS to ${name} (${phone}) for ₹${amount.toLocaleString()}`);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Dues & Recovery</h1>
          <p className="text-sm text-slate-500">Track members with outstanding balances, send automated payment reminders & collect payments</p>
        </div>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Outstanding Member Balances</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Invoice #</Th>
                <Th>Total Invoice</Th>
                <Th>Amount Paid</Th>
                <Th>Outstanding Dues</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {pendingInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-bold text-slate-900 text-sm">{inv.memberName}</p>
                    <p className="font-mono text-xs text-slate-500">{inv.memberMobile}</p>
                  </Td>
                  <Td className="font-mono text-xs font-bold text-blue-600">
                    <Link href={`/invoices/${inv.id}`}>{inv.invoiceNumber}</Link>
                  </Td>
                  <Td>₹{inv.grandTotal.toLocaleString()}</Td>
                  <Td className="text-emerald-700">₹{inv.paidTotal.toLocaleString()}</Td>
                  <Td className="font-bold text-rose-600">₹{inv.balanceDue.toLocaleString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleSendReminder(inv.memberName, inv.memberMobile, inv.balanceDue)}
                      >
                        📲 Send Reminder
                      </Button>
                      <Button size="sm" variant="outline" disabled className="text-xs opacity-60 cursor-not-allowed">
                        💰 Collect Payment (Coming Soon)
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}