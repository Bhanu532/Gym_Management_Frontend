// Rich realistic Indian Gym SaaS Mock Data Layer

export interface MockMember {
  id: string;
  tenantId: string;
  branchId: string;
  memberCode: string;
  qrCode: string;
  name: string;
  photoUrl: string;
  mobile: string;
  email: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  fitnessGoals: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'SUSPENDED' | 'ARCHIVED';
  joinedAt: string;
  branch: { id: string; name: string };
  memberships: Array<{
    id: string;
    plan: { id: string; name: string; price: number };
    startDate: string;
    expiryDate: string;
    status: 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'CANCELLED';
  }>;
  emergencyContact?: { name: string; relation: string; phone: string };
  healthProfile?: { heightCm: number; weightKg: number; medicalNotes?: string; injuryNotes?: string; allergies?: string };
  assignedTrainer?: { id: string; name: string };
  _count: { attendances: number; invoices: number };
}

export interface MockLead {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  mobile: string;
  email?: string;
  source: 'WALK_IN' | 'PHONE' | 'WEBSITE' | 'SOCIAL_MEDIA' | 'REFERRAL';
  status: 'NEW' | 'CONTACTED' | 'TRIAL_SCHEDULED' | 'FOLLOW_UP' | 'CONVERTED' | 'LOST';
  interest?: string;
  notes?: string;
  followUpDate?: string;
  assignedTo?: { id: string; name: string };
  branch: { id: string; name: string };
  createdAt: string;
}

export interface MockInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  memberMobile: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidTotal: number;
  balanceDue: number;
  status: 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
  createdAt: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; lineTotal: number }>;
  payments: Array<{ id: string; receiptNumber: string; amount: number; mode: string; createdAt: string }>;
}

export interface MockAttendance {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  photoUrl?: string;
  membershipPlan: string;
  expiryDate: string;
  dues: number;
  checkInAt: string;
  checkOutAt?: string;
  result: 'SUCCESS' | 'BLOCKED_EXPIRED' | 'BLOCKED_FROZEN' | 'BLOCKED_SUSPENDED' | 'WARNED';
  method: 'QR' | 'MANUAL' | 'CARD' | 'BIOMETRIC';
  branchName: string;
}

export interface MockTenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED' | 'CANCELLED';
  planName: string;
  membersCount: number;
  branchesCount: number;
  mrr: number;
  createdAt: string;
}

