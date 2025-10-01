import {
  Component,
  OnInit,
  signal,
  effect,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductTableComponent } from '../../components/product-table/product-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, ProductTableComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private productService = inject(ProductService);

  public products = signal<Product[]>([]);
  public isLoading = signal<boolean>(true);
  public currentPage = signal<number>(1);
  public pageSize = signal<number>(9);
  public totalProducts = signal<number>(0);
  public displayMode = signal<'card' | 'table'>('card');
  public pageSizeOptions = [9, 12, 18, 24];

  public totalPages = computed(() => {
    return Math.ceil(this.totalProducts() / this.pageSize());
  });

  constructor() {
    effect(
      () => {
        this.fetchProduts();
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {}

  fetchProduts(): void {
    this.isLoading.set(true);
    const page = this.currentPage();
    const limit = this.pageSize();

    this.productService.getProducts(page, limit).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.totalProducts.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading.set(false);
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

  goToPreviousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  setDisplayMode(mode: 'card' | 'table'): void {
    this.displayMode.set(mode);
  }
}
