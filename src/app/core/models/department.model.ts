export interface Department {
  id: string | number;
  name: string;
  code?: string;
  companyId?: string | number | null;
  companyName?: string | null;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
