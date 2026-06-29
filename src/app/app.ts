import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme.service';
import { KeyExchangeService } from './core/security/key-exchange.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly keyExchangeService = inject(KeyExchangeService);
  protected readonly title = signal('supprot-ticket-web');

  constructor() {
    this.keyExchangeService.ensureKeyExchange().subscribe();
  }
}
