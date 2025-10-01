import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-table.component.html',
  styleUrl: './product-table.component.scss'
})
export class ProductTableComponent {
products = input.required<Product[]>();

}
