import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Department } from '../../../core/models/department.model';
import { Ticket } from '../../../core/models/ticket.model';
import { DepartmentService } from '../../departments/department.service';
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
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly ticket = signal<Ticket | null>(null);
  readonly departments = signal<Department[]>([]);
  readonly error = signal<string | null>(null);
  readonly statusForm = this.formBuilder.nonNullable.group({
    status: ['NEW', Validators.required],
    departmentId: [''],
    assignedTo: ['']
  });
  readonly replyForm = this.formBuilder.nonNullable.group({
    message: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadTicket();
  }

  updateStatus(): void {
    const ticket = this.ticket();

    if (!ticket || this.statusForm.invalid) {
      return;
    }

    const { status, assignedTo, departmentId } = this.statusForm.getRawValue();
    const assignedStaffId = assignedTo.trim();
    const hasAssignmentChanged = this.hasAssignmentChanged(ticket, departmentId, assignedStaffId);

    if (hasAssignmentChanged && !departmentId) {
      this.error.set('Department is required when assigning a ticket.');
      return;
    }

    this.error.set(null);
    this.ticketService.updateStatus(ticket.id, status).subscribe(() => {
      if (hasAssignmentChanged) {
        this.ticketService.assign(ticket.id, assignedStaffId || null, departmentId).subscribe({
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

    this.ticketService.addReply(ticket.id, this.replyForm.controls.message.value).subscribe(() => {
      this.replyForm.reset({ message: '' });
      this.loadTicket();
    });
  }

  private loadTicket(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.ticketService.detail({ id }).subscribe((ticket) => {
        this.ticket.set(ticket);
        this.statusForm.reset({
          status: ticket?.status ?? 'NEW',
          departmentId: ticket?.departmentId ? String(ticket.departmentId) : '',
          assignedTo: ticket?.assignedStaffId ? String(ticket.assignedStaffId) : ''
        });
        this.loadDepartments(ticket);
      });
    }
  }

  private loadDepartments(ticket: Ticket): void {
    if (!ticket.companyId) {
      this.departments.set([]);
      return;
    }

    this.departmentService.list({ companyId: ticket.companyId }).subscribe({
      next: (departments) => {
        this.departments.set(departments.filter((department) => department.status !== 'INACTIVE' && department.status !== 'DELETED'));
      },
      error: (error) => this.error.set(getApiErrorMessage(error, 'Unable to load departments'))
    });
  }

  private hasAssignmentChanged(ticket: Ticket, departmentId: string, assignedStaffId: string): boolean {
    const currentDepartmentId = ticket.departmentId ? String(ticket.departmentId) : '';
    const currentAssignedStaffId = ticket.assignedStaffId ? String(ticket.assignedStaffId) : '';

    return departmentId !== currentDepartmentId || assignedStaffId !== currentAssignedStaffId;
  }
}
