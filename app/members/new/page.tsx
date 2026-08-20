'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, Textarea, Badge } from '@/components/ui';
import { api } from '@/lib/api';

export default function NewMemberWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number | string; taxPercent: number | string; durationValue: number; durationUnit: string }>>([]);
  const [trainers, setTrainers] = useState<Array<{ id: string; firstName?: string; name?: string; user?: { name?: string } }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State across 6 steps
  const [formData, setFormData] = useState({
    // Step 1: Personal
    name: '',
    mobile: '',
    email: '',
    dob: '',
    gender: 'MALE',
    address: '',
    fitnessGoals: '',
    branchId: '',

    // Step 2: Emergency Contact
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',

    // Step 3: Membership Plan
    planId: '',
    planName: '',
    planAmount: 0,
    taxPercent: 0,
    discountAmount: 0,
    startDate: '',

    // Step 4: Trainer
    trainerId: '',

    // Step 5: Health Profile
    heightCm: '',
    weightKg: '',
    medicalNotes: '',
    injuryNotes: '',

    // Step 6: Payment
    paymentMode: 'UPI',
    paidAmount: 0,
  });

  React.useEffect(() => {
    async function loadOptions() {
      try {
        const [branchRes, planRes, trainerRes] = await Promise.all([
          api.get<{ items: Array<{ id: string; name: string }> }>('/branches'),
          api.get<{ items: Array<{ id: string; name: string; price: number | string; taxPercent: number | string; durationValue: number; durationUnit: string }> }>('/memberships/plans'),
          api.get<Array<{ id: string; firstName?: string; name?: string; user?: { name?: string } }>>('/trainers'),
        ]);
        if (branchRes.items && branchRes.items.length > 0) {
          setBranches(branchRes.items);
          setFormData((prev) => ({ ...prev, branchId: branchRes.items[0].id }));
        }
        if (planRes.items && planRes.items.length > 0) {
          setPlans(planRes.items);
          const first = planRes.items[0];
          setFormData((prev) => ({
            ...prev,
            planId: first.id,
            planName: first.name,
            planAmount: Number(first.price),
            taxPercent: Number(first.taxPercent),
          }));
        }
        const trainerItems = Array.isArray(trainerRes) ? trainerRes : (trainerRes as { items?: unknown[] }).items || [];
        setTrainers(trainerItems as Array<{ id: string; firstName?: string; name?: string; user?: { name?: string } }>);
      } catch (e) {
        console.error('Failed to load branches/plans/trainers', e);
      }
    }
    void loadOptions();
  }, []);

  const selectedPlan = plans.find((p) => p.id === formData.planId);
  const planTaxPercent = formData.taxPercent;
  const totalTax = Math.round((formData.planAmount - formData.discountAmount) * (planTaxPercent / 100) * 100) / 100;
  const grandTotal = formData.planAmount - formData.discountAmount + totalTax;

  async function handleComplete() {
    if (!formData.name || !formData.mobile || !formData.branchId) {
      setError('Please fill in required fields: Name, Phone, and Branch.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await api.post('/members', {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email || undefined,
        dob: formData.dob || undefined,
        gender: formData.gender,
        address: formData.address || undefined,
        fitnessGoals: formData.fitnessGoals || undefined,
        branchId: formData.branchId,
        planId: formData.planId || undefined,
        membershipStartDate: formData.startDate || undefined,
        emergencyName: formData.emergencyName || undefined,
        emergencyRelation: formData.emergencyRelation || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        healthNotes: formData.medicalNotes || undefined,
        injuryNotes: formData.injuryNotes || undefined,
      });

      router.push('/members');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete member onboarding');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto py-4">
        {/* Wizard Header & Progress Bar */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Member Onboarding Wizard</h1>
          <p className="text-sm text-slate-500">Step {step} of 6 — Complete production registration & invoice creation</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
                <span className="text-[10px] font-semibold text-slate-500 block text-center mt-1">
                  {s === 1 ? 'Personal' : s === 2 ? 'Emergency' : s === 3 ? 'Membership' : s === 4 ? 'Trainer' : s === 5 ? 'Health' : 'Payment'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="bg-white shadow-lg border-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg">
              {step === 1 && 'Step 1: Personal Details'}
              {step === 2 && 'Step 2: Emergency Contact Info'}
              {step === 3 && 'Step 3: Select Membership Plan'}
              {step === 4 && 'Step 4: Trainer Assignment'}
              {step === 5 && 'Step 5: Health & Fitness Assessment'}
              {step === 6 && 'Step 6: Payment, QR Code & Invoice Generation'}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ex: Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Mobile Phone (+91) *</label>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="ex: +91 98765 43210"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ex: user@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Gender</label>
                    <Select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Date of Birth</label>
                    <Input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Assigned Gym Branch *</label>
                    <Select
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Address</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ex: Indiranagar, Bengaluru"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Emergency Contact Person Name *</label>
                  <Input
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    placeholder="ex: Ramesh Sharma"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Relation</label>
                    <Input
                      value={formData.emergencyRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      placeholder="ex: Father"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Emergency Phone Number *</label>
                    <Input
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="ex: +91 98765 00000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Select Membership Plan *</label>
                  <Select
                    value={formData.planId}
                    onChange={(e) => {
                      const p = plans.find((pl) => pl.id === e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        planId: e.target.value,
                        planName: p?.name ?? prev.planName,
                        planAmount: p ? Number(p.price) : prev.planAmount,
                        taxPercent: p ? Number(p.taxPercent) : prev.taxPercent,
                      }));
                    }}
                  >
                    <option value="">— No Plan (Pay-as-you-go) —</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{Number(p.price).toLocaleString()} / {p.durationValue} {p.durationUnit})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Membership Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Discount Amount (₹)</label>
                    <Input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1 text-blue-900">
                  <p className="font-semibold">Plan Summary Breakdown:</p>
                  <p>Subtotal: ₹{formData.planAmount.toLocaleString()}</p>
                  <p>Discount: -₹{formData.discountAmount.toLocaleString()}</p>
                  <p>GST (18%): ₹{totalTax.toLocaleString()}</p>
                  <p className="font-bold text-sm text-blue-950">Grand Total Payable: ₹{grandTotal.toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Assign Personal Trainer</label>
                  <Select
                    value={formData.trainerId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, trainerId: e.target.value }))}
                  >
                    <option value="">No Trainer Assigned</option>
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name || t.firstName || t.user?.name || 'Trainer'}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Primary Fitness Goal</label>
                  <Input
                    value={formData.fitnessGoals}
                    onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                    placeholder="e.g. Weight Loss, Muscle Building, Athletic Performance"
                  />
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Height (cm)</label>
                    <Input
                      type="number"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      placeholder="ex: 175"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold">Weight (kg)</label>
                    <Input
                      type="number"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      placeholder="ex: 72"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Medical History & Allergies</label>
                  <Textarea
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Injuries or Physical Limitations</label>
                  <Textarea
                    value={formData.injuryNotes}
                    onChange={(e) => setFormData({ ...formData, injuryNotes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <Badge variant="success">Member Profile Ready</Badge>
                    <p className="text-lg font-bold text-emerald-950 mt-1">{formData.name}</p>
                    <p className="text-xs text-emerald-800">Generated Member ID: <span className="font-mono font-bold">GYM-AUTO</span></p>
                  </div>

                  {/* QR Pass Box */}
                  <div className="flex flex-col items-center bg-white p-3 rounded-lg border shadow-xs">
                    <div className="h-16 w-16 bg-slate-900 flex items-center justify-center text-white font-mono text-[10px] font-bold rounded">
                      [ QR CODE ]
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-1">QR-GYM-AUTO</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold">Payment Mode *</label>
                  <Select
                    value={formData.paymentMode}
                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash Payment</option>
                    <option value="CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border space-y-2 text-xs">
                  <p className="font-bold text-sm text-slate-900">Invoice Preview (INV-2026-005)</p>
                  <div className="flex justify-between border-b pb-1">
                    <span>{formData.planName}</span>
                    <span>₹{formData.planAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Discount</span>
                    <span className="text-rose-600">-₹{formData.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>GST (18%)</span>
                    <span>₹{totalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                    <span>Total Paid Amount</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t pt-6 mt-6">
              <Button
                variant="outline"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
              >
                ← Back
              </Button>

              {step < 6 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-blue-600 hover:bg-blue-700">
                  Continue Next Step →
                </Button>
              ) : (
                <Button onClick={handleComplete} className="bg-emerald-600 hover:bg-emerald-700">
                  🎉 Complete Onboarding & Issue Receipt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
