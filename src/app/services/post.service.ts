import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, PostApiResponse } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  getAllPosts(): Observable<PostApiResponse> {
    return this.http.get<PostApiResponse>(`${environment.apiUrl}/posts`);
  }

  getSinglePost(id: number): Observable<Post> {
    return this.http.get<Post>(`${environment.apiUrl}/posts/${id}`);
  }

  addPost(postData: any): Observable<Post> {
    return this.http.post<Post>(`${environment.apiUrl}/posts/add`, postData);
  }
}
