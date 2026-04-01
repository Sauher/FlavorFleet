# Integration Guide - Admin Restaurant Management

This guide shows how all the pieces fit together in the FlavorFleet application.

---

## 🔗 Integration Points

### 1. Backend Route Registration

**File**: `Backend/config/app.js`

```javascript
// Import the admin routes
const adminRestaurantRoutes = require('../routes/admin-restaurant.routes');

// Register the route
app.use('/admin/restaurants', adminRestaurantRoutes);
```

**Flow**:
```
Request: GET /admin/restaurants
  ↓ (matched by route)
Handler in admin-restaurant.routes.js
  ↓ (with auth + admin middleware)
Database query with join
  ↓
Response with owner details
```

---

### 2. Middleware Chain

**File**: `Backend/routes/admin-restaurant.routes.js`

```javascript
router.get("/", [authenticate, adminAuthorization], async (req, res) => {
  // authenticate: Verifies JWT token
  // adminAuthorization: Checks role === 'admin'
  // Only reaches here if both succeed
});
```

**Middleware Stack**:
```
Express Route
  ↓
authenticate Middleware (JWT verification)
  ↓ (sets req.user)
adminAuthorization Middleware (role check)
  ↓ (sets req.adminUser)
Route Handler (database operation)
```

---

### 3. Frontend API Integration

**File**: `FrontEnd/src/app/services/api.service.ts`

```typescript
// Existing methods used:
selectAll(table: string)  // Used for GET /admin/restaurants
update(table, id, data)   // Used for PATCH toggle-status
put(table, id, data)      // Used for PUT update
delete(table, id)         // Used for DELETE

// Usage in component:
this.api.selectAll('admin/restaurants').subscribe({...});
this.api.put('admin/restaurants', restaurantId, updateData).subscribe({...});
this.api.delete('admin/restaurants', restaurantId).subscribe({...});
```

**Request Format**:
```typescript
// GET request
GET /admin/restaurants
Headers: {
  Authorization: Bearer JWT_TOKEN,
  Content-Type: application/json
}

// PUT request
PUT /admin/restaurants/RESTAURANT_ID
Headers: {
  Authorization: Bearer JWT_TOKEN,
  Content-Type: application/json
}
Body: {
  name: "Updated Name",
  address: "New Address",
  ...
}
```

---

### 4. Route Guard Integration

**File**: `FrontEnd/src/app/app.routes.ts`

```typescript
import { AdminRestaurantManagementComponent } from './components/admin/admin-restaurant-management/admin-restaurant-management.component';

export const routes: Routes = [
  {
    path: "admin-restaurants",
    component: AdminRestaurantManagementComponent,
    canActivate: [adminGuard]  // Only admins can access
  }
];
```

**Guard Flow**:
```
User navigates to /admin-restaurants
  ↓
adminGuard executes
  ↓
authService.isAdmin() returns promise
  ↓ if true: Continue to component
  ↓ if false: Redirect to /home
```

---

### 5. Component Lifecycle

**File**: `FrontEnd/src/app/components/admin/admin-restaurant-management/admin-restaurant-management.component.ts`

```typescript
@Component({
  selector: 'app-admin-restaurant-management',
  standalone: true,
  imports: [/* PrimeNG modules */],
  templateUrl: './admin-restaurant-management.component.html',
  styleUrl: './admin-restaurant-management.component.scss'
})
export class AdminRestaurantManagementComponent implements OnInit {
  ngOnInit() {
    this.loadRestaurants();  // Called when component loads
  }

  loadRestaurants() {
    this.api.selectAll('admin/restaurants').subscribe({
      next: (response) => this.restaurants = response.data,
      error: (error) => this.messageService.show('error', ...)
    });
  }

  onSearchChange() {
    // Called when user types in search
    this.filteredRestaurants = this.restaurants.filter(r => 
      r.name.includes(this.searchValue) || 
      r.owner?.name.includes(this.searchValue)
    );
  }

  openEditDialog(restaurant) {
    this.selectedRestaurant = restaurant;
    this.editForm.patchValue({...});
    this.editDialogVisible = true;
  }

  saveRestaurant() {
    this.api.put('admin/restaurants', this.selectedRestaurant.id, data)
      .subscribe({
        next: () => {
          this.restaurants = this.restaurants.map(r => 
            r.id === this.selectedRestaurant.id ? {...} : r
          );
          this.editDialogVisible = false;
        }
      });
  }
}
```

