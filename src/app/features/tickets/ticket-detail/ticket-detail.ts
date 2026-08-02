import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Department } from '../../../core/models/department.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { TicketPriority } from '../../../core/models/ticket-priority.model';
import { User } from '../../../core/models/user.model';
import { DepartmentService } from '../../departments/department.service';
import { TicketCategoryMappingService } from '../ticket-category-mapping.service';
import { TicketCategoryService } from '../ticket-category.service';
import { TicketPriorityService } from '../ticket-priority.service';
import { TicketService } from '../ticket.service';
import { UserService } from '../../users/user.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly departmentService = inject(DepartmentService);
  private readonly categoryMappingService = inject(TicketCategoryMappingService);
  private readonly categoryService = inject(TicketCategoryService);
  private readonly priorityService = inject(TicketPriorityService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly ticket = signal<Ticket | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly assignableUsers = signal<User[]>([]);
  readonly allCategories = signal<TicketCategory[]>([]);
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
    this.statusForm.controls.departmentId.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((departmentId) => {
      this.statusForm.controls.assignedTo.setValue('');
      this.statusForm.controls.categoryCode.setValue('', { emitEvent: false });
      this.loadCategoriesForDepartment(departmentId);
      this.loadAssignableUsers(departmentId, '');
    });
    this.statusForm.controls.categoryCode.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((categoryCode) => {
      this.statusForm.controls.assignedTo.setValue('');
      this.loadAssignableUsers(this.statusForm.controls.departmentId.value, categoryCode);
    });
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
        }, { emitEvent: false });
        this.loadDepartments();
        this.loadCategoriesForDepartment(
          ticket?.departmentId ? String(ticket.departmentId) : '',
          ticket?.categoryCode ?? ''
        );
        this.loadAssignableUsers(
          ticket?.departmentId ? String(ticket.departmentId) : '',
          ticket?.categoryCode ?? ''
        );
      });
    }
  }

  private loadDepartments(): void {
    this.departmentService.list().subscribe({
      next: (departments) => {
        this.departments.set(departments.filter((department) => department.status !== 'INACTIVE' && department.status !== 'DELETED'));
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load departments'))
    });
  }

  private loadCategories(): void {
    this.categoryService.list({ page: 0, size: 100 }).subscribe({
      next: (categories) => {
        const activeCategories = categories.filter((category) => category.status !== 'INACTIVE' && category.status !== 'DELETED');
        this.allCategories.set(activeCategories);
        this.categories.set(activeCategories);
        this.loadCategoriesForDepartment(this.statusForm.controls.departmentId.value, this.statusForm.controls.categoryCode.value);
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load categories'))
    });
  }

  private loadPriorities(): void {
    this.priorityService.list({ page: 0, size: 100 }).subscribe({
      next: (priorities) => this.priorities.set(priorities.filter((priority) => priority.status !== 'INACTIVE' && priority.status !== 'DELETED')),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load priorities'))
    });
  }

  private loadAssignableUsers(departmentId: string, categoryCode: string): void {
    if (!departmentId && !categoryCode) {
      this.assignableUsers.set([]);
      return;
    }

    this.userService.getUsersByDepartment({
      ...(departmentId ? { departmentId } : {}),
      ...(categoryCode ? { categoryCode } : {})
    }).subscribe({
      next: (users) => this.assignableUsers.set(users.filter((user) => user.status !== 'INACTIVE' && user.status !== 'DELETED')),
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load department users'))
    });
  }

  private loadCategoriesForDepartment(departmentId: string, selectedCategoryCode = ''): void {
    if (!departmentId) {
      this.categories.set(this.allCategories());
      return;
    }

    this.categoryMappingService.list({ departmentId }).subscribe({
      next: (mappings) => {
        const activeMappings = mappings.filter((mapping) => mapping.status !== 'INACTIVE' && mapping.status !== 'DELETED');
        const mappedCategoryIds = new Set(activeMappings.map((mapping) => String(mapping.categoryId)));
        const mappedCategoryCodes = new Set(activeMappings.map((mapping) => mapping.categoryCode).filter(Boolean).map(String));
        const filteredCategories = this.allCategories().filter((category) => {
          return mappedCategoryIds.has(String(category.id)) || mappedCategoryCodes.has(category.code);
        });

        this.categories.set(filteredCategories);

        if (selectedCategoryCode && filteredCategories.some((category) => category.code === selectedCategoryCode)) {
          return;
        }

        this.statusForm.controls.categoryCode.setValue('', { emitEvent: false });
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load department categories'))
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
