export interface TicketCategoryMapping {
  id: string | number;
  companyId: string | number;
  companyName?: string | null;
  categoryId: string | number;
  categoryCode?: string | null;
  categoryName?: string | null;
  departmentId: string | number;
  departmentName?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
