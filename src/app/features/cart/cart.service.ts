import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Cart, CartProductLine } from './interfaces/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);

  addToCart(userId: number, products: CartProductLine[]) {
    return this.http.post<Cart>(`${environment.apiBaseUrl}/carts/add`, { userId, products });
  }
}
