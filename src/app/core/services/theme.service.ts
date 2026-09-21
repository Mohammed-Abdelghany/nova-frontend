import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'pharmaglow_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(readInitialTheme());
  readonly theme = this._theme.asReadonly();

  constructor() {
    this.applyTheme(this._theme());
  }

  toggle(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

function readInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
