export type UserRole = 'super_admin' | 'opd' | 'verifikator' | 'petugas' | 'viewer';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  department?: string;
  opd_id?: number;
  opd?: Opd;
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
  opd?: Opd;
}

export interface RetributionClassification {
  id: number;
  opd_id: number;
  retribution_type_id: number;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  form_schema?: any[];
  requirements?: any[];
  opd?: Opd;
  retribution_type?: RetributionType;
  zones?: Zona[];
  rates?: RetributionRate[];
}

export interface RetributionRate {
  id: number;
  opd_id: number;
  retribution_type_id: number;
  retribution_classification_id?: number;
  zone_id?: number;
  name?: string;
  amount: number;
  unit?: string;
  is_active: boolean;
  opd?: Opd;
  retribution_type?: RetributionType;
  classification?: RetributionClassification;
  zone?: Zona;
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
  metadata?: any;
  created_at: string;
  updated_at: string;
  opd?: Opd;
  retribution_types?: RetributionType[];
  tax_objects?: TaxObject[];
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
  tax_object_id?: number | string;
  tax_object?: TaxObject;
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
  taxpayer_id?: number | string;
  tax_object_id?: number | string;
  tax_object?: TaxObject;
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
  form_schema?: any[];
  requirements?: any[];
}

export interface Zona {
  id: string | number;
  opd_id: number;
  retribution_type_id: number;
  name: string;
  code: string;
  multiplier: number;
  amount: number;
  description: string;
  latitude?: number;
  longitude?: number;
  opd?: Opd;
  retribution_type?: RetributionType;
  retribution_classification_id?: number;
  classification?: RetributionClassification;
  rates?: RetributionRate[];
}

export interface TaxObject {
  id: number | string;
  taxpayer_id: number | string;
  retribution_type_id: number | string;
  opd_id: number | string;
  zone_id?: number | string;
  name: string;
  address: string | null;
  latitude?: number;
  longitude?: number;
  metadata?: any;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  approved_at?: string;
}

export interface SystemLog {
  id: string | number;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  user?: string;
}
