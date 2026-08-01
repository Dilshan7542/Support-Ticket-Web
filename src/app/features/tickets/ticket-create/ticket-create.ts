import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Company } from '../../../core/models/company.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { TicketPriority } from '../../../core/models/ticket-priority.model';
import { CompanyService } from '../../companies/company.service';
import { TicketCategoryService } from '../ticket-category.service';
import { TicketPriorityService } from '../ticket-priority.service';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreate implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly companyService = inject(CompanyService);
  private readonly categoryService = inject(TicketCategoryService);
  private readonly priorityService = inject(TicketPriorityService);
  private readonly tokenStorage = inject(TokenStorageService);

  loading = false;
  companiesLoading = false;
  categoriesLoading = false;
  prioritiesLoading = false;
  createdTicket?: Ticket;
  error: string | null = null;
  companyError: string | null = null;
  categoryError: string | null = null;
  priorityError: string | null = null;
  companies: Company[] = [];
  categories: TicketCategory[] = [];
  priorities: TicketPriority[] = [];

  readonly form = this.formBuilder.nonNullable.group({
    companyId: ['', Validators.required],
    categoryCode: [''],
    priorityCode: [''],
    callerName: [''],
    callerContact: [''],
    title: ['', Validators.required],
    message: ['', Validators.required],
    aiPredictionEnabled: [true]
  });

  ngOnInit(): void {
    this.loadCompanies();
    this.loadCategories();
    this.loadPriorities();
  }

  get optionsLoading(): boolean {
    return this.companiesLoading || this.categoriesLoading || this.prioritiesLoading;
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      return;
    }

    const formValue = this.form.getRawValue();
    this.error = null;
    this.createdTicket = undefined;
    this.loading = true;

    this.ticketService.create({
      userId: this.tokenStorage.getUserId() ?? '',
      companyId: this.toNumber(formValue.companyId) ?? formValue.companyId,
      subject: formValue.title,
      description: this.buildDescription(formValue.message, formValue.callerName, formValue.callerContact),
      title: formValue.title,
      message: this.buildDescription(formValue.message, formValue.callerName, formValue.callerContact),
      categoryCode: formValue.categoryCode || null,
      priority: formValue.priorityCode || null,
      priorityCode: formValue.priorityCode || null,
      aiPredictionEnabled: formValue.aiPredictionEnabled || !formValue.categoryCode
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.form.reset({
          companyId: this.companies[0]?.id ? String(this.companies[0].id) : '',
          categoryCode: '',
          priorityCode: '',
          callerName: '',
          callerContact: '',
          title: '',
          message: '',
          aiPredictionEnabled: true
        });
      },
      error: (error) => {
        this.error = getApiErrorMessage(error, 'Unable to create ticket');
      }
    });
  }

  private loadCompanies(): void {
    this.companiesLoading = true;
    this.companyError = null;

    this.companyService.list({ page: 0, size: 100 }).pipe(
      finalize(() => {
        this.companiesLoading = false;
      })
    ).subscribe({
      next: (companies) => {
        this.companies = this.onlyActive(companies);

        if (!this.form.controls.companyId.value && this.companies.length > 0) {
          this.form.controls.companyId.setValue(String(this.companies[0].id));
        }
      },
      error: (error) => {
        this.companyError = getApiErrorMessage(error, 'Unable to load companies');
        this.companies = [];
      }
    });
  }

  private loadCategories(): void {
    this.categoriesLoading = true;
    this.categoryError = null;

    this.categoryService.list({ page: 0, size: 100 }).pipe(
      finalize(() => {
        this.categoriesLoading = false;
      })
    ).subscribe({
      next: (categories) => {
        this.categories = this.onlyActive(categories);
      },
      error: (error) => {
        this.categoryError = getApiErrorMessage(error, 'Unable to load categories');
        this.categories = [];
      }
    });
  }

  private loadPriorities(): void {
    this.prioritiesLoading = true;
    this.priorityError = null;

    this.priorityService.list({ page: 0, size: 100 }).pipe(
      finalize(() => {
        this.prioritiesLoading = false;
      })
    ).subscribe({
      next: (priorities) => {
        this.priorities = this.onlyActive(priorities);
      },
      error: (error) => {
        this.priorityError = getApiErrorMessage(error, 'Unable to load priorities');
        this.priorities = [];
      }
    });
  }

  private onlyActive<T extends { status?: string }>(items: T[]): T[] {
    return items.filter((item) => (item.status ?? 'ACTIVE') === 'ACTIVE');
  }

  private buildDescription(message: string, callerName: string, callerContact: string): string {
    const intakeDetails = [
      callerName.trim() ? `Caller name: ${callerName.trim()}` : '',
      callerContact.trim() ? `Caller contact: ${callerContact.trim()}` : ''
    ].filter(Boolean);

    if (intakeDetails.length === 0) {
      return message;
    }

    return `${message}\n\nCustomer-care intake:\n${intakeDetails.join('\n')}`;
  }

  private toNumber(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return Number(value);
  }
}
