'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Textarea, Select } from '@/components/ui';

interface NotificationLog {
  id: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'IN_APP';
  triggerEvent: string;
  recipientName: string;
  recipientContact: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentAt: string;
}

const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  { id: 'notif-1', channel: 'WHATSAPP', triggerEvent: 'Membership Expiry Reminder (7 Days)', recipientName: 'Rahul Sharma', recipientContact: '+91 98765 43210', status: 'SENT', sentAt: '2026-08-17 09:30 AM' },
  { id: 'notif-2', channel: 'SMS', triggerEvent: 'Payment Receipt Confirmation', recipientName: 'Priya Reddy', recipientContact: '+91 98123 45678', status: 'SENT', sentAt: '2026-08-17 08:15 AM' },
  { id: 'notif-3', channel: 'WHATSAPP', triggerEvent: 'Class Booking Confirmation', recipientName: 'Amit Patel', recipientContact: '+91 98450 12345', status: 'SENT', sentAt: '2026-08-16 05:45 PM' },
];

export default function NotificationsPage() {
  const [notifs] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);
  const [templateModal, setTemplateModal] = useState(false);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification & Communication Center</h1>
          <p className="text-sm text-slate-500">Automated WhatsApp, SMS, Email & In-App triggers for membership renewals, payments & reminders</p>
        </div>

        <Button onClick={() => setTemplateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          ⚙️ Configure Templates
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp Status</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">Connected ✅</p>
            <p className="text-xs text-slate-500 mt-1">Meta WhatsApp Business API</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SMS Gateway</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">Active 💬</p>
            <p className="text-xs text-slate-500 mt-1">DLT Approved Templates</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-purple-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Gateway</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">Connected 📧</p>
            <p className="text-xs text-slate-500 mt-1">AWS SES / SendGrid</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Messages Sent Today</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">142 Messages</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">99.2% Delivery Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Sent Notification Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Recipient</Th>
                <Th>Channel</Th>
                <Th>Trigger Event</Th>
                <Th>Contact</Th>
                <Th>Timestamp</Th>
                <Th>Delivery Status</Th>
              </tr>
            </thead>
            <tbody>
              {notifs.map((n) => (
                <tr key={n.id} className="hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">{n.recipientName}</Td>
                  <Td><Badge variant="outline">{n.channel}</Badge></Td>
                  <Td className="text-xs font-medium text-slate-700">{n.triggerEvent}</Td>
                  <Td className="font-mono text-xs">{n.recipientContact}</Td>
                  <Td className="text-xs text-slate-500">{n.sentAt}</Td>
                  <Td><Badge variant="success">{n.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={templateModal} onClose={() => setTemplateModal(false)} title="Configure Notification Template">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Event Trigger</label>
            <Select defaultValue="EXPIRY_REMINDER">
              <option value="EXPIRY_REMINDER">Membership Expiry Warning</option>
              <option value="PAYMENT_RECEIPT">Payment Receipt</option>
              <option value="CLASS_BOOKING">Class Booking Confirmation</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">WhatsApp / SMS Template Text</label>
            <Textarea placeholder="ex: Hi {{member_name}}, your {{plan_name}} membership at {{gym_name}} expires on {{expiry_date}}. Renew today to avoid interruption!" />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setTemplateModal(false); alert('Template updated!'); }}>
            Save Communication Template
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
