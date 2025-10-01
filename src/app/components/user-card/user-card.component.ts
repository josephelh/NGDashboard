import { Component, Input, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-card.component.html',
})
export class UserCardComponent {
  // Use the modern input.required to create a required signal input
  user = input.required<User>();
}
