'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td } from '@/components/ui';
import { INITIAL_ATTENDANCES, INITIAL_MEMBERS, INITIAL_INVOICES, INITIAL_LEADS } from '@/lib/mockData';

// Keep server and browser output identical during hydration. The host locale can
// otherwise render either a 12-hour or 24-hour clock for the same timestamp.
const checkInTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function formatCheckInTime(value: string) {
  return checkInTimeFormatter.format(new Date(value));
}

export default function ReceptionistDashboard() {
  const [attendances] = useState(INITIAL_ATTENDANCES);
  const [members] = useState(INITIAL_MEMBERS);

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Front Desk Console</h1>
          <p className="text-sm text-slate-500">Receptionist daily operations, quick check-ins, payments & member services</p>
        </div>

        {/* Primary Quick Actions for Front Desk */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/attendance">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
              ✅ Fast Check-in Desk
            </Button>
          </Link>
          <Link href="/members/new">
            <Button size="lg" variant="default" className="bg-blue-600 hover:bg-blue-700 shadow-md">
              + New Member
            </Button>
          </Link>
          <Link href="/leads/new">
            <Button size="lg" variant="outline">
              📥 Register Enquiry
            </Button>
          </Link>
          <Link href="/billing">
            <Button size="lg" variant="outline">
              💰 Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Receptionist Daily KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-emerald-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Check-ins</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">48</span>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Last check-in: 4 mins ago</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Collections</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">₹19,518</span>
              <Badge variant="default">3 Payments</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Cash & UPI verified</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expiring Memberships</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">7</span>
              <Badge variant="warning">Action Needed</Badge>
            </div>
            <p className="text-xs text-amber-700 mt-2">Requires renewal follow-up</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-white">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Enquiries</p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-slate-900">5</span>
              <Badge variant="secondary">Today</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">2 trial sessions booked</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Check-ins + Pending Renewal Quick List */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Visitor Log */}
        <Card className="lg:col-span-2 bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg">Today's Live Check-in Stream</CardTitle>
              <p className="text-xs text-slate-500">Real-time attendance entries at front desk</p>
            </div>
            <Link href="/attendance">
              <Button size="sm" variant="outline">Open Scanner Desk →</Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <thead>
                <tr>
                  <Th>Time</Th>
                  <Th>Member</Th>
                  <Th>Plan</Th>
                  <Th>Dues</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <Td className="font-mono text-xs font-semibold">{formatCheckInTime(att.checkInAt)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                          {att.memberName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{att.memberName}</p>
                          <p className="font-mono text-[10px] text-slate-500">{att.memberCode}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>{att.membershipPlan}</Td>
                    <Td>
                      {att.dues > 0 ? (
                        <span className="font-semibold text-rose-600 text-xs">₹{att.dues.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-semibold">Cleared</span>
                      )}
                    </Td>
                    <Td>
                      <Badge variant={att.result === 'SUCCESS' ? 'success' : 'warning'}>{att.result}</Badge>
                    </Td>
                    <Td>
                      <Button size="sm" variant="ghost">Check Out</Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        {/* Expiring Soon / Follow-up Widget */}
        <Card className="bg-white">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg">Members Expiring Soon</CardTitle>
            <p className="text-xs text-slate-500">Contact to collect renewal</p>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {members.filter((m) => m.status === 'ACTIVE' || m.status === 'EXPIRED').slice(0, 3).map((m) => (
              <div key={m.id} className="p-3 rounded-lg border bg-slate-50 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.mobile}</p>
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Expires: {m.memberships[0]?.expiryDate ?? 'N/A'}
                  </p>
                </div>
                <Link href={`/members/${m.id}`}>
                  <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Renew
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
