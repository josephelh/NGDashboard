import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { catchError, of } from 'rxjs';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Post } from '../../models/post.model';
import { PostCardComponent } from '../../components/post-card/post-card.component';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, PostCardComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  public user = signal<User | null>(null);
  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  public posts = signal<Post[]>([]);
  public arePostsLoading = signal<boolean>(true);
  public postsError = signal<string | null>(null);

  public isEditModalOpen = signal<boolean>(false);
  public editForm!: FormGroup;

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');

    if (!userId) {
      this.error.set('User ID is missing from the URL.');
      this.isLoading.set(false);
    } else {
      this.initializeForm(); // Initialize the form structure
      this.fetchUser(Number(userId));
      this.fetchUserPosts(); // Fetch user posts
    }
  }

  private initializeForm(): void {
    this.editForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      birthDate: new FormControl(''),
      gender: new FormControl(''),
      city: new FormControl(''), // Nested property flattened for the form
      state: new FormControl(''), // Nested property flattened for the form
      companyName: new FormControl(''),
    });
  }

  private fetchUser(id: number): void {
    this.isLoading.set(true);
    this.userService
      .getUserById(id)
      .pipe(
        catchError((err) => {
          this.error.set('Failed to fetch user data. The user may not exist.');
          return of(null);
        })
      )
      .subscribe((user) => {
        if (user) {
          this.user.set(user);
        }
        this.isLoading.set(false);
      });
  }

  private fetchUserPosts(): void {
    this.arePostsLoading.set(true);
    this.userService
      .getUserPosts()
      .pipe(
        catchError((err) => {
          this.postsError.set(
            'Failed to fetch user posts. The posts may not exist.'
          );
          return of(null);
        })
      )
      .subscribe((response) => {
        if (response) {
          this.posts.set(response.posts);
          console.log(response.posts);
        }
        this.arePostsLoading.set(false);
      });
  }

  // --- NEW: Methods to control the modal and form ---

  openEditModal(): void {
    const currentUser = this.user();
    if (currentUser) {
      // Pre-fill the form with the current user's data
      this.editForm.patchValue({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        phone: currentUser.phone,
        username: currentUser.username,
        birthDate: currentUser.birthDate,
        gender: currentUser.gender,
        city: currentUser.address?.city, // Use optional chaining for safety
        state: currentUser.address?.state,
        companyName: currentUser.company?.name,
      });
      this.isEditModalOpen.set(true);
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  onSaveChanges(): void {
    if (this.editForm.invalid || !this.user()) {
      return; // Stop if the form is invalid or there's no user
    }

    const userId = this.user()!.id;
    const formValue = this.editForm.value;

    this.userService.updateUser(userId, formValue).subscribe({
      next: (_updatedUserFromApi) => {
        console.log('Update was successful!');

        const currentUser = this.user()!;
        const mergedUser: User = {
          // 1. Start with all the properties of the original user.
          ...currentUser,
          // 2. Overwrite the simple, top-level properties from our form.
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          username: formValue.username,
          birthDate: formValue.birthDate,
          gender: formValue.gender,
          // 3. Rebuild the nested `address` object using data from the form.
          address: {
            ...currentUser.address, // Keeps old properties like 'street' if they exist
            city: formValue.city,
            state: formValue.state,
          },
          // 4. Rebuild the nested `company` object, mapping `companyName` to `name`.
          company: {
            ...currentUser.company, // Keeps old properties like 'title'
            name: formValue.companyName, // <-- This is the correct mapping
          },
        };
        this.user.set(mergedUser);
        this.closeEditModal();
        // Optional: Show a success toast/notification here
      },
      error: (err) => {
        console.error('Failed to update user', err);
        // Optional: Show an error toast/notification here
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
