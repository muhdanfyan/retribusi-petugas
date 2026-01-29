export type UserRole = 'super_admin' | 'opd' | 'verifikator' | 'kasir' | 'viewer';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  department?: string;
  opd_id?: number;
}

export interface AuthUser extends User {
  password: string;
}

export interface Opd {
  id: number;
  name: string;
  code: string;
}

export interface RetributionType {
  id: number;
  opd_id: number;
  name: string;
  base_amount: number;
  unit: string;
  is_active: boolean;
  icon?: string;
  opd?: Opd;
}

export interface Taxpayer {
  id: number;
  opd_id: number;
  nik: string;
  name: string;
  address: string | null;
  phone: string | null;
  npwpd: string | null;
  object_name: string | null;
  object_address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  opd?: Opd;
  retribution_types?: RetributionType[];
}

export interface Billing {
  id: string | number;
  invoiceNumber: string;
  taxpayerName: string;
  taxpayerId: string | number;
  type: string;
  amount: number;
  dueDate: string;
  status: 'lunas' | 'pending' | 'overdue';
  createdAt: string;
}

export interface Verification {
  id: string | number;
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
  id: string | number;
  name: string;
  category: string;
  amount: number;
  unit: string;
  status: 'active' | 'inactive';
  department?: string;
  opd_id?: number;
  icon?: string;
}

export interface Zona {
  id: string | number;
  name: string;
  code: string;
  multiplier: number;
  description: string;
  latitude?: number;
  longitude?: number;
}

export interface SystemLog {
  id: string | number;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  user?: string;
}
