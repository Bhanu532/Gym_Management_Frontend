'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Table, Th, Td, Modal, Input, Select } from '@/components/ui';

interface Equipment {
  id: string;
  assetId: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  status: 'ACTIVE' | 'UNDER_MAINTENANCE' | 'BROKEN' | 'RETIRED';
}

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', assetId: 'EQ-TRD-001', name: 'Commercial Treadmill T8000', category: 'Cardio', purchaseDate: '2024-01-15', purchasePrice: 185000, warrantyExpiry: '2027-01-15', status: 'ACTIVE' },
  { id: 'eq-2', assetId: 'EQ-SQT-002', name: 'Heavy Duty Power Squat Rack', category: 'Strength', purchaseDate: '2024-02-10', purchasePrice: 75000, warrantyExpiry: '2029-02-10', status: 'ACTIVE' },
  { id: 'eq-3', assetId: 'EQ-CBL-003', name: 'Dual Adjustable Cable Crossover', category: 'Strength', purchaseDate: '2024-03-01', purchasePrice: 140000, warrantyExpiry: '2027-03-01', status: 'UNDER_MAINTENANCE' },
];

export default function EquipmentPage() {
  const [equipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipment Assets & Maintenance</h1>
          <p className="text-sm text-slate-500">Track gym machines, serial numbers, warranty dates, service history & repair schedules</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + Add Equipment Asset
        </Button>
      </div>

      <Card className="bg-white">
        <CardHeader className="border-b pb-4">
          <CardTitle>Asset Register</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <thead>
              <tr>
                <Th>Asset ID</Th>
                <Th>Equipment Name</Th>
                <Th>Category</Th>
                <Th>Purchase Date</Th>
                <Th>Price (₹)</Th>
                <Th>Warranty Expiry</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-50">
                  <Td className="font-mono text-xs font-bold text-blue-600">{eq.assetId}</Td>
                  <Td className="font-semibold text-slate-900">{eq.name}</Td>
                  <Td><Badge variant="outline">{eq.category}</Badge></Td>
                  <Td>{eq.purchaseDate}</Td>
                  <Td>₹{eq.purchasePrice.toLocaleString()}</Td>
                  <Td>{eq.warrantyExpiry}</Td>
                  <Td><Badge variant={eq.status === 'ACTIVE' ? 'success' : 'warning'}>{eq.status}</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Equipment Asset">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Equipment Name *</label>
            <Input placeholder="ex: Olympic Barbell Set 20kg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold">Asset ID Code</label><Input placeholder="ex: EQ-BAR-004" /></div>
            <div><label className="text-xs font-semibold">Purchase Price (₹)</label><Input type="number" placeholder="ex: 25000" /></div>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setModalOpen(false); alert('Equipment asset registered!'); }}>
            Save Asset Record
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
