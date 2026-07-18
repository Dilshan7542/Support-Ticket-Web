import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { Company } from '../../../core/models/company.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
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
  private readonly authService = inject(AuthService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly companyService = inject(CompanyService);
  private readonly ticketService = inject(TicketService);

  readonly customer = signal(this.tokenStorage.getUserId() ?? '');
  readonly companies = signal<Company[]>([]);
  readonly tickets = signal<Ticket[]>([]);
  readonly created = signal(false);
  readonly loginLoading = signal(false);
  readonly loginError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly attachment = signal<File | null>(null);

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  readonly form = this.formBuilder.nonNullable.group({
    companyId: ['', Validators.required],
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCompanies();

    if (this.customer()) {
      this.loadTickets();
    }
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
      ...formValue,
      userId: this.customer()
    }).subscribe({
      next: (ticket) => {
        if (attachment) {
          this.ticketService.uploadAttachment(attachment, ticket.id).subscribe({
            next: () => this.finishSubmit(formValue.companyId),
            error: (error) => {
              this.submitError.set(getApiErrorMessage(error, 'Ticket created, but attachment upload failed'));
              this.finishSubmit(formValue.companyId);
            }
          });
          return;
        }

        this.finishSubmit(formValue.companyId);
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

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const credentials = this.loginForm.getRawValue();
    const username = credentials.username.trim();

    if (!username || !credentials.password) {
      return;
    }

    this.loginLoading.set(true);
    this.loginError.set(null);

    this.authService.login({
      username,
      password: credentials.password
    }).pipe(
      finalize(() => this.loginLoading.set(false))
    ).subscribe({
      next: () => {
        this.customer.set(this.tokenStorage.getUserId() ?? '');
        this.loginForm.reset({ username: '', password: '' });
        this.created.set(false);
        this.loadCompanies();
        this.loadTickets();
      },
      error: (error) => this.loginError.set(getApiErrorMessage(error, 'Invalid customer username or password'))
    });
  }

  logout(): void {
    this.tokenStorage.clear();
    this.customer.set('');
    this.tickets.set([]);
    this.created.set(false);
    this.attachment.set(null);
    this.loginForm.reset({ username: '', password: '' });
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

  private finishSubmit(companyId: string): void {
    this.form.reset({
      companyId,
      subject: '',
      description: ''
    });
    this.attachment.set(null);
    this.created.set(true);
    this.submitting.set(false);
    this.loadTickets();
  }
}
