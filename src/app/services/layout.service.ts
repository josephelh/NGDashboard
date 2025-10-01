import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  // Create a signal for the collapsed state
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.update(value => !value);
  }
}