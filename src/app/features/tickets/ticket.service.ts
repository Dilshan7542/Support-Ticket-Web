import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';
import {
  AddTicketReplyRequest,
  AssignTicketRequest,
  CreateTicketRequest,
  Ticket,
  TicketAttachment,
  TicketReply,
  UpdateTicketStatusRequest
} from '../../core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);

  create(request: CreateTicketRequest): Observable<Ticket> {
    return this.api.post<Ticket, CreateTicketRequest>(API_ENDPOINTS.tickets.create, request);
  }

  list(request: ListRequest = {}): Observable<Ticket[]> {
    return this.api.post<Ticket[], ListRequest>(API_ENDPOINTS.tickets.list, {
      userId: this.tokenStorage.getUserId(),
      ...request
    });
  }

  detail(request: DetailRequest): Observable<Ticket> {
    return this.api.post<Ticket>(API_ENDPOINTS.tickets.detail, {
      userId: this.tokenStorage.getUserId(),
      ticketId: request.id
    });
  }

  updateStatus(ticketId: string | number, status: string, remark = ''): Observable<Ticket> {
    const request: UpdateTicketStatusRequest = {
      userId: this.tokenStorage.getUserId() ?? '',
      ticketId,
      status,
      remark
    };

    return this.api.post<Ticket, UpdateTicketStatusRequest>(API_ENDPOINTS.tickets.updateStatus, request);
  }

  addReply(ticketId: string | number, message: string): Observable<number> {
    const request: AddTicketReplyRequest = {
      userId: this.tokenStorage.getUserId() ?? '',
      ticketId,
      message
    };

    return this.api.post<number, AddTicketReplyRequest>(API_ENDPOINTS.tickets.addReply, request);
  }

  assign(ticketId: string | number, assignedStaffId: string | number | null, departmentId?: string | number): Observable<Ticket> {
    const request: AssignTicketRequest = {
      userId: this.tokenStorage.getUserId() ?? '',
      ticketId,
      departmentId,
      assignedStaffId
    };

    return this.api.post<Ticket, AssignTicketRequest>(API_ENDPOINTS.tickets.assign, request);
  }

  uploadAttachment(file: File, ticketId?: string | number): Observable<TicketAttachment> {
    const formData = new FormData();
    formData.append('userId', this.tokenStorage.getUserId() ?? '');
    formData.append('attachment', file);

    if (ticketId !== undefined && ticketId !== null) {
      formData.append('ticketId', String(ticketId));
    }

    return this.api.upload<TicketAttachment>(API_ENDPOINTS.tickets.uploadAttachment, formData);
  }

  downloadAttachment(attachmentId: string | number): Observable<Blob> {
    return this.api.download(API_ENDPOINTS.tickets.downloadAttachment, { id: attachmentId });
  }

  downloadAttachmentResponse(attachmentId: string | number): Observable<HttpResponse<Blob>> {
    return this.api.downloadResponse(API_ENDPOINTS.tickets.downloadAttachment, { id: attachmentId });
  }
}