export const INITIAL_MEMBERS: MockMember[] = [
  {
    id: 'mem-101',
    tenantId: 'tenant-1',
    branchId: 'br-1',
    memberCode: 'GYM-1001',
    qrCode: 'QR-GYM-1001',
    name: 'Rahul Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    mobile: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    dob: '1995-04-12',
    gender: 'MALE',
    address: 'Indiranagar, Bengaluru, Karnataka',
    fitnessGoals: 'Muscle gain & strength training',
    status: 'ACTIVE',
    joinedAt: '2025-01-15',
    branch: { id: 'br-1', name: 'Downtown Branch' },
    memberships: [
      {
        id: 'ms-1',
        plan: { id: 'p-annual', name: 'Premium Annual', price: 14999 },
        startDate: '2025-01-15',
        expiryDate: '2026-01-15',
        status: 'ACTIVE',
      },
    ],
    emergencyContact: { name: 'Sunita Sharma', relation: 'Mother', phone: '+91 98765 00000' },
    healthProfile: { heightCm: 178, weightKg: 76, medicalNotes: 'None', injuryNotes: 'Past wrist strain' },
    assignedTrainer: { id: 'tr-1', name: 'Vikram Singh' },
    _count: { attendances: 42, invoices: 2 },
  },
  {
    id: 'mem-102',
    tenantId: 'tenant-1',
    branchId: 'br-1',
    memberCode: 'GYM-1002',
    qrCode: 'QR-GYM-1002',
    name: 'Priya Reddy',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    mobile: '+91 98123 45678',
    email: 'priya.reddy@example.com',
    dob: '1998-08-23',
    gender: 'FEMALE',
    address: 'Koramangala, Bengaluru',
    fitnessGoals: 'Weight loss & Flexibility',
    status: 'ACTIVE',
    joinedAt: '2025-03-01',
    branch: { id: 'br-1', name: 'Downtown Branch' },
    memberships: [
      {
        id: 'ms-2',
        plan: { id: 'p-quarterly', name: 'Quarterly Fitness', price: 4499 },
        startDate: '2025-06-01',
        expiryDate: '2025-09-01',
        status: 'ACTIVE',
      },
    ],
    emergencyContact: { name: 'Kiran Reddy', relation: 'Brother', phone: '+91 98123 00000' },
    healthProfile: { heightCm: 165, weightKg: 58 },
    assignedTrainer: { id: 'tr-2', name: 'Ananya Verma' },
    _count: { attendances: 18, invoices: 1 },
  },
  {
    id: 'mem-103',
    tenantId: 'tenant-1',
    branchId: 'br-1',
    memberCode: 'GYM-1003',
    qrCode: 'QR-GYM-1003',
    name: 'Arjun Kumar',
    photoUrl: '',
    mobile: '+91 99000 11223',
    email: 'arjun.k@example.com',
    dob: '1992-11-05',
    gender: 'MALE',
    address: 'HSR Layout, Bengaluru',
    fitnessGoals: 'Cardio & Stamina',
    status: 'FROZEN',
    joinedAt: '2024-11-10',
    branch: { id: 'br-1', name: 'Downtown Branch' },
    memberships: [
      {
        id: 'ms-3',
        plan: { id: 'p-halfyearly', name: 'Half-Yearly Pro', price: 7999 },
        startDate: '2024-11-10',
        expiryDate: '2025-05-10',
        status: 'FROZEN',
      },
    ],
    _count: { attendances: 35, invoices: 1 },
  },
  {
    id: 'mem-104',
    tenantId: 'tenant-1',
    branchId: 'br-2',
    memberCode: 'GYM-1004',
    qrCode: 'QR-GYM-1004',
    name: 'Sneha Rao',
    photoUrl: '',
    mobile: '+91 97777 88899',
    email: 'sneha.rao@example.com',
    dob: '2000-02-14',
    gender: 'FEMALE',
    address: 'Whitefield, Bengaluru',
    fitnessGoals: 'Tone up & Yoga',
    status: 'EXPIRED',
    joinedAt: '2024-08-01',
    branch: { id: 'br-2', name: 'Eastside Hub' },
    memberships: [
      {
        id: 'ms-4',
        plan: { id: 'p-monthly', name: 'Monthly Basic', price: 1999 },
        startDate: '2024-12-01',
        expiryDate: '2025-01-01',
        status: 'EXPIRED',
      },
    ],
    _count: { attendances: 12, invoices: 2 },
  },
];

export const INITIAL_LEADS: MockLead[] = [
  {
    id: 'lead-1',
    tenantId: 'tenant-1',
    branchId: 'br-1',
    name: 'Amit Patel',
    mobile: '+91 98450 12345',
    email: 'amit.p@example.com',
    source: 'WALK_IN',
    status: 'NEW',
    interest: 'Personal Training',
    notes: 'Visited center during evening peak hour. Interested in 6 month package.',
    followUpDate: '2026-08-18',
    assignedTo: { id: 'usr-reception', name: 'Demo Receptionist' },
    branch: { id: 'br-1', name: 'Downtown Branch' },
    createdAt: '2026-08-16',
  },
  {
    id: 'lead-2',
    tenantId: 'tenant-1',
    branchId: 'br-1',
    name: 'Neha Kapoor',
    mobile: '+91 99887 66554',
    email: 'neha.k@example.com',
    source: 'SOCIAL_MEDIA',
    status: 'TRIAL_SCHEDULED',
    interest: 'Zumba & Group Classes',
    notes: 'Booked 3-day trial session starting tomorrow.',
    followUpDate: '2026-08-19',
    assignedTo: { id: 'usr-owner', name: 'Demo Owner' },
    branch: { id: 'br-1', name: 'Downtown Branch' },
    createdAt: '2026-08-15',
  },
  {
    id: 'lead-3',
    tenantId: 'tenant-1',
    branchId: 'br-2',
    name: 'Rohan Mehta',
    mobile: '+91 97111 22334',
    email: 'rohan.m@example.com',
    source: 'WEBSITE',
    status: 'CONTACTED',
    interest: 'Annual Membership',
    notes: 'Sent pricing catalog over WhatsApp.',
    followUpDate: '2026-08-20',
    branch: { id: 'br-2', name: 'Eastside Hub' },
    createdAt: '2026-08-14',
  },
];

