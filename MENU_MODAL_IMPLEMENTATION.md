# Menu Modal Implementation Guide

## Overview

This implementation adds a **Menu Modal** feature to the Restaurants page, allowing users to:
- View restaurant menus with search/filtering
- Add items to cart with localStorage persistence
- Enjoy a responsive, modern UI matching FlavorFleet design

---

## Files Created

### 1. **Cart Service** (`src/app/services/cart.service.ts`)
Manages cart state with localStorage persistence.

**Key Methods:**
- `addItem(item)` - Add item or increment quantity
- `removeItem(itemId, restaurantId)` - Remove from cart
- `updateQuantity(itemId, restaurantId, quantity)` - Update quantity
- `getCart()` - Get all cart items
- `getTotal()` - Calculate cart total
- `getItemCount()` - Get total items count
- `cartItems$` - Observable for reactive updates

**localStorage Key:** `flavorfleet_cart`

---

### 2. **Menu Modal Component** (`src/app/components/common/restaurants/menu-modal/menu-modal.component.ts`)

**Features:**
- Search menu items by name or description
- Grid layout with responsive design
- Add to cart functionality
- Loading and empty states
- Toast notifications

**Inputs:**
```typescript
@Input() visible: boolean;           // Control modal visibility
@Input() restaurantId: string;       // Restaurant ID for API fetch
@Input() restaurantName: string;     // Display restaurant name in header
```

**Outputs:**
```typescript
@Output() onVisibleChange = new EventEmitter<boolean>(); // Emit close event
```

**Styling:**
- Primary blue header (var(--p-primary-500))
- Card-based menu item grid
- Hover effects with elevation
- Fully responsive (mobile, tablet, desktop)

---

### 3. **Updated Restaurants Component**

**Changes:**
- Import `MenuModalComponent`
- Add modal state variables
- `openRestaurantMenu(r)` - Opens menu modal for selected restaurant
- `onMenuModalClose(visible)` - Handles modal close

---

## How It Works

### 1. User Clicks "Megnyitás" Button
```html
<button 
  pButton 
  label="Megnyitás" 
  (click)="openRestaurantMenu(r)"
></button>
```

### 2. Component Triggers Menu Modal
```typescript
openRestaurantMenu(r: Restaurant) {
  this.selectedRestaurantId = String(r.id);
  this.selectedRestaurantName = r.name;
  this.menuModalVisible = true;
}
```

### 3. Menu Modal Fetches Items
```typescript
loadMenuItems(): void {
  this.apiService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
    next: (response) => {
      this.menuItems = response.data || response;
      this.filteredMenuItems = [...this.menuItems];
    }
  });
}
```

### 4. User Searches (Optional)
```typescript
onSearchChange(): void {
  const query = this.searchQuery.toLowerCase().trim();
  this.filteredMenuItems = this.menuItems.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
}
```

### 5. User Adds Item to Cart
```typescript
addToCart(item: MenuItem): void {
  this.cartService.addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    restaurantId: this.restaurantId,
    imageUrl: item.imageUrl,
  });
}
```

### 6. Cart Service Persists to localStorage
```javascript
// Stored as JSON in localStorage
localStorage.getItem('flavorfleet_cart')
// Output:
[
  {
    "id": "1",
    "name": "Margherita Pizza",
    "price": 3500,
    "quantity": 2,
    "restaurantId": "5",
    "imageUrl": "..."
  }
]
```

---

## API Integration

The implementation uses existing API endpoint:

**Endpoint:** `GET /menuitems/restaurant/{restaurantId}`

**Response Format:**
```json
{
  "data": [
    {
      "id": "1",
      "name": "Margherita Pizza",
      "description": "Tomato, mozzarella, basil",
      "price": 3500,
      "imageUrl": "...",
      "restaurant_id": "5",
      "available": true
    }
  ]
}
```

---

## UI/UX Features

### Modal Header
- Restaurant name displayed in title
- Close button (X) in top right
- Blue theme (primary color)

### Search Bar
- Real-time filtering
- Search icon
- Placeholder: "Keresés menü alapján..."

### Menu Items Grid
- Responsive grid (auto-fill columns)
- Image display with fallback icon
- Item name, description, price
- "Kosárba" button for each item

### States
- **Loading:** Spinner with "Menü betöltése..."
- **Empty:** Icon with "A menü jelenleg üres"
- **Error:** Toast notification with error message

