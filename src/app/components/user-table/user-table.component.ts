import { Component, input, Output, EventEmitter, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-table.component.html',
})
export class UserTableComponent {
  users = input.required<User[]>();

  // ✅ Output signal (no EventEmitter needed)
  deletUser = output<User>();

  onButtonClick(user: User): void {
    this.deletUser.emit(user);
  }
}
