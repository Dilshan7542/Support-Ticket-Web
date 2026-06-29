import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { TokenStorageService } from '../../core/auth/token-storage.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  constructor(
    readonly themeService: ThemeService,
    private readonly tokenStorage: TokenStorageService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.tokenStorage.clear();
    this.router.navigateByUrl('/auth/login');
  }
}
