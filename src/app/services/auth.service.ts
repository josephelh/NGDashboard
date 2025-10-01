import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, of, throwError } from 'rxjs'; // Import 'of' and 'throwError'
import { environment } from '../../environments/environment';
import { AuthResponse, LogedUser, RefreshResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  public isLoggedIn = signal<boolean>(!!this.getAccessToken());
  public logedUser = signal<LogedUser | null>(null);

  constructor() {
    const token = this.getAccessToken();
    const user = this.getloggedUser();

    if (token && user) {
      this.isLoggedIn.set(true);
      this.logedUser.set(user);
    }
  }

  login(credentials: { [key: string]: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.saveTokens(response.accessToken, response.refreshToken);
          const userToSave: LogedUser = {
            firstName: response.firstName,
            lastName: response.lastName,
            image: response.image,
          };
          this.saveLogedUser(userToSave);
          this.isLoggedIn.set(true);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_access_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('logged_user'); // Clear the user data
    this.isLoggedIn.set(false);
    this.logedUser.set(null); // Clear the signal
    this.router.navigate(['/login']);
  }

  // --- NEW: Refresh Token Logic ---
  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
        expiresInMins: 30, // Optional: You can ask for a new expiration time
      })
      .pipe(
        tap((response: RefreshResponse) => {
          // When we get new tokens, we must save them.
          this.saveTokens(response.accessToken, response.refreshToken);
        })
      );
  }

  // --- UPGRADED & NEW Token Helper Methods ---
  getAccessToken(): string | null {
    return localStorage.getItem('auth_access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('auth_refresh_token');
  }

  getloggedUser(): LogedUser | null {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('logged_user'); // Use a consistent key
      if (!userString) {
        return null;
      }
      // Parse the string and tell TypeScript to trust that it matches the LogedUser interface
      return JSON.parse(userString) as LogedUser;
    }
    return null;
  }

  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('auth_access_token', accessToken);
    localStorage.setItem('auth_refresh_token', refreshToken);
  }
  private saveLogedUser(loggedUser: LogedUser): void {
    localStorage.setItem('logged_user', JSON.stringify(loggedUser));
    this.logedUser.set(loggedUser); // Update the signal here
  }
}
