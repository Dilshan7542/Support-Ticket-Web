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

export interface TicketTrackingItem {
  id: string | number;
  previousStatus?: string | null;
  newStatus: string;
  changedByUserId?: string | number | null;
  remark?: string | null;
  createdAt?: string;
}

export interface Ticket {
  id: string | number;
  ticketNo?: string;
  title?: string;
  subject: string;
  message?: string;
  description?: string;
  category?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  status: string;
  priority?: string;
  customerId?: string | number;
  companyId?: string | number | null;
  companyName?: string | null;
  categoryId?: string | number | null;
  departmentId?: string | number | null;
  departmentName?: string | null;
  assignedStaffId?: string | number | null;
  createdAt?: string;
  updatedAt?: string;
  attachments?: TicketAttachment[];
  replies?: TicketReply[];
  tracking?: TicketTrackingItem[];
}

export interface CreateTicketRequest {
  userId: string | number;
  title?: string;
  message?: string;
  subject?: string;
  description?: string;
  companyId?: string | number;
  categoryCode?: string | null;
  priority?: string | null;
  priorityCode?: string | null;
  attachmentIds?: Array<string | number>;
  aiPredictionEnabled?: boolean;
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
  departmentId: string | number;
  assignedStaffId?: string | number | null;
}

export interface AddTicketReplyRequest {
  userId: string | number;
  ticketId: string | number;
  message: string;
}
