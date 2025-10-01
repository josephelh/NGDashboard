import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, UserApiResponse } from '../models/user.model';
import { environment } from '../../environments/environment';
import { PostApiResponse } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  getUsers(page: number, limit: number): Observable<UserApiResponse> {
    const skip = (page - 1) * limit;
    return this.http.get<UserApiResponse>(
      `${environment.apiUrl}/users?limit=${limit}&skip=${skip}`
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  /**
   * @param id The ID of the user to update.
   * @param userData An object containing only the fields to be changed (e.g., { email: 'new@email.com' }).
   * @returns An observable of the full, updated user object returned from the API.
   */
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${id}`, userData);
  }

  getUserPosts(): Observable<PostApiResponse> {
    return this.http.get<PostApiResponse>(
      `${environment.apiUrl}/users/5/posts`
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  addUser(userData: any): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/add`, userData);
  }
}
