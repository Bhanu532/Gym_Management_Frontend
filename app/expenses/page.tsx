'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface Expense {
  id: string;
  category: 'Rent' | 'Utilities' | 'Salary' | 'Maintenance' | 'Equipment' | 'Marketing' | 'Other';
  title: string;
  amount: number;
  vendorName: string;
  expenseDate: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', category: 'Rent', title: 'Monthly Facility Building Rent', amount: 85000, vendorName: 'Indiranagar Realty Ltd', expenseDate: '2026-08-01', status: 'APPROVED' },
  { id: 'exp-2', category: 'Utilities', title: 'Electricity & Aircon Power Bill', amount: 24500, vendorName: 'BESCOM Karnataka', expenseDate: '2026-08-05', status: 'APPROVED' },
  { id: 'exp-3', category: 'Maintenance', title: 'Treadmill Belt Servicing', amount: 4500, vendorName: 'FitTech Services', expenseDate: '2026-08-10', status: 'APPROVED' },
  { id: 'exp-4', category: 'Marketing', title: 'Instagram & Facebook Ads Campaign', amount: 12000, vendorName: 'Meta Ads', expenseDate: '2026-08-12', status: 'APPROVED' },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Maintenance' as const,
    title: '',
    amount: 0,
    vendorName: '',
  });

  function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    const created: Expense = {
      id: 'exp-' + Date.now(),
      category: newExp.category,
      title: newExp.title,
      amount: newExp.amount,
      vendorName: newExp.vendorName,
      expenseDate: new Date().toISOString().split('T')[0],
      status: 'APPROVED',
    };
    setExpenses([created, ...expenses]);
    setModalOpen(false);
  }

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gym Expense Management</h1>
          <p className="text-sm text-slate-500">Record operating expenses, rent, staff salaries, equipment maintenance & marketing spend</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Record Expense
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-white border-l-4 border-l-rose-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Monthly Expenses</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalExpenseAmount.toLocaleString()}</p>
            <p className="text-xs text-rose-600 font-semibold mt-1">4 Recorded Entries</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Largest Expense Category</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">Facility Rent</p>
            <p className="text-xs text-slate-500 mt-1">₹85,000 / month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Status</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">100% Approved</p>
            <p className="text-xs text-slate-500 mt-1">Owner verified</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Expense Register</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Title / Description</Th>
                <Th>Category</Th>
                <Th>Vendor / Payee</Th>
                <Th>Expense Date</Th>
                <Th>Amount (₹)</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">{exp.title}</Td>
                  <Td><Badge variant="outline">{exp.category}</Badge></Td>
                  <Td>{exp.vendorName}</Td>
                  <Td>{exp.expenseDate}</Td>
                  <Td className="font-bold text-rose-600">₹{exp.amount.toLocaleString()}</Td>
                  <Td><Badge variant="success">{exp.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Gym Operating Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Expense Description *</label>
            <Input required value={newExp.title} onChange={(e) => setNewExp({ ...newExp, title: e.target.value })} placeholder="AC Servicing / Dumbbell Set Purchase" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Category</label>
              <Select value={newExp.category} onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Salary">Salary</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Equipment">Equipment</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Amount (₹) *</label>
              <Input type="number" required value={newExp.amount} onChange={(e) => setNewExp({ ...newExp, amount: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Vendor / Payee Name</label>
            <Input value={newExp.vendorName} onChange={(e) => setNewExp({ ...newExp, vendorName: e.target.value })} placeholder="Vendor Ltd" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Expense Entry</Button>
        </form>
      </Modal>
    </AppShell>
  );
}
