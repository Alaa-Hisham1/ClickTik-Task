import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ProductCategory, ProductListResponse } from './interfaces/product';

export interface ProductsPage {
  limit: number;
  skip: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);

  getProducts({ limit, skip }: ProductsPage) {
    return this.http.get<ProductListResponse>(`${environment.apiBaseUrl}/products`, {
      params: new HttpParams().set('limit', limit).set('skip', skip),
    });
  }

  getProductsByCategory(category: string, { limit, skip }: ProductsPage) {
    return this.http.get<ProductListResponse>(
      `${environment.apiBaseUrl}/products/category/${category}`,
      { params: new HttpParams().set('limit', limit).set('skip', skip) },
    );
  }

  getCategories() {
    return this.http.get<ProductCategory[]>(`${environment.apiBaseUrl}/products/categories`);
  }

  searchProducts(query: string, { limit, skip }: ProductsPage) {
    return this.http.get<ProductListResponse>(`${environment.apiBaseUrl}/products/search`, {
      params: new HttpParams().set('q', query).set('limit', limit).set('skip', skip),
    });
  }
}
