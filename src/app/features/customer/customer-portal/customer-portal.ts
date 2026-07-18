import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../tickets/ticket.service';

@Component({
  selector: 'app-customer-portal',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './customer-portal.html',
  styleUrl: './customer-portal.scss'
})
export class CustomerPortal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);

  readonly customer = signal(this.tokenStorage.getUserId() ?? '');
  readonly customerName = signal(this.getCustomerName());
  readonly tickets = signal<Ticket[]>([]);
  readonly selectedTicket = signal<Ticket | null>(null);
  readonly selectedTicketLoading = signal(false);
  readonly selectedTicketError = signal<string | null>(null);
  readonly created = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly attachment = signal<File | null>(null);
  readonly replyDrafts = signal<Record<string, string>>({});
  readonly replySubmitting = signal<Record<string, boolean>>({});
  readonly replyErrors = signal<Record<string, string>>({});

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    message: ['', Validators.required]
  });

  ngOnInit(): void {
    if (!this.customer()) {
      this.router.navigateByUrl('/customer/login');
      return;
    }

    this.loadTickets();
  }

  submit(): void {
    if (this.form.invalid || !this.customer() || this.submitting()) {
      return;
    }

    const formValue = this.form.getRawValue();
    const attachment = this.attachment();

    this.submitting.set(true);
    this.submitError.set(null);
    this.ticketService.create({
      userId: this.customer(),
      title: formValue.title,
      message: formValue.message,
      attachmentIds: []
    }).subscribe({
      next: (ticket) => {
        if (attachment) {
          this.ticketService.uploadAttachment(attachment, ticket.id).subscribe({
            next: () => this.finishSubmit(),
            error: (error) => {
              this.submitError.set(getApiErrorMessage(error, 'Ticket created, but attachment upload failed'));
              this.finishSubmit();
            }
          });
          return;
        }

        this.finishSubmit();
      },
      error: (error) => {
        this.submitError.set(getApiErrorMessage(error, 'Unable to submit complaint'));
        this.submitting.set(false);
      }
    });
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.attachment.set(input.files?.[0] ?? null);
  }

  openTicket(ticket: Ticket): void {
    this.selectedTicket.set(ticket);
    this.selectedTicketLoading.set(true);
    this.selectedTicketError.set(null);

    this.ticketService.detail({ id: ticket.id }).subscribe({
      next: (detail) => {
        this.selectedTicket.set(detail);
        this.selectedTicketLoading.set(false);
      },
      error: (error) => {
        this.selectedTicketError.set(getApiErrorMessage(error, 'Unable to load complaint details'));
        this.selectedTicketLoading.set(false);
      }
    });
  }

  closeTicket(): void {
    this.selectedTicket.set(null);
    this.selectedTicketError.set(null);
  }

  updateReplyDraft(ticketId: string | number, event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    const key = String(ticketId);

    this.replyDrafts.update((drafts) => ({
      ...drafts,
      [key]: input.value
    }));
  }

  addReply(ticket: Ticket): void {
    const key = String(ticket.id);
    const message = this.replyDrafts()[key]?.trim() ?? '';

    if (!message || this.replySubmitting()[key]) {
      return;
    }

    this.replySubmitting.update((state) => ({ ...state, [key]: true }));
    this.replyErrors.update((errors) => {
      const { [key]: _removed, ...rest } = errors;
      return rest;
    });

    this.ticketService.addReply(ticket.id, message).subscribe({
      next: () => {
        this.replyDrafts.update((drafts) => ({ ...drafts, [key]: '' }));
        this.replySubmitting.update((state) => ({ ...state, [key]: false }));
        this.openTicket(ticket);
        this.loadTickets();
      },
      error: (error) => {
        this.replyErrors.update((errors) => ({
          ...errors,
          [key]: getApiErrorMessage(error, 'Unable to send reply')
        }));
        this.replySubmitting.update((state) => ({ ...state, [key]: false }));
      }
    });
  }

  isOwnReply(userId: string | number): boolean {
    return String(userId) === this.customer();
  }

  logout(): void {
    this.tokenStorage.clear();
    this.customer.set('');
    this.customerName.set('');
    this.tickets.set([]);
    this.selectedTicket.set(null);
    this.created.set(false);
    this.attachment.set(null);
    this.replyDrafts.set({});
    this.replySubmitting.set({});
    this.replyErrors.set({});
    this.router.navigateByUrl('/customer/login');
  }

  private loadTickets(): void {
    this.ticketService.list().subscribe((tickets) => {
      this.tickets.set(tickets.filter((ticket) => String(ticket.customerId ?? '') === this.customer()));
    });
  }

  private finishSubmit(): void {
    this.form.reset({
      title: '',
      message: ''
    });
    this.attachment.set(null);
    this.created.set(true);
    this.submitting.set(false);
    this.loadTickets();
  }

  private getCustomerName(): string {
    return this.tokenStorage.getFullName() ?? this.tokenStorage.getUsername() ?? 'Customer';
  }
}
