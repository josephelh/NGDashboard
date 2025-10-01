import { Component, input } from '@angular/core';
import { Product } from '../../models/product.model';


@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {

  product = input.required<Product>();

}
