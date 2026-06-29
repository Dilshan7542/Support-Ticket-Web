export interface Department {
  id: string | number;
  name: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
