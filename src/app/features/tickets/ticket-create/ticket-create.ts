import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreate {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ticketService = inject(TicketService);
  private readonly tokenStorage = inject(TokenStorageService);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['MEDIUM']
  });

  submit(): void {
    if (this.form.valid) {
      this.ticketService.create({
        ...this.form.getRawValue(),
        userId: this.tokenStorage.getUserId() ?? ''
      }).subscribe();
    }
  }
}
