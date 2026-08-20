'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, Button, Badge, Table, Th, Td } from '@/components/ui';
import { INITIAL_INVOICES } from '@/lib/mockData';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = INITIAL_INVOICES.find((i) => i.id === params.id) || INITIAL_INVOICES[0];

  function handlePrint() {
    window.print();
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto py-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link href="/billing">
            <Button variant="outline" size="sm">← Back to Invoices</Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white">
              🖨️ Print GST Invoice
            </Button>
          </div>
        </div>

        {/* Tax Invoice Printable Card */}
        <Card className="bg-white border-slate-300 shadow-xl p-8 print:shadow-none print:border-none">
          <CardContent className="p-0 space-y-6">
            {/* Invoice Header with Gym Info */}
            <div className="flex justify-between border-b pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold">⚡</div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">PowerHouse Gym & SaaS</span>
                </div>
                <p className="text-xs text-slate-600">100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038</p>
                <p className="text-xs text-slate-600">Phone: +91 98000 77777 | Email: billing@powerhousegym.in</p>
                <p className="text-xs font-mono font-semibold text-slate-700 mt-1">GSTIN: 29AAAAA0000A1Z5</p>
              </div>

              <div className="text-right">
                <Badge variant="outline" className="text-xs uppercase tracking-wider mb-2 font-mono">Tax Invoice</Badge>
                <h2 className="text-2xl font-extrabold text-blue-600 font-mono">{invoice.invoiceNumber}</h2>
                <p className="text-xs text-slate-500 mt-1">Date: {invoice.createdAt}</p>
                <div className="mt-2">
                  <Badge variant={invoice.status === 'PAID' ? 'success' : 'warning'}>{invoice.status}</Badge>
                </div>
              </div>
            </div>

            {/* Billed To Member Info */}
            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border text-xs">
              <div>
                <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Billed To (Member):</p>
                <p className="font-bold text-sm text-slate-900">{invoice.memberName}</p>
                <p className="font-mono text-slate-600">Member ID: {invoice.memberCode}</p>
                <p className="text-slate-600">Contact: {invoice.memberMobile}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Details:</p>
                <p className="text-slate-700">Subtotal: ₹{invoice.subtotal.toLocaleString()}</p>
                <p className="text-slate-700">Discount: -₹{invoice.discountTotal.toLocaleString()}</p>
                <p className="text-slate-700 font-medium">GST (18%): ₹{invoice.taxTotal.toLocaleString()}</p>
                <p className="font-bold text-sm text-slate-900 mt-1">Grand Total: ₹{invoice.grandTotal.toLocaleString()}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <Table>
                <thead>
                  <tr className="bg-slate-100">
                    <Th>Description</Th>
                    <Th>Qty</Th>
                    <Th>Unit Price (₹)</Th>
                    <Th>Total (₹)</Th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <Td className="font-semibold text-slate-900">{item.description}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>₹{item.unitPrice.toLocaleString()}</Td>
                      <Td className="font-bold text-slate-900">₹{item.lineTotal.toLocaleString()}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Invoice Total Summary */}
            <div className="flex justify-end pt-4">
              <div className="w-64 space-y-2 text-xs border-t pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span>-₹{invoice.discountTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Tax (18%)</span>
                  <span>₹{invoice.taxTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{invoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Total Paid</span>
                  <span>₹{invoice.paidTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold border-t pt-1">
                  <span>Balance Due</span>
                  <span>₹{invoice.balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Receipts History */}
            {invoice.payments.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Payment Receipts History</p>
                <div className="space-y-2">
                  {invoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs p-2 rounded bg-slate-50 border">
                      <span className="font-mono font-semibold">{p.receiptNumber} ({p.mode})</span>
                      <span className="text-slate-500">{p.createdAt}</span>
                      <span className="font-bold text-emerald-700">₹{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="border-t pt-6 text-center text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700">Thank you for training with PowerHouse Gym!</p>
              <p>This is a computer generated tax invoice issued under GymPro SaaS Platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
