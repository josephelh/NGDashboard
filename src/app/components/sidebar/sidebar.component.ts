import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
// No longer need primeng modules
import { LayoutService } from '../../services/layout.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

export interface MenuItem {
  path: string;
  label: string;
  iconName: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Removed ButtonModule, MenuModule
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  public authService = inject(AuthService);
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);

  // Signal to control the profile dropdown menu
  isProfileMenuOpen = signal(false);

  menuItems: MenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      iconName: 'home',
    },
    {
      path: '/analytics',
      label: 'Analytics',
      iconName: 'chart',
    },
    {
      path: '/todo',
      label: 'Todos',
      iconName: 'chart',
    },
    {
      path: '/users',
      label: 'Users',
      iconName: 'users',
    },
  ];

  constructor() {}

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }
}
