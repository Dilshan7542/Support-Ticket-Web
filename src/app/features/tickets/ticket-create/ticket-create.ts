import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly tokenStorage = inject(TokenStorageService);

  loading = false;
  createdTicket?: Ticket;
  error: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    aiPredictionEnabled: [false]
  });

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
      title: formValue.title,
      message: formValue.message,
      aiPredictionEnabled: formValue.aiPredictionEnabled
    }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.form.reset({
          title: '',
          message: '',
          aiPredictionEnabled: false
        });
      },
      error: (error) => {
        this.error = getApiErrorMessage(error, 'Unable to create ticket');
      }
    });
  }
}
