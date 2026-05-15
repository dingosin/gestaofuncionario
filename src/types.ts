export interface Employee {
  id?: string;
  name: string;
  role: string;
  rg: string;
  birthDate: string; // DD/MM/AAAA
  cpf: string; // XXX.XXX.XXX-XX
  address: string;
  number: string;
  phone: string; // (XX) XXXXX-XXXX
  createdAt?: any;
  updatedAt?: any;
}

export type RecordType = 'abonada' | 'ferias' | 'folga' | 'atestado' | 'ponto';

export interface EmployeeRecord {
  id?: string;
  employeeId: string;
  employeeName?: string;
  type: RecordType;
  date: string; // DD/MM/AAAA
  endDate?: string; // Optional for vacations
  daysCount?: string; // Number of days
  acquisitionPeriod?: string; // e.g. 2023/2024
  reason?: string; // For Abonada/Folga
  attachmentBase64?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  createdAt?: any;
}
