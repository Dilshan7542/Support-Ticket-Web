export interface TicketPriority {
  id: string | number;
  name: string;
  code: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string;
}
