import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageResponse, getApiErrorMessage } from '../../../core/models/api-response.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { TicketCategoryService } from '../ticket-category.service';

@Component({
  selector: 'app-ticket-category-list',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-category-list.html',
  styleUrl: './ticket-category-list.scss'
})
export class TicketCategoryList implements OnInit {
  private readonly categoryService = inject(TicketCategoryService);
  private readonly formBuilder = inject(FormBuilder);

  readonly categories = signal<TicketCategory[]>([]);
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

    this.categoryService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.form.reset({ name: '', code: '', description: '' });
        this.message.set('Ticket category created.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to create ticket category'))
    });
  }

  edit(category: TicketCategory): void {
    this.editingId.set(category.id);
    this.editForm.reset({
      name: category.name,
      code: category.code,
      description: category.description ?? '',
      status: category.status ?? 'ACTIVE'
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  update(category: TicketCategory): void {
    if (this.editForm.invalid) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.categoryService.update({
      id: category.id,
      ...this.editForm.getRawValue()
    }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.message.set('Ticket category updated.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to update ticket category'))
    });
  }

  delete(category: TicketCategory): void {
    if (!confirm('Delete this ticket category?')) {
      return;
    }

    this.error.set(null);
    this.message.set(null);

    this.categoryService.softDelete(category.id).subscribe({
      next: () => {
        this.message.set('Ticket category deleted.');
        this.loadPage(this.currentPage());
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to delete ticket category'))
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

    this.categoryService.listPage({ page: page - 1, size: this.pageSize }).subscribe({
      next: (response: PageResponse<TicketCategory>) => {
        this.categories.set(response.content);
        this.totalPages.set(Math.max(1, response.totalPages));
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(getApiErrorMessage(error, 'Unable to load ticket categories'));
        this.loading.set(false);
      }
    });
  }
}
