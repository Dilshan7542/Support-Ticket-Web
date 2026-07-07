import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketCategoryService } from '../ticket-category.service';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreate implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketCategoryService = inject(TicketCategoryService);
  private readonly ticketService = inject(TicketService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly loading = this.formBuilder.nonNullable.control(false);
  readonly categoriesLoading = this.formBuilder.nonNullable.control(false);
  categories: TicketCategory[] = [];
  createdTicket?: Ticket;
  error: string | null = null;
  categoriesError: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    callerName: [''],
    callerContact: [''],
    companyName: [''],
    subject: ['', Validators.required],
    categoryCode: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesLoading.setValue(true);
    this.categoriesError = null;

    this.ticketCategoryService.list({ page: 0, size: 100 }).subscribe({
      next: (categories) => {
        this.categories = categories.filter((category) => category.status !== 'INACTIVE' && category.status !== 'DELETED');

        if (!this.form.controls.categoryCode.value && this.categories.length > 0) {
          this.form.controls.categoryCode.setValue(this.categories[0].code);
        }

        this.categoriesLoading.setValue(false);
      },
      error: (error) => {
        this.categoriesError = getApiErrorMessage(error, 'Unable to load ticket categories');
        this.categoriesLoading.setValue(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading.value) {
      return;
    }

    const formValue = this.form.getRawValue();
    this.error = null;
    this.createdTicket = undefined;
    this.loading.setValue(true);

    this.ticketService.create({
      userId: this.tokenStorage.getUserId() ?? '',
      subject: formValue.subject,
      categoryCode: formValue.categoryCode,
      description: this.buildDescription(formValue)
    }).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.form.reset({
          callerName: '',
          callerContact: '',
          companyName: '',
          subject: '',
          categoryCode: this.categories[0]?.code ?? '',
          description: ''
        });
        this.loading.setValue(false);
      },
      error: (error) => {
        this.error = getApiErrorMessage(error, 'Unable to create ticket');
        this.loading.setValue(false);
      }
    });
  }

  private buildDescription(formValue: {
    callerName: string;
    callerContact: string;
    companyName: string;
    description: string;
  }): string {
    const callerDetails = [
      formValue.callerName ? `Caller name: ${formValue.callerName}` : '',
      formValue.callerContact ? `Caller contact: ${formValue.callerContact}` : '',
      formValue.companyName ? `Company: ${formValue.companyName}` : ''
    ].filter(Boolean);

    return callerDetails.length
      ? `${callerDetails.join('\n')}\n\nComplaint:\n${formValue.description}`
      : formValue.description;
  }
}
