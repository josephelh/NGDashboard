import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// No longer need ButtonModule from primeng
import { LayoutService } from '../../services/layout.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule], // Remove ButtonModule
  templateUrl: './topbar.component.html',
})
export class TopbarComponent {
  layoutService = inject(LayoutService);
}