export const INITIAL_INVOICES: MockInvoice[] = [
  {
    id: 'inv-1001',
    tenantId: 'tenant-1',
    invoiceNumber: 'INV-2026-001',
    memberId: 'mem-101',
    memberName: 'Rahul Sharma',
    memberCode: 'GYM-1001',
    memberMobile: '+91 98765 43210',
    subtotal: 14999,
    discountTotal: 1000,
    taxTotal: 2519.82,
    grandTotal: 16518.82,
    paidTotal: 16518.82,
    balanceDue: 0,
    status: 'PAID',
    createdAt: '2025-01-15',
    items: [
      { description: 'Premium Annual Membership (12 Months)', quantity: 1, unitPrice: 14999, lineTotal: 13999 },
    ],
    payments: [
      { id: 'pay-1', receiptNumber: 'RCT-2026-001', amount: 16518.82, mode: 'UPI', createdAt: '2025-01-15' },
    ],
  },
  {
    id: 'inv-1002',
    tenantId: 'tenant-1',
    invoiceNumber: 'INV-2026-002',
    memberId: 'mem-102',
    memberName: 'Priya Reddy',
    memberCode: 'GYM-1002',
    memberMobile: '+91 98123 45678',
    subtotal: 4499,
    discountTotal: 0,
    taxTotal: 809.82,
    grandTotal: 5308.82,
    paidTotal: 3000,
    balanceDue: 2308.82,
    status: 'PARTIALLY_PAID',
    createdAt: '2025-06-01',
    items: [
      { description: 'Quarterly Fitness Plan (3 Months)', quantity: 1, unitPrice: 4499, lineTotal: 4499 },
    ],
    payments: [
      { id: 'pay-2', receiptNumber: 'RCT-2026-002', amount: 3000, mode: 'CASH', createdAt: '2025-06-01' },
    ],
  },
  {
    id: 'inv-1003',
    tenantId: 'tenant-1',
    invoiceNumber: 'INV-2026-003',
    memberId: 'mem-104',
    memberName: 'Sneha Rao',
    memberCode: 'GYM-1004',
    memberMobile: '+91 97777 88899',
    subtotal: 1999,
    discountTotal: 0,
    taxTotal: 359.82,
    grandTotal: 2358.82,
    paidTotal: 0,
    balanceDue: 2358.82,
    status: 'ISSUED',
    createdAt: '2025-01-02',
    items: [
      { description: 'Monthly Basic Renewal', quantity: 1, unitPrice: 1999, lineTotal: 1999 },
    ],
    payments: [],
  },
];

export const INITIAL_ATTENDANCES: MockAttendance[] = [
  {
    id: 'att-1',
    memberId: 'mem-101',
    memberName: 'Rahul Sharma',
    memberCode: 'GYM-1001',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    membershipPlan: 'Premium Annual',
    expiryDate: '2026-01-15',
    dues: 0,
    checkInAt: '2026-08-17T07:15:00Z',
    checkOutAt: '2026-08-17T08:30:00Z',
    result: 'SUCCESS',
    method: 'QR',
    branchName: 'Downtown Branch',
  },
  {
    id: 'att-2',
    memberId: 'mem-102',
    memberName: 'Priya Reddy',
    memberCode: 'GYM-1002',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    membershipPlan: 'Quarterly Fitness',
    expiryDate: '2025-09-01',
    dues: 2308.82,
    checkInAt: '2026-08-17T08:00:00Z',
    result: 'WARNED',
    method: 'MANUAL',
    branchName: 'Downtown Branch',
  },
];

export const INITIAL_TENANTS: MockTenant[] = [
  {
    id: 'tenant-demo',
    name: 'PowerHouse Fitness & Gym',
    slug: 'powerhouse',
    ownerName: 'Vikramaditya Rao',
    ownerEmail: 'owner@demogym.com',
    ownerPhone: '+91 98000 77777',
    status: 'ACTIVE',
    planName: 'Enterprise Plan',
    membersCount: 485,
    branchesCount: 3,
    mrr: 185000,
    createdAt: '2024-05-10',
  },
  {
    id: 'tenant-2',
    name: 'Iron Pulse Gym & CrossFit',
    slug: 'ironpulse',
    ownerName: 'Karan Malhotra',
    ownerEmail: 'karan@ironpulse.com',
    ownerPhone: '+91 98111 66666',
    status: 'ACTIVE',
    planName: 'Growth Plan',
    membersCount: 220,
    branchesCount: 1,
    mrr: 75000,
    createdAt: '2024-09-01',
  },
  {
    id: 'tenant-3',
    name: 'Flex Studio Women Gym',
    slug: 'flexstudio',
    ownerName: 'Meera Deshmukh',
    ownerEmail: 'meera@flexstudio.com',
    ownerPhone: '+91 98222 55555',
    status: 'TRIAL',
    planName: 'Starter Plan',
    membersCount: 45,
    branchesCount: 1,
    mrr: 0,
    createdAt: '2026-08-01',
  },
];
