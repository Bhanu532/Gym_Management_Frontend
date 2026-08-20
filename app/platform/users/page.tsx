'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface PlatformUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt: string;
  twoFactor: boolean;
}

const INITIAL_PLATFORM_USERS: PlatformUserRow[] = [
  { id: 'pu-1', name: 'Platform Super Admin', email: 'superadmin@platform.local', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLoginAt: '2026-08-17 09:12 AM', twoFactor: true },
  { id: 'pu-2', name: 'Dev Ops Admin', email: 'devops@platform.local', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLoginAt: '2026-08-16 11:40 AM', twoFactor: true },
  { id: 'pu-3', name: 'Billing Support', email: 'support@platform.local', role: 'SUPER_ADMIN', status: 'DISABLED', lastLoginAt: '2026-07-30 04:20 PM', twoFactor: false },
];

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUserRow[]>(INITIAL_PLATFORM_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'SUPER_ADMIN' });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const created: PlatformUserRow = {
      id: 'pu-' + Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'ACTIVE',
      lastLoginAt: 'Never',
      twoFactor: false,
    };
    setUsers([...users, created]);
    setNewUser({ name: '', email: '', role: 'SUPER_ADMIN' });
    setModalOpen(false);
  }

  function toggleStatus(id: string) {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : u)));
  }

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono mb-1">
            ⚡ PLATFORM ADMINISTRATION
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">Platform Users</h1>
          <p className="text-sm text-slate-500">Manage SaaS platform administrator accounts & access</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setModalOpen(true)}>
          + Invite Platform User
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Platform Administrator Accounts</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>2FA</Th>
                <Th>Last Login</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                    <p className="font-mono text-[10px] text-slate-500">{u.email}</p>
                  </Td>
                  <Td><Badge variant="outline" className="font-mono">{u.role}</Badge></Td>
                  <Td><Badge variant={u.status === 'ACTIVE' ? 'success' : 'warning'}>{u.status}</Badge></Td>
                  <Td>{u.twoFactor ? '✅ Enabled' : '—'}</Td>
                  <Td className="text-xs">{u.lastLoginAt}</Td>
                  <Td>
                    <Button size="sm" variant="ghost" onClick={() => toggleStatus(u.id)}>
                      {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Invite Platform User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <Input
              required
              placeholder="Platform Admin"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
            <Input
              required
              type="email"
              placeholder="admin@platform.local"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role</label>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Send Invite</Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
