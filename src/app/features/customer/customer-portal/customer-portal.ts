import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Company } from '../../../core/models/company.model';
import { Ticket } from '../../../core/models/ticket.model';
import { CompanyService } from '../../companies/company.service';
import { TicketService } from '../../tickets/ticket.service';

@Component({
  selector: 'app-customer-portal',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './customer-portal.html',
  styleUrl: './customer-portal.scss'
})
export class CustomerPortal implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly ticketService = inject(TicketService);
  private readonly identityKey = 'support_ticket_customer_identity';

  readonly customer = signal(localStorage.getItem(this.identityKey) ?? '');
  readonly companies = signal<Company[]>([]);
  readonly tickets = signal<Ticket[]>([]);
  readonly created = signal(false);

  readonly form = this.formBuilder.nonNullable.group({
    companyId: ['', Validators.required],
    subject: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['MEDIUM', Validators.required]
  });

  ngOnInit(): void {
    this.loadCompanies();

    if (this.customer()) {
      this.loadTickets();
    }
  }

  submit(): void {
    if (this.form.invalid || !this.customer()) {
      return;
    }

    const formValue = this.form.getRawValue();

    this.ticketService.create({
      ...formValue,
      userId: this.customer()
    }).subscribe(() => {
      this.form.reset({ companyId: formValue.companyId, subject: '', description: '', priority: 'MEDIUM' });
      this.created.set(true);
      this.loadTickets();
    });
  }

  logout(): void {
    localStorage.removeItem(this.identityKey);
    this.customer.set('');
    this.tickets.set([]);
  }

  private loadCompanies(): void {
    this.companyService.list().subscribe((companies) => {
      const activeCompanies = companies.filter((company) => company.status !== 'INACTIVE' && company.status !== 'DELETED');

      this.companies.set(activeCompanies);

      if (!this.form.controls.companyId.value && activeCompanies.length > 0) {
        this.form.controls.companyId.setValue(String(activeCompanies[0].id));
      }
    });
  }

  private loadTickets(): void {
    this.ticketService.list().subscribe((tickets) => {
      this.tickets.set(tickets.filter((ticket) => String(ticket.customerId ?? '') === this.customer()));
    });
  }
}