**Component Lifecycle**:
```
Component Created
  ↓
ngOnInit
  ↓
loadRestaurants() API call
  ↓ Response received
updateTable Display
  ↓
User Interactions (search, edit, toggle, delete)
  ↓
API Calls (PUT, PATCH, DELETE)
  ↓
Update Local Data
  ↓
Update View Automatically (Angular binding)
```

---

### 6. Header Navigation Integration

**File**: `FrontEnd/src/app/components/system/header/header.component.ts`

```typescript
async checkAuthStatus() {
  this.isLoggedIn = this.auth.isLoggedUser();
  if (this.isLoggedIn) {
    this.isAdmin = await this.auth.isAdmin();
  }
}

buildMenuItems() {
  if (this.isAdmin) {
    menuItems.push({
      label: 'Kezelőpult',
      items: [
        { label: 'Felhasználók kezelése', routerLink: '/user-control' },
        { label: 'Éttermek kezelése', routerLink: '/admin-restaurants' },
        // ...
      ]
    });
  }
}
```

**Menu Display Flow**:
```
Page Load
  ↓
checkAuthStatus() (async)
  ↓ await isAdmin?
buildMenuItems()
  ↓
Show Admin Menu if isAdmin = true
```

---

## 🔐 Security Integration

### JWT Token Flow

```
Login Request
  ↓ credentials valid?
  ↓
Generate JWT Token (in auth.service)
  ↓
Send to Frontend
  ↓
Store in sessionStorage
  ↓
On API Request:
  ↓
Append to Authorization header
  ↓
Backend receives
  ↓
authenticate middleware: Verify JWT
  ↓ valid JWT?
  ↓
Decode and extract user ID
  ↓
Set req.user = {id}
  ↓
adminAuthorization middleware: Check role
  ↓
Query database for user role
  ↓ role === 'admin'?
  ↓
Proceed to route handler
```

### Authorization Check Layers

**Layer 1 - Frontend Route Guard**:
```typescript
adminGuard: CanActivateFn = async (route, state) => {
  if (await authService.isAdmin()) return true;
  else redirect to /home;
};
```

**Layer 2 - Frontend Component**:
```typescript
ngOnInit() {
  // Guard ensures we're admin, but component can also check
  if (!this.auth.isLoggedUser()) navigate to login;
}
```

**Layer 3 - Backend Middleware**:
```javascript
adminAuthorization(req, res, next) {
  if (!req.user?.id) return 401;
  if (user.role !== 'admin') return 403;
  next();
}
```

**Layer 4 - Database Level**:
```sql
-- Owner only sees their own restaurants
-- Admin sees all restaurants (no filtering)
SELECT * FROM restaurants WHERE owner_id = ? -- for owner
SELECT * FROM restaurants -- for admin (no WHERE clause)
```

---

## 💾 Data Flow Examples

### Example 1: Load and Display Restaurants

```
Step 1: Component Init
  AdminRestaurantManagementComponent.ngOnInit()
  ↓
Step 2: API Call
  this.api.selectAll('admin/restaurants')
  ↓
Step 3: HTTP Request
  GET http://localhost:3000/admin/restaurants
  Header: Authorization: Bearer eyJ...
  ↓
Step 4: Backend Processing
  Express matches route /admin/restaurants
  authenticate middleware verifies JWT
  adminAuthorization middleware checks role
  Handler executes database query:
    SELECT r.*, u.id, u.name, u.email
    FROM restaurants r
    JOIN users u ON r.owner_id = u.id
  ↓
Step 5: Response
  200 OK with all restaurants and owner details
  ↓
Step 6: Frontend Update
  Subscribe callback receives response
  this.restaurants = response.data
  this.filteredRestaurants = [...this.restaurants]
  ↓
Step 7: View Render
  *ngFor over filteredRestaurants
  Table displays with all columns
```

