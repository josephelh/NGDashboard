import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product, ProductApiResponse } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(page:number,limit: number): Observable<ProductApiResponse> {
    const skip =(page-1)*limit;
    return this.http.get<ProductApiResponse>(`${environment.apiUrl}/products?limit=${limit}&skip=${skip}`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }
}