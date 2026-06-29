export interface DashboardSummary {
  totalTickets?: number;
  openTickets?: number;
  resolvedTickets?: number;
  closedTickets?: number;
  pendingTickets?: number;
  assignedTickets?: number;
  [key: string]: unknown;
}
