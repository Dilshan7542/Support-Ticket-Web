import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Department } from '../../../core/models/department.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { TicketPriority } from '../../../core/models/ticket-priority.model';
import { DepartmentService } from '../../departments/department.service';
import { TicketCategoryService } from '../ticket-category.service';
import { TicketPriorityService } from '../ticket-priority.service';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly departmentService = inject(DepartmentService);
  private readonly categoryService = inject(TicketCategoryService);
  private readonly priorityService = inject(TicketPriorityService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly ticket = signal<Ticket | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly categories = signal<TicketCategory[]>([]);
  readonly priorities = signal<TicketPriority[]>([]);
  readonly error = signal<string | null>(null);
  readonly replyError = signal<string | null>(null);
  readonly statusForm = this.formBuilder.nonNullable.group({
    status: ['NEW', Validators.required],
    departmentId: [''],
    categoryCode: [''],
    priority: [''],
    assignedTo: ['']
  });
  readonly replyForm = this.formBuilder.nonNullable.group({
    message: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadPriorities();
    this.loadTicket();
  }

  updateStatus(): void {
    const ticket = this.ticket();

    if (!ticket || this.statusForm.invalid) {
      return;
    }

    const { status, assignedTo, departmentId, categoryCode, priority } = this.statusForm.getRawValue();
    const assignedStaffId = assignedTo.trim();
    const hasAssignmentChanged = this.hasAssignmentChanged(ticket, departmentId, assignedStaffId, categoryCode, priority);

    if (hasAssignmentChanged && !departmentId) {
      this.error.set('Department is required when assigning a ticket.');
      return;
    }

    this.error.set(null);
    this.ticketService.updateStatus(ticket.id, status).subscribe(() => {
      if (hasAssignmentChanged) {
        this.ticketService.assign(ticket.id, assignedStaffId || null, departmentId, categoryCode || null, priority || null).subscribe({
          next: () => this.loadTicket(),
          error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to assign ticket'))
        });
        return;
      }

      this.loadTicket();
    }, (error) => this.error.set(getApiErrorMessage(error, 'Unable to update ticket')));
  }

  addReply(): void {
    const ticket = this.ticket();

    if (!ticket || this.replyForm.invalid) {
      return;
    }

    this.replyError.set(null);
    this.ticketService.addReply(ticket.id, this.replyForm.controls.message.value).subscribe({
      next: () => {
        this.replyForm.reset({ message: '' });
        this.loadTicket();
      },
      error: (error) => this.replyError.set(getApiErrorMessage(error, 'Unable to send reply'))
    });
  }

  isOwnReply(userId: string | number): boolean {
    return String(userId) === String(this.tokenStorage.getUserId() ?? '');
  }

  private loadTicket(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.ticketService.detail({ id }).subscribe((ticket) => {
        this.ticket.set(ticket);
        this.statusForm.reset({
          status: ticket?.status ?? 'NEW',
          departmentId: ticket?.departmentId ? String(ticket.departmentId) : '',
          categoryCode: ticket?.categoryCode ?? '',
          priority: ticket?.priority ?? '',
          assignedTo: ticket?.assignedStaffId ? String(ticket.assignedStaffId) : ''
        });
        this.loadDepartments(ticket);
      });
    }
  }

  private loadDepartments(ticket: Ticket): void {
    if (!ticket.vendorId) {
      this.departments.set([]);
      return;
    }

    this.departmentService.list({ vendorId: ticket.vendorId }).subscribe({
      next: (departments) => {
        this.departments.set(departments.filter((department) => department.status !== 'INACTIVE' && department.status !== 'DELETED'));
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load departments'))
    });
  }

  private loadCategories(): void {
    this.categoryService.list({ page: 0, size: 100 }).subscribe({
      next: (categories) => this.categories.set(categories.filter((category) => category.status !== 'INACTIVE' && category.status !== 'DELETED')),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load categories'))
    });
  }

  private loadPriorities(): void {
    this.priorityService.list({ page: 0, size: 100 }).subscribe({
      next: (priorities) => this.priorities.set(priorities.filter((priority) => priority.status !== 'INACTIVE' && priority.status !== 'DELETED')),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load priorities'))
    });
  }

  private hasAssignmentChanged(ticket: Ticket, departmentId: string, assignedStaffId: string, categoryCode: string, priority: string): boolean {
    const currentDepartmentId = ticket.departmentId ? String(ticket.departmentId) : '';
    const currentAssignedStaffId = ticket.assignedStaffId ? String(ticket.assignedStaffId) : '';
    const currentCategoryCode = ticket.categoryCode ?? '';
    const currentPriority = ticket.priority ?? '';

    return departmentId !== currentDepartmentId
      || assignedStaffId !== currentAssignedStaffId
      || categoryCode !== currentCategoryCode
      || priority !== currentPriority;
  }
}