### Example 2: Edit Restaurant

```
Step 1: User Clicks Edit
  openEditDialog(restaurant)
  ↓
Step 2: Modal Opens
  Form populated with restaurant data
  User modifies fields
  ↓
Step 3: User Clicks Save
  saveRestaurant()
  ↓
Step 4: Validation
  Form validation checks
  Required fields filled?
  ↓
Step 5: API Call
  this.api.put('admin/restaurants', id, updateData)
  ↓
Step 6: HTTP Request
  PUT http://localhost:3000/admin/restaurants/uuid
  Headers: Authorization: Bearer token
  Body: { name, description, address, phone, ... }
  ↓
Step 7: Backend Processing
  Express routes to PUT handler
  Middleware chain validates auth/admin
  Handler updates database:
    UPDATE restaurants SET name=?, address=? WHERE id=?
  Returns updated restaurant with owner
  ↓
Step 8: Response
  200 OK with updated restaurant
  ↓
Step 9: Frontend Update
  Find and update local restaurant in array
  Close modal
  ↓
Step 10: User Feedback
  Show success toast: "Étterem sikeresen frissítve"
  Table automatically reflects changes (Angular binding)
```

### Example 3: Search Functionality

```
Step 1: User Types in Search
  <input (ngModelChange)="onSearchChange()">
  searchValue = "Central"
  ↓
Step 2: Filter Logic (CLIENT-SIDE, NO API CALL)
  onSearchChange() {
    filteredRestaurants = restaurants.filter(r =>
      r.name.toLowerCase().includes("central") ||
      r.owner?.name.toLowerCase().includes("central")
    )
  }
  ↓
Step 3: View Update
  Table re-renders with filtered restaurants
  Pagination resets to page 1
  Result count updates
  ↓
Step 4: If No Results
  Empty state message displays
```

### Example 4: Toggle Status

```
Step 1: User Clicks Toggle
  toggleRestaurantStatus(restaurant)
  ↓
Step 2: Confirmation Dialog
  Confirmation service shows dialog
  Message: "Biztosan szeretnéd...?"
  User clicks Confirm
  ↓
Step 3: API Call
  this.api.update(`admin/restaurants/${id}/toggle-status`, id, {})
  ↓
Step 4: HTTP Request
  PATCH http://localhost:3000/admin/restaurants/uuid/toggle-status
  Headers: Authorization: Bearer token
  ↓
Step 5: Backend Processing
  Find restaurant
  Toggle is_active: !restaurant.is_active
  Save to database
  Return updated restaurant
  ↓
Step 6: Response
  200 OK with is_active: true/false
  ↓
Step 7: Frontend Update
  Update local restaurant.is_active
  Update badge color (green/red)
  ↓
Step 8: User Feedback
  Toast: "Étterem sikeresen aktiválva/deaktiválva"
```

---

## 🧩 Component Communication

### Parent to Child (via Input Properties)

```typescript
// Not used in this implementation (standalone component)
// but would look like:
@Input() restaurant: RestaurantWithOwner;
```

### Child to Parent (via Output Events)

```typescript
// Not used in this implementation (standalone component)
// but would look like:
@Output() restaurantUpdated = new EventEmitter<Restaurant>();
this.restaurantUpdated.emit(updatedRestaurant);
```

### Service-Based Communication (USED)

```typescript
// Via ApiService (HTTP communication)
this.api.selectAll('admin/restaurants').subscribe(...)

// Via MessageService (Notifications)
this.messageService.show('success', 'Siker', 'Message')

// Via ConfirmationService (Dialogs)
this.confirmationService.confirm({...})
```

---

## 📱 Responsive Breakpoints

### Desktop (> 768px)
```
Full table view
All columns visible
Wide search bar (max-width: 500px)
```

