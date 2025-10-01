import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  public loginError = signal<string | null>(null);

  loginForm = new FormGroup({
    username: new FormControl('emilys', Validators.required), // Default value from DummyJSON docs
    password: new FormControl('emilyspass', Validators.required), // Default value
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.loginError.set(null); // Clear previous errors

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    if (!username || !password) {
      this.loginError.set('Username and password are required.');
      return;
    }

    this.authService.login({ username, password }).subscribe({
      next: () => {
        // On successful login, navigate to the dashboard.
        // The guard will now allow access.
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // On error, display a message.
        this.loginError.set('Invalid username or password. Please try again.');
        console.error(err);
      },
    });
  }
}
