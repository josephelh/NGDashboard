import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-add.component.html',
})
export class UserAddComponent {
  private router = inject(Router);
  private userService = inject(UserService);

  userForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
  });

  onSave(): void {
    if (this.userForm.invalid) {
      return;
    }
    // For DummyJSON, we just send the form value.
    // A real API might need more fields.
    this.userService.addUser(this.userForm.value).subscribe({
      next: (newUser) => {
        console.log('New user added:', newUser);
        this.router.navigate(['/users']);
      },
      error: (err) => console.error('Failed to add user', err),
    });
  }
}