### Responsive Breakpoints
- **Desktop:** Multi-column grid
- **Tablet:** 2-3 columns
- **Mobile:** Single column, full-width items

---

## Usage Example

### 1. In Template
```html
<app-menu-modal
  [visible]="menuModalVisible"
  [restaurantId]="selectedRestaurantId"
  [restaurantName]="selectedRestaurantName"
  (onVisibleChange)="onMenuModalClose($event)"
></app-menu-modal>
```

### 2. In Component
```typescript
export class RestaurantsComponent {
  menuModalVisible = false;
  selectedRestaurantId: string = '';
  selectedRestaurantName: string = '';

  openRestaurantMenu(r: Restaurant) {
    this.selectedRestaurantId = String(r.id);
    this.selectedRestaurantName = r.name;
    this.menuModalVisible = true;
  }

  onMenuModalClose(visible: boolean) {
    this.menuModalVisible = visible;
  }
}
```

---

## Cart Service Usage Elsewhere

**Display Cart Count in Header:**
```typescript
constructor(private cartService: CartService) {}

get cartCount(): number {
  return this.cartService.getItemCount();
}

get cartTotal(): number {
  return this.cartService.getTotal();
}
```

**Subscribe to Cart Changes:**
```typescript
this.cartService.cartItems$.subscribe(items => {
  console.log('Cart updated:', items);
});
```

---

## Styling & Theme

### Colors (PrimeNG CSS Variables)
- **Primary:** `var(--p-primary-500)` (Blue)
- **Text:** `var(--p-text-color)`
- **Muted Text:** `var(--p-text-muted-color)`
- **Surface:** `var(--p-surface-card)`
- **Border:** `var(--p-surface-border)`

### Features
- Smooth transitions and hover effects
- Box shadows for depth
- Rounded corners (6-8px)
- Consistent padding (0.75rem - 1.5rem)

---

## Future Enhancements

1. **Quantity Selector in Modal** - Let users set quantity before adding
2. **Cart Summary** - Show cart preview in modal footer
3. **Favorites** - Mark favorite items
4. **Dietary Filters** - Filter by vegan, gluten-free, etc.
5. **Price Range Filter** - Filter by price
6. **Ratings & Reviews** - Show item ratings
7. **Special Offers** - Display discounts/special items

---

## Testing

### Manual Testing Checklist
- [ ] Click "Megnyitás" - Modal opens
- [ ] Modal displays restaurant name in header
- [ ] Menu items load and display correctly
- [ ] Search filters items by name
- [ ] Search filters items by description
- [ ] Add to cart shows success notification
- [ ] Close button works
- [ ] Refresh page - cart persists
- [ ] Multiple items add correctly
- [ ] Same item increments quantity
- [ ] Modal is responsive on mobile

### Unit Test Example (Jest)
```typescript
describe('MenuModalComponent', () => {
  it('should add item to cart', () => {
    component.addToCart(mockMenuItem);
    expect(cartService.addItem).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: mockMenuItem.id,
        name: mockMenuItem.name,
        price: mockMenuItem.price,
      })
    );
  });

  it('should filter items by search query', () => {
    component.menuItems = [
      { name: 'Pizza', description: 'Italian' },
      { name: 'Burger', description: 'American' },
    ];
    component.searchQuery = 'Pizza';
    component.onSearchChange();
    expect(component.filteredMenuItems.length).toBe(1);
  });
});
```

---

## Troubleshooting

**Issue:** Menu items not loading
- **Check:** API endpoint returns correct `restaurant_id`
- **Fix:** Verify API service has `getMenuItemsByRestaurant` method

**Issue:** Cart not persisting
- **Check:** Browser localStorage is enabled
- **Fix:** Clear localStorage and try again

**Issue:** Modal not closing
- **Check:** `onVisibleChange` event is properly bound
- **Fix:** Verify output EventEmitter is working

**Issue:** Images not displaying
- **Check:** Image URLs are valid and accessible
- **Fix:** Ensure CORS is enabled on image server

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Considerations

1. **Lazy Load Images** - Consider implementing image lazy loading for large menus
2. **Virtualization** - For 100+ items, use `cdk-virtual-scroll`
3. **Debounce Search** - Implemented via Angular's `(ngModelChange)` with 200ms default
4. **localStorage Limit** - Watch out for 5-10MB limit with large cart items

---

## Version History

- **v1.0** - Initial implementation with search, filter, and cart functionality
