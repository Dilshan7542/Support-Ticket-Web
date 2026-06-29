import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

type ThemeMode = 'light-theme' | 'dark-theme';

const THEME_KEY = 'support_ticket_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly themeSignal = signal<ThemeMode>(this.getInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.theme() === 'dark-theme');

  constructor() {
    this.apply(this.themeSignal());
    this.systemThemeQuery.addEventListener('change', (event) => {
      if (localStorage.getItem(THEME_KEY)) {
        return;
      }

      const nextTheme: ThemeMode = event.matches ? 'dark-theme' : 'light-theme';
      this.themeSignal.set(nextTheme);
      this.apply(nextTheme);
    });
  }

  toggle(): void {
    const nextTheme: ThemeMode = this.themeSignal() === 'dark-theme' ? 'light-theme' : 'dark-theme';
    this.themeSignal.set(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    this.apply(nextTheme);
  }

  private getInitialTheme(): ThemeMode {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme === 'dark-theme' || savedTheme === 'light-theme'
      ? savedTheme
      : this.getSystemTheme();
  }

  private getSystemTheme(): ThemeMode {
    return this.systemThemeQuery.matches ? 'dark-theme' : 'light-theme';
  }

  private apply(theme: ThemeMode): void {
    const body = this.document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme);
    body.dataset['bsTheme'] = theme === 'dark-theme' ? 'dark' : 'light';
  }
}
