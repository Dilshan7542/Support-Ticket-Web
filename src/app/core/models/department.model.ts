export interface Department {
  id: string | number;
  name: string;
  code?: string;
  vendorId?: string | number | null;
  vendorName?: string | null;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