### Tablet (≤ 768px)
```
Adjusted padding
Smaller font sizes
Compact buttons
```

### Mobile (≤ 480px)
```
Very compact layout
Small font (0.75rem)
Stack action buttons
Full-width search
```

---

## 🎯 State Management

### Component State
```typescript
restaurants: RestaurantWithOwner[] = [];        // All restaurants from API
filteredRestaurants: RestaurantWithOwner[] = []; // Filtered by search
loading = true;                                  // Loading state
editDialogVisible = false;                       // Modal visibility
selectedRestaurant = null;                       // Currently editing
searchValue = '';                                // Search query
editForm: FormGroup;                             // Edit form
```

### State Transitions
```
Initial
  loading = true
  ↓ API response received
restaurants populated
  loading = false
  filteredRestaurants = restaurants
  ↓ User types search
filteredRestaurants updated
  ↓ User clicks Edit
selectedRestaurant set
  editDialogVisible = true
  ↓ User cancels/saves
editDialogVisible = false
  selectedRestaurant = null
  ↓ if saved: restaurants updated
```

---

## 🔄 Event Binding

### Two-Way Binding
```html
<input [(ngModel)]="searchValue" (ngModelChange)="onSearchChange()">
```

### Event Binding
```html
<button (click)="saveRestaurant()">Mentés</button>
<p-toggleSwitch (onChange)="toggleRestaurantStatus(...)"></p-toggleSwitch>
```

### Template Variables
```html
<p-table [value]="filteredRestaurants" let-rowIndex="rowIndex">
  <tr>
    <td>{{ rowIndex + 1 }}</td>
    <td>{{ restaurant.name }}</td>
  </tr>
</p-table>
```

---

## 📦 Module Imports

### Backend Modules
```javascript
const express = require('express');           // Web framework
const jwt = require('jsonwebtoken');          // JWT handling
const { Restaurant, User } = require('../models');  // Models
const { authenticate } = require('../middleware/auth_middleware');
const { adminAuthorization } = require('../middleware/admin_middleware');
```

### Frontend Modules
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule, ButtonModule, ... } from 'primeng/...';
import { ApiService } from '../../../services/api.service';
import { MessageService } from '../../../services/message.service';
import { ConfirmationService } from 'primeng/api';
```

---

## ✅ Integration Checklist

Before deploying to production:

- [ ] Admin middleware imported and tested
- [ ] Admin routes registered in app.js
- [ ] Component files in correct directory
- [ ] Route added to app.routes.ts
- [ ] adminGuard applied to route
- [ ] Header menu updated with correct routerLink
- [ ] API service has PUT method
- [ ] JWT token generation/verification working
- [ ] Database has test admin user
- [ ] All endpoints tested with admin token
- [ ] All endpoints tested without token (should fail)
- [ ] All endpoints tested with non-admin token (should fail)
- [ ] Frontend component displays without errors
- [ ] Search, edit, toggle, delete all work
- [ ] Toast notifications display
- [ ] Confirmation dialogs appear
- [ ] Mobile responsive design tested
- [ ] No console errors

---

## 🚀 Deployment Steps

1. **Backend**:
   ```bash
   # Copy files
   cp middleware/admin_middleware.js Backend/middleware/
   cp routes/admin-restaurant.routes.js Backend/routes/
   
   # Update config/app.js
   # Restart server
   npm restart
   ```

2. **Frontend**:
   ```bash
   # Copy files
   cp -r components/admin/admin-restaurant-management/ FrontEnd/src/app/components/admin/
   
   # Update app.routes.ts
   # Update header.component.ts
   # Update api.service.ts
   
   # Rebuild
   npm run build
   ```

3. **Testing**:
   ```bash
   # Test API endpoints
   curl -H "Authorization: Bearer TOKEN" http://localhost:3000/admin/restaurants
   
   # Test frontend
   Navigate to http://localhost:4200/admin-restaurants
   ```

---

This integration guide demonstrates how all components work together to create a complete, secure Admin Restaurant Management feature! 🎉
