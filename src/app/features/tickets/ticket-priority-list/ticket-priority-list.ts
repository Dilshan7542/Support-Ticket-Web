import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageResponse, getApiErrorMessage } from '../../../core/models/api-response.model';
import { TicketPriority } from '../../../core/models/ticket-priority.model';
import { TicketPriorityService } from '../ticket-priority.service';

@Component({
  selector: 'app-ticket-priority-list',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-priority-list.html',
  styleUrl: './ticket-priority-list.scss'
})
export class TicketPriorityList implements OnInit {
  private readonly priorityService = inject(TicketPriorityService);
  private readonly formBuilder = inject(FormBuilder);

  readonly priorities = signal<TicketPriority[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly editingId = signal<string | number | null>(null);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly pageSize = 20;

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: ['']
  });

  readonly editForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: [''],
    status: ['ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.loadPage(1);
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.priorityService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', code: '', description: '' });
        this.message.set('Ticket priority created.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create ticket priority'))
    });
  }

  edit(priority: TicketPriority): void {
    this.editingId.set(priority.id);
    this.editForm.reset({
      name: priority.name,
      code: priority.code,
      description: priority.description ?? '',
      status: priority.status ?? 'ACTIVE'
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  update(priority: TicketPriority): void {
    if (this.editForm.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.priorityService.update({
      id: priority.id,
      ...this.editForm.getRawValue()
    }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.message.set('Ticket priority updated.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to update ticket priority'))
    });
  }

  delete(priority: TicketPriority): void {
    if (!confirm('Delete this ticket priority?')) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.priorityService.softDelete(priority.id).subscribe({
      next: () => {
        this.message.set('Ticket priority deleted.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to delete ticket priority'))
    });
  }

  nextPage(): void {
    this.loadPage(Math.min(this.totalPages(), this.currentPage() + 1));
  }

  previousPage(): void {
    this.loadPage(Math.max(1, this.currentPage() - 1));
  }

  private loadPage(page: number): void {
    this.loading.set(true);
    this.currentPage.set(page);

    this.priorityService.listPage({ page: page - 1, size: this.pageSize }).subscribe({
      next: (response: PageResponse<TicketPriority>) => {
        this.priorities.set(response.content);
        this.totalPages.set(Math.max(1, response.totalPages));
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(getApiErrorMessage(error, 'Unable to load ticket priorities'));
        this.loading.set(false);
      }
    });
  }
}
