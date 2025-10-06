import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UsersComponent } from './pages/users/users.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';
import { authGuard } from './services/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { TodoComponent } from './pages/todo/todo.component';
import { UserAddComponent } from './pages/user-add/user-add.component';
import { PostsComponent } from './pages/posts/posts.component';
import { PostDetalisComponent } from './pages/post-detalis/post-detalis.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  // --- Protected Routes ---
  // All routes below this point will be protected by the authGuard.
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard], // Apply the guard here
  },
  {
    path: 'analytics',
    component: AnalyticsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'todo',
    component: TodoComponent,
    canActivate: [authGuard],
  },
  {
    path: 'users',
    component: UsersComponent,
    canActivate: [authGuard],
  },
  { path: 'users/new', component: UserAddComponent, canActivate: [authGuard] },
  {
    path: 'users/:id',
    component: UserDetailsComponent,
    canActivate: [authGuard],
  },

  {
    path: 'posts',
    component: PostsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'posts/:id',
    component: PostDetalisComponent,
    canActivate: [authGuard],
  },

  // --- Redirects ---
  // If the user goes to the root path, redirect them to the dashboard.
  // The guard on the dashboard will then handle the auth check.
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Wildcard route for any other path, redirect to dashboard.
  { path: '**', redirectTo: 'dashboard' },
];
