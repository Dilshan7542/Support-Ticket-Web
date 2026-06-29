export interface TicketAttachment {
  id: string | number;
  fileName: string;
  ticketId?: string | number;
  uploadedByUserId?: string | number;
  originalFileName?: string;
  storedFileName?: string;
  contentType?: string;
  fileSize?: number;
  storagePath?: string;
  createdAt?: string;
}

export interface TicketReply {
  id?: string | number;
  message: string;
  userId: string | number;
  createdAt?: string;
}

export interface Ticket {
  id: string | number;
  ticketNo?: string;
  subject: string;
  description?: string;
  category?: string | null;
  status: string;
  priority?: string;
  customerId?: string | number;
  departmentId?: string | number | null;
  assignedStaffId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  attachments?: TicketAttachment[];
  replies?: TicketReply[];
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category?: string;
  departmentId?: string | number;
  priority?: string;
  userId: string | number;
}

export interface UpdateTicketStatusRequest {
  userId: string | number;
  ticketId: string | number;
  status: string;
  remark?: string;
}

export interface AssignTicketRequest {
  userId: string | number;
  ticketId: string | number;
  departmentId?: string | number;
  assignedStaffId?: string | number | null;
}

export interface AddTicketReplyRequest {
  userId: string | number;
  ticketId: string | number;
  message: string;
}
