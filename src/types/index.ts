export type UserRole = 'super_admin' | 'opd' | 'verifikator' | 'kasir' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  department?: string;
}

export interface AuthUser extends User {
  password: string;
}

export interface Billing {
  id: string;
  invoiceNumber: string;
  taxpayerName: string;
  taxpayerId: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'lunas' | 'pending' | 'overdue';
  createdAt: string;
}

export interface Verification {
  id: string;
  documentNumber: string;
  taxpayerName: string;
  type: string;
  amount: number;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  sla: number;
  verifier?: string;
}

export interface Tarif {
  id: string;
  name: string;
  category: string;
  amount: number;
  unit: string;
  status: 'active' | 'inactive';
  department?: string;
}

export interface Zona {
  id: string;
  name: string;
  code: string;
  multiplier: number;
  description: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  user?: string;
}
