import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';
import { ApiClientService } from '../../core/http/api-client.service';
import { DetailRequest, ListRequest } from '../../core/models/api-response.model';
import { CreateTicketRequest, Ticket, TicketAttachment, TicketReply } from '../../core/models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly api = inject(ApiClientService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly storageKey = 'support_ticket_demo_tickets';

  create(request: CreateTicketRequest): Observable<Ticket> {
    const tickets = this.readTickets();
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      title: request.title,
      description: request.description,
      priority: request.priority ?? 'MEDIUM',
      departmentId: request.departmentId,
      createdBy: request.userId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };

    this.writeTickets([ticket, ...tickets]);
    return of(ticket);
  }

  list(request: ListRequest = {}): Observable<Ticket[]> {
    return of(this.readTickets());
  }

  detail(request: DetailRequest): Observable<Ticket> {
    const ticket = this.readTickets().find((item) => String(item.id) === String(request.id));
    return of(ticket as Ticket);
  }

  updateStatus(ticketId: string | number, status: string): Observable<Ticket> {
    return of(this.updateTicket(ticketId, { status }));
  }

  addReply(ticketId: string | number, message: string): Observable<TicketReply> {
    const reply: TicketReply = {
      id: crypto.randomUUID(),
      message,
      userId: this.tokenStorage.getUserId() ?? 'admin',
      createdAt: new Date().toISOString()
    };
    const ticket = this.readTickets().find((item) => String(item.id) === String(ticketId));
    this.updateTicket(ticketId, { replies: [...(ticket?.replies ?? []), reply] });
    return of(reply);
  }

  assign(ticketId: string | number, assigneeId: string | number): Observable<Ticket> {
    return of(this.updateTicket(ticketId, { assignedTo: assigneeId }));
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

  private readTickets(): Ticket[] {
    const rawTickets = localStorage.getItem(this.storageKey);
    return rawTickets ? JSON.parse(rawTickets) as Ticket[] : [];
  }

  private writeTickets(tickets: Ticket[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tickets));
  }

  private updateTicket(ticketId: string | number, changes: Partial<Ticket>): Ticket {
    const tickets = this.readTickets();
    const updatedTickets = tickets.map((ticket) => {
      if (String(ticket.id) !== String(ticketId)) {
        return ticket;
      }

      return {
        ...ticket,
        ...changes,
        updatedAt: new Date().toISOString()
      };
    });

    this.writeTickets(updatedTickets);
    return updatedTickets.find((ticket) => String(ticket.id) === String(ticketId)) as Ticket;
  }
}
