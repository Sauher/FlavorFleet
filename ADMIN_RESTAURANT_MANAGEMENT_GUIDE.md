# Admin Restaurant Management - Implementation Guide

## Overview
This document outlines the complete implementation of the Admin Restaurant Management page for FlavorFleet. This feature allows administrators to view, manage, and control all restaurants in the system globally (not filtered by owner).

---

## Backend Implementation

### 1. Admin Authorization Middleware

**File:** `Backend/middleware/admin_middleware.js`

Verifies that authenticated users have the `admin` role before accessing admin endpoints.

**Features:**
- Checks JWT token authenticity (via existing `authenticate` middleware)
- Validates user role is exactly `admin`
- Returns detailed error messages
- Attaches user object to request for later use

**Usage:**
```javascript
router.get("/path", [authenticate, adminAuthorization], handler);
```

### 2. Admin Restaurant Routes

**File:** `Backend/routes/admin-restaurant.routes.js`

Provides CRUD endpoints for admin restaurant management.

#### Endpoints:

**GET /admin/restaurants**
- Returns all restaurants with owner details
- Joins with users table to include owner name and email
- Sorted by creation date (newest first)
- Protected by: `authenticate` + `adminAuthorization`

**GET /admin/restaurants/:id**
- Returns a specific restaurant with owner details
- Protected by: `authenticate` + `adminAuthorization`

**PATCH /admin/restaurants/:id/toggle-status**
- Toggles the `is_active` field (true/false)
- Returns updated restaurant data
- Protected by: `authenticate` + `adminAuthorization`

**PUT /admin/restaurants/:id**
- Full update endpoint for restaurant fields
- Allows editing: name, description, address, phone, image_url, is_active, opening_hours
- Validates all input fields
- Protected by: `authenticate` + `adminAuthorization`

**DELETE /admin/restaurants/:id**
- Soft deletes a restaurant (sets `is_active` to false)
- Protected by: `authenticate` + `adminAuthorization`

### 3. Route Registration

**File:** `Backend/config/app.js`

```javascript
// Added imports
const adminRestaurantRoutes = require('../routes/admin-restaurant.routes');

// Added route registration
app.use('/admin/restaurants', adminRestaurantRoutes);
```

---

## Frontend Implementation

### 1. Admin Restaurant Management Component

**Location:** `FrontEnd/src/app/components/admin/admin-restaurant-management/`

Components created:
- `admin-restaurant-management.component.ts` - Component logic
- `admin-restaurant-management.component.html` - Template
- `admin-restaurant-management.component.scss` - Styles

#### Key Features:

**Data Display:**
- Table showing all restaurants globally
- Columns: Index, Name, Owner Name, Email, Address, Status, Created Date, Actions
- Pagination with configurable rows (5, 10, 20, 50)
- Responsive design for mobile/tablet

**Search Functionality:**
- Real-time search across restaurant name and owner name
- Case-insensitive matching
- Updates table instantly

**Status Management:**
- Toggle switch for each restaurant's active status
- Confirmation dialog before status change
- Color-coded status badges (green=active, red=inactive)

**Edit Dialog:**
- Modal form to edit restaurant details
- Fields: Name*, Address*, Description, Phone, Image URL
- Form validation (required fields marked with *)
- Save and Cancel buttons

**Actions:**
- Status toggle switch (with confirmation)
- Edit button (opens modal form)
- Delete button (soft delete with confirmation)

#### PrimeNG Modules Used:
- `TableModule` - Data table
- `DialogModule` - Edit modal
- `ButtonModule` - Buttons
- `InputTextModule` - Text inputs
- `InputTextareaModule` - Textarea
- `ToggleSwitchModule` - Status toggle
- `ConfirmDialogModule` - Confirmation dialogs
- `BadgeModule` - Status indicators
- `IconFieldModule` - Search icon
- `ToastModule` - Notifications

### 2. API Service Updates

**File:** `FrontEnd/src/app/services/api.service.ts`

Added PUT method to support full updates:
```typescript
put(table: string, id: string, data: object) {
  return this.http.put(`${this.server}/${table}/${id}`, data, this.tokenHeader());
}
```

### 3. Routes Configuration

**File:** `FrontEnd/src/app/app.routes.ts`

Added admin route:
```typescript
import { AdminRestaurantManagementComponent } from './components/admin/admin-restaurant-management/admin-restaurant-management.component';

// In routes array:
{
  path: "admin-restaurants",
  component: AdminRestaurantManagementComponent,
  canActivate: [adminGuard]
}
```

### 4. Navigation Header Update

**File:** `FrontEnd/src/app/components/system/header/header.component.ts`

Updated admin menu item to point to correct route:
```typescript
{
  label: 'Éttermek kezelése',
  routerLink: '/admin-restaurants'  // Updated from /restaurant-admin-management
}
```

---

## Security Implementation

### Backend Security:

1. **Authentication Check:**
   - All admin endpoints require valid JWT token
   - Token verified via `authenticate` middleware

2. **Role Authorization:**
   - All admin endpoints require `role === 'admin'`
   - Checked via `adminAuthorization` middleware

3. **Database Constraints:**
   - Foreign key constraint on `restaurants.owner_id`
   - Cascade delete on restaurant deletion

### Frontend Security:

1. **Route Guards:**
   - `adminGuard` prevents access to admin pages for non-admin users
   - Redirects to `/home` if user is not admin

