export interface DashboardSummary {
  dateFrom?: string;
  dateTo?: string;
  cardMetrics?: {
    totalTickets?: number;
    openTickets?: number;
    resolvedTickets?: number;
    closedTickets?: number;
    criticalTickets?: number;
    highPriorityTickets?: number;
    unassignedTickets?: number;
    todayTickets?: number;
    activeUsers?: number;
    activeDepartments?: number;
    unreadNotifications?: number;
    failedEmails?: number;
    aiPredictions?: number;
    [key: string]: unknown;
  };
  ticketsByStatus?: ChartMetric[];
  ticketsByPriority?: ChartMetric[];
  ticketsByCategory?: ChartMetric[];
  ticketsByDepartment?: ChartMetric[];
  dailyTicketTrend?: DailyTicketTrend[];
  recentTickets?: RecentTicket[];
  recentActivities?: RecentActivity[];
  [key: string]: unknown;
}

export interface ChartMetric {
  label: string;
  value: number;
}

export interface DailyTicketTrend {
  date: string;
  ticketCount: number;
}

export interface RecentTicket {
  ticketId: string | number;
  ticketNo: string;
  subject: string;
  category?: string | null;
  priority?: string;
  status: string;
  departmentId?: string | number | null;
  departmentName?: string | null;
  assignedStaffId?: string | number | null;
  createdAt?: string;
}

export interface RecentActivity {
  id: string | number;
  traceId?: string;
  userId?: string | number | null;
  action: string;
  endpoint?: string;
  responseStatus?: number;
  executionTimeMs?: number;
  createdAt?: string;
}
