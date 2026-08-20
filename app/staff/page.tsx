'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface StaffMember {
  id: string;
  name: string;
  role: 'OWNER_ADMIN' | 'TRAINER_ADMIN' | 'RECEPTIONIST' | 'TRAINER' | 'MANAGER' | 'DIETITIAN';
  email: string;
  mobile: string;
  branchName: string;
  shiftHours: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED';
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st-1',
    name: 'Vikramaditya Rao',
    role: 'OWNER_ADMIN',
    email: 'owner@demogym.com',
    mobile: '+91 98000 77777',
    branchName: 'All Branches (Primary)',
    shiftHours: 'Full Access (Owner)',
    status: 'ACTIVE',
  },
  {
    id: 'st-2',
    name: 'Pooja Sharma',
    role: 'RECEPTIONIST',
    email: 'reception@demogym.com',
    mobile: '+91 98765 44444',
    branchName: 'Downtown Branch',
    shiftHours: '06:00 AM - 02:00 PM (Morning Shift)',
    status: 'ACTIVE',
  },
  {
    id: 'st-3',
    name: 'Vikram Singh',
    role: 'TRAINER',
    email: 'trainer@demogym.com',
    mobile: '+91 98765 11111',
    branchName: 'Downtown Branch',
    shiftHours: '06:00 AM - 02:00 PM',
    status: 'ACTIVE',
  },
];

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'RECEPTIONIST' as const,
    email: '',
    mobile: '',
    shiftHours: '02:00 PM - 10:00 PM (Evening Shift)',
  });

  function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    const created: StaffMember = {
      id: 'st-' + Date.now(),
      name: newStaff.name,
      role: newStaff.role,
      email: newStaff.email,
      mobile: newStaff.mobile,
      branchName: 'Downtown Branch',
      shiftHours: newStaff.shiftHours,
      status: 'ACTIVE',
    };
    setStaff([...staff, created]);
    setModalOpen(false);
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Role Access Control</h1>
          <p className="text-sm text-slate-500">Manage employee accounts, RBAC permission roles, branch assignments & shift schedules</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add Staff Account
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Gym Employee Directory</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Staff Member</Th>
                <Th>System Role</Th>
                <Th>Branch Assignment</Th>
                <Th>Shift Schedule</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="font-mono text-xs text-slate-500">{s.email}</p>
                  </Td>
                  <Td><Badge variant="outline" className="font-mono">{s.role}</Badge></Td>
                  <Td>{s.branchName}</Td>
                  <Td className="text-xs text-slate-600 font-medium">{s.shiftHours}</Td>
                  <Td className="font-mono text-xs">{s.mobile}</Td>
                  <Td><Badge variant={s.status === 'ACTIVE' ? 'success' : 'destructive'}>{s.status}</Badge></Td>
                  <Td><Button size="sm" variant="ghost">Edit Permissions</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Staff Account">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Staff Name *</label>
            <Input required value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Kavita Reddy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Email *</label>
              <Input type="email" required value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="kavita@gympro.in" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Role Access *</label>
              <Select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="TRAINER">Trainer / Coach</option>
                <option value="TRAINER_ADMIN">Trainer Admin</option>
                <option value="MANAGER">Branch Manager</option>
                <option value="DIETITIAN">Dietitian</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Employee Account</Button>
        </form>
      </Modal>
    </AppShell>
  );
}