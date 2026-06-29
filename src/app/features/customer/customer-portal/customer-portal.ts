import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../tickets/ticket.service';

@Component({
  selector: 'app-customer-portal',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-portal.html',
  styleUrl: './customer-portal.scss'
})
export class CustomerPortal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly identityKey = 'support_ticket_customer_identity';

  readonly customer = signal(localStorage.getItem(this.identityKey) ?? '');
  readonly tickets = signal<Ticket[]>([]);
  readonly created = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    subject: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['MEDIUM', Validators.required]
  });

  ngOnInit(): void {
    if (this.customer()) {
      this.loadTickets();
    }
  }

  submit(): void {
    if (this.form.invalid || !this.customer()) {
      return;
    }

    this.ticketService.create({
      ...this.form.getRawValue(),
      userId: this.customer()
    }).subscribe(() => {
      this.form.reset({ subject: '', description: '', priority: 'MEDIUM' });
      this.created.set(true);
      this.loadTickets();
    });
  }

  logout(): void {
    localStorage.removeItem(this.identityKey);
    this.customer.set('');
    this.tickets.set([]);
  }

  private loadTickets(): void {
    this.ticketService.list().subscribe((tickets) => {
      this.tickets.set(tickets.filter((ticket) => String(ticket.customerId ?? '') === this.customer()));
    });
  }
}