2. **User Role Check:**
   - `AuthService.isAdmin()` verifies role at component level
   - Checks against JWT payload and server verification

---

## API Response Format

### Success Response (GET /admin/restaurants):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Restaurant Name",
      "description": "...",
      "address": "Address",
      "phone": "+36...",
      "image_url": "...",
      "is_active": true,
      "is_open": false,
      "opening_hours": [...],
      "images": [...],
      "createdAt": "2026-04-01T10:00:00.000Z",
      "updatedAt": "2026-04-01T10:00:00.000Z",
      "owner": {
        "id": "uuid",
        "name": "Owner Name",
        "email": "owner@example.com",
        "status": true
      }
    }
  ],
  "count": 1
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## Database Schema

### Relevant Tables:

**restaurants:**
- `id` (UUID, PK)
- `owner_id` (UUID, FK -> users.id)
- `name` (VARCHAR 100)
- `description` (TEXT, nullable)
- `address` (VARCHAR 255)
- `phone` (VARCHAR 20, nullable)
- `image_url` (VARCHAR 512, nullable)
- `is_active` (BOOLEAN, default: true)
- `is_open` (BOOLEAN, default: false)
- `opening_hours` (JSON)
- `images` (JSON)
- `createdAt` (DATETIME)
- `updatedAt` (DATETIME)

**users:**
- `id` (UUID, PK)
- `name` (VARCHAR 100)
- `email` (VARCHAR 100)
- `role` (VARCHAR 20) - 'admin', 'owner', 'user'
- `status` (BOOLEAN)

---

## Testing the Implementation

### Backend Testing (using REST client):

**1. Get All Restaurants:**
```
GET http://localhost:3000/admin/restaurants
Authorization: Bearer {JWT_TOKEN}
```

**2. Toggle Restaurant Status:**
```
PATCH http://localhost:3000/admin/restaurants/{RESTAURANT_ID}/toggle-status
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
{}
```

**3. Update Restaurant:**
```
PUT http://localhost:3000/admin/restaurants/{RESTAURANT_ID}
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "address": "New Address",
  "phone": "+36...",
  "image_url": "...",
  "is_active": true
}
```

### Frontend Testing:

1. Login with an admin account (role = 'admin')
2. Navigate to Admin > Éttermek kezelése
3. Verify all restaurants are displayed
4. Test search functionality
5. Test toggle switch (should prompt confirmation)
6. Click Edit button and update fields
7. Click Delete button (soft delete via toggle)

---

## UI/UX Features

### Design Consistency:
- Color scheme matches FlavorFleet branding (orange #ff6b35)
- Gradient backgrounds for visual hierarchy
- Consistent button styling and sizes

### Responsiveness:
- Desktop: Full table with all columns visible
- Tablet (≤ 768px): Adjusted padding and font sizes
- Mobile (≤ 480px): Compact layout with optimized buttons

### Accessibility:
- Aria labels on buttons
- Color-coded status (not just colors, also text labels)
- Keyboard navigation support
- Form validation messages

### User Feedback:
- Toast notifications for success/error/warning
- Confirmation dialogs for destructive actions
- Loading state indicator for table
- Empty state message when no restaurants found

---

## Future Enhancements

1. **Batch Operations:**
   - Select multiple restaurants
   - Bulk activate/deactivate
   - Bulk delete

2. **Advanced Filtering:**
   - Filter by active/inactive status
   - Filter by owner
   - Filter by date range

3. **Export Functionality:**
   - Export restaurant list as CSV/PDF
   - Include owner information

4. **Analytics:**
   - Charts showing restaurant statistics
   - Trends over time

5. **Restaurant Creation:**
   - Admin can create restaurants for owners
   - Assign owner during creation

---

## Troubleshooting

### Common Issues:

**1. "Access denied. Admin role required"**
- Verify JWT token is valid
- Check user role in database is 'admin'
- Clear browser cache and re-login

**2. Restaurant not showing in table**
- Verify restaurant exists in database
- Check `is_active` status filter
- Verify owner_id foreign key is valid

**3. Edit dialog not opening**
- Check browser console for errors
- Verify PrimeNG modules are imported correctly
- Check component template syntax

**4. Status toggle not working**
- Verify JWT token is still valid
- Check backend logs for authorization errors
- Verify network tab for failed requests

---

## File Summary

### Backend Files:
- `Backend/middleware/admin_middleware.js` - NEW
- `Backend/routes/admin-restaurant.routes.js` - NEW
- `Backend/config/app.js` - MODIFIED (route registration)

### Frontend Files:
- `FrontEnd/src/app/components/admin/admin-restaurant-management/` - NEW FOLDER
  - `admin-restaurant-management.component.ts` - NEW
  - `admin-restaurant-management.component.html` - NEW
  - `admin-restaurant-management.component.scss` - NEW
- `FrontEnd/src/app/services/api.service.ts` - MODIFIED (added PUT method)
- `FrontEnd/src/app/app.routes.ts` - MODIFIED (added route)
- `FrontEnd/src/app/components/system/header/header.component.ts` - MODIFIED (updated route)

---

## Conclusion

The Admin Restaurant Management feature provides a comprehensive interface for administrators to manage all restaurants in the FlavorFleet system. With proper security checks, user-friendly interface, and complete CRUD functionality, admins can efficiently oversee restaurant operations across the platform.
