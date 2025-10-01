import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { UserTableComponent } from '../../components/user-table/user-table.component';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, UserCardComponent, UserTableComponent, RouterLink],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);

  // --- State Management with Signals ---
  public users = signal<User[]>([]);
  public isLoading = signal<boolean>(true);
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(9); // Show 9 users per page
  public totalUsers = signal<number>(0);

  public pageSizeOptions = [9, 12, 18, 24];
  public displayMode = signal<'card' | 'table'>('card');

  public isDeleteModalOpen = signal<boolean>(false);
  public userToDelete = signal<User | null>(null);

  public refreshTrigger = signal<void>(undefined);

  // --- Computed Signal to derive total pages ---
  public totalPages = computed(() => {
    return Math.ceil(this.totalUsers() / this.pageSize());
  });

  constructor() {
    effect(
      () => {
        this.currentPage();
        this.pageSize();
        this.refreshTrigger();
        this.fetchUsers();
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.refresh();
  }

  fetchUsers(): void {
    this.isLoading.set(true);
    const page = this.currentPage();
    const limit = this.pageSize();

    this.userService.getUsers(page, limit).subscribe({
      next: (response) => {
        this.users.set(response.users);
        this.totalUsers.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.isLoading.set(false);
      },
    });
  }

  openDeleteModal(user: User): void {
    this.userToDelete.set(user);
    this.isDeleteModalOpen.set(true);
  }

  /**
   * Closes the modal and resets the state.
   */
  closeDeleteModal(): void {
    this.isDeleteModalOpen.set(false);
    this.userToDelete.set(null);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (!user) {
      return; // Safety check
    }

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        // On success, close the modal and refresh the user list
        console.log(`User ${user.firstName} deleted successfully.`);
        this.closeDeleteModal();
        this.fetchUsers(); // Re-fetch the data to show the updated list
        // You could also show a success notification here
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.closeDeleteModal();
        // You could show an error notification here
      },
    });
  }

  onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = parseInt(selectElement.value, 10);

    // Update the page size signal
    this.pageSize.set(newSize);
    // CRITICAL: Reset to the first page for a better user experience
    this.currentPage.set(1);
  }

  goToNextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }
  refresh(): void {
    // Setting the signal (even to the same value) will cause the effect to run
    this.refreshTrigger.set();
  }

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  setDisplayMode(mode: 'card' | 'table'): void {
    this.displayMode.set(mode);
  }
}
