export interface TicketCategory {
  id: string | number;
  companyId?: string | number | null;
  departmentId?: string | number | null;
  name: string;
  code: string;
  description?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
