export interface TicketAttachment {
  id: string | number;
  fileName: string;
}

export interface TicketReply {
  id?: string | number;
  message: string;
  userId: string | number;
  createdAt?: string;
}

export interface Ticket {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  departmentId?: string | number;
  assignedTo?: string | number;
  createdBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
  attachments?: TicketAttachment[];
  replies?: TicketReply[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  departmentId?: string | number;
  priority?: string;
  userId: string | number;
}
