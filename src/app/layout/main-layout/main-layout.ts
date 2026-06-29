import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  constructor(readonly themeService: ThemeService) {}
}
