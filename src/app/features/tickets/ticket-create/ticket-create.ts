import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Ticket } from '../../../core/models/ticket.model';
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

  loading = false;
  createdTicket?: Ticket;
  error: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    subject: ['', Validators.required],
    description: ['', Validators.required]
  });

  ngOnInit(): void {
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
      subject: formValue.subject,
      description: formValue.description
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.form.reset({
          subject: '',
          description: ''
        });
      },
      error: (error) => {
        this.error = getApiErrorMessage(error, 'Unable to create ticket');
      }
    });
  }
}
