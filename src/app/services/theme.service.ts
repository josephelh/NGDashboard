import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  theme = signal<Theme>(this.getInitialTheme());

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Apply the initial theme when the service is created
    this.applyTheme(this.theme());
  }

  private getInitialTheme(): Theme {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: Theme) {
    if (theme === 'dark') {
      this.renderer.addClass(this.document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(this.document.documentElement, 'dark');
    }
  }

  toggleTheme() {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }
}