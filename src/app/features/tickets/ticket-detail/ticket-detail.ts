import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-detail',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss'
})
export class TicketDetail implements OnInit {
  private readonly ticketService = inject(TicketService);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly ticket = signal<Ticket | null>(null);
  readonly statusForm = this.formBuilder.nonNullable.group({
    status: ['OPEN', Validators.required],
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

    const { status, assignedTo } = this.statusForm.getRawValue();
    this.ticketService.updateStatus(ticket.id, status).subscribe(() => {
      if (assignedTo.trim()) {
        this.ticketService.assign(ticket.id, assignedTo.trim()).subscribe(() => this.loadTicket());
        return;
      }

      this.loadTicket();
    });
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
          status: ticket?.status ?? 'OPEN',
          assignedTo: ticket?.assignedTo ? String(ticket.assignedTo) : ''
        });
      });
    }
  }
}
