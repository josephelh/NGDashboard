import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { LayoutService } from './services/layout.service';
import { ThemeService } from './services/theme.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  layoutService = inject(LayoutService);
  authService = inject(AuthService);

  // Inject ThemeService to initialize it
  constructor(private themeService: ThemeService) {}

  // A computed signal for the main content's margin
  mainContentMargin = computed(() =>
    this.layoutService.isSidebarCollapsed() ? '80px' : '256px'
  );
}
