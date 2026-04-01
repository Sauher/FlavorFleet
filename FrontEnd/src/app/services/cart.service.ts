import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_KEY = 'flavorfleet_cart';
  private cartItems = new BehaviorSubject<CartItem[]>(this.loadCart());

  public cartItems$ = this.cartItems.asObservable();

  constructor() {}

  /**
   * Load cart from localStorage
   */
  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(this.CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveCart(items: CartItem[]): void {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
      this.cartItems.next(items);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  /**
   * Add item to cart or increment quantity if already exists
   */
  addItem(item: Omit<CartItem, 'quantity'>): void {
    const currentCart = this.cartItems.getValue();
    const existingItem = currentCart.find(
      (ci) => ci.id === item.id && ci.restaurantId === item.restaurantId
    );

    if (existingItem) {
      existingItem.quantity++;
    } else {
      currentCart.push({ ...item, quantity: 1 });
    }

    this.saveCart(currentCart);
  }

  /**
   * Remove item from cart
   */
  removeItem(itemId: string, restaurantId: string): void {
    const currentCart = this.cartItems.getValue();
    const filteredCart = currentCart.filter(
      (ci) => !(ci.id === itemId && ci.restaurantId === restaurantId)
    );
    this.saveCart(filteredCart);
  }

  /**
   * Update item quantity
   */
  updateQuantity(itemId: string, restaurantId: string, quantity: number): void {
    const currentCart = this.cartItems.getValue();
    const item = currentCart.find(
      (ci) => ci.id === itemId && ci.restaurantId === restaurantId
    );

    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId, restaurantId);
      } else {
        item.quantity = quantity;
        this.saveCart(currentCart);
      }
    }
  }

  /**
   * Get all cart items
   */
  getCart(): CartItem[] {
    return this.cartItems.getValue();
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.saveCart([]);
  }

  /**
   * Get cart total
   */
  getTotal(): number {
    return this.cartItems.getValue().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  /**
   * Get cart item count
   */
  getItemCount(): number {
    return this.cartItems.getValue().reduce((count, item) => count + item.quantity, 0);
  }
}
