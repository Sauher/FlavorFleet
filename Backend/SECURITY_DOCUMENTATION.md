# Restaurant Management Module - Security Implementation Guide

## Overview

This document provides a complete overview of the security architecture implemented for the Restaurant Management module in the FlavorFleet application. The system uses JWT-based authentication, role-based access control, and database-level constraints to prevent unauthorized access.

---

## 1. Database Schema

### 1.1 Restaurants Table

```sql
CREATE TABLE IF NOT EXISTS restaurants (
  id CHAR(36) NOT NULL PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  address VARCHAR(255) NOT NULL,
  image_url VARCHAR(512) NULL,
  phone VARCHAR(20) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_open TINYINT(1) NOT NULL DEFAULT 0,
  opening_hours JSON NOT NULL,
  images JSON NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  CONSTRAINT fk_restaurants_owner_id 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Key Fields:**
- `owner_id`: Foreign key linking to the `users` table. **Database-level CASCADE delete** ensures that when a user is deleted, all their restaurants are removed.
- `opening_hours`: JSON field storing opening hours for each day (0-6 = Sunday-Saturday)
- `images`: JSON array storing up to 2 image paths

### 1.2 Menu Items Table

```sql
CREATE TABLE IF NOT EXISTS menu_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  restaurant_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  price INT NOT NULL,
  is_available TINYINT(1) NOT NULL DEFAULT 1,
  imageURL VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
```

**Key Features:**
- `restaurant_id`: Foreign key with CASCADE delete
- Index on `restaurant_id` for optimized queries

---

## 2. Model Relationships & Associations

### 2.1 User Model

```javascript
User.associate = (models) => {
  User.hasMany(models.Restaurant, {
    foreignKey: 'owner_id',
    as: 'restaurants',
    onDelete: 'CASCADE'
  });
};
```

**Association:** A User can have many Restaurants.

### 2.2 Restaurant Model

```javascript
Restaurant.associate = (models) => {
  // Belongs to User (one owner)
  Restaurant.belongsTo(models.User, {
    foreignKey: 'owner_id',
    as: 'owner'
  });
  
  // Has many Menu Items
  Restaurant.hasMany(models.MenuItem, {
    foreignKey: 'restaurant_id',
    as: 'menuItems',
    onDelete: 'CASCADE'
  });
};
```

**Associations:**
- `belongsTo(User)` - Each restaurant belongs to exactly one owner
- `hasMany(MenuItem)` - Each restaurant can have many menu items

### 2.3 MenuItem Model

```javascript
MenuItem.associate = (models) => {
  MenuItem.belongsTo(models.Restaurant, {
    foreignKey: 'restaurant_id',
    as: 'restaurant'
  });
};
```

**Association:** Each menu item belongs to one restaurant.

---

## 3. Authentication & Authorization

### 3.1 JWT Authentication Middleware

**Location:** `Backend/middleware/auth_middleware.js`

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = verifyToken(token);
    req.user = decoded;  // Contains { id, exp, iat }
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}
```

**Features:**
- Expects Bearer token in `Authorization` header
- Decodes JWT and extracts `user.id`
- Returns 401 (Unauthorized) if token is missing or invalid
- Token contains user ID (no other user data to prevent token bloat)

### 3.2 Restaurant Ownership Verification Helper

**Location:** `Backend/routes/restaurant.routes.js`

Used in all restaurant routes that modify data:

```javascript
// Example from PATCH /:id route
if (restaurant.owner_id !== req.user.id) {
  return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt az éttermet" });
}
```

**Authorization Checks:**
- ✅ `GET /owner/mine` - Filters database query to only authenticated user's restaurants
- ✅ `GET /owner/:id` - Verifies `restaurant.owner_id === req.user.id` before returning
- ✅ `POST /` - Securely sets `owner_id` from `req.user.id` (NOT from client)
- ✅ `PATCH /:id` - Returns **403 Forbidden** if user doesn't own restaurant
- ✅ `DELETE /:id` - Returns **403 Forbidden** if user doesn't own restaurant
- ✅ `POST /:id/images` - Verifies ownership before image upload

### 3.3 Menu Item Authorization (NEW)

**Location:** `Backend/routes/menu-item.routes.js`

Two authorization middleware functions:

#### A. verifyRestaurantOwnership (for PATCH, DELETE, PATCH toggle-availability)

```javascript
async function verifyRestaurantOwnership(req, res, next) {
  try {
    const menuItem = await MenuItem.findByPk(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ error: "Nem található ilyen étel" });
    }

    const restaurant = await Restaurant.findByPk(menuItem.restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: "Nem található az étterem" });
    }

    // CRITICAL: Verify ownership via the restaurant
    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Nincs jogosultságod módosítani ezt az ételt" });
    }

    req.restaurant = restaurant;
    req.menuItem = menuItem;
    next();
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült ellenőrizni a jogosultságot" });
  }
}
```

#### B. verifyCreatePermission (for POST)

```javascript
async function verifyCreatePermission(req, res, next) {
  try {
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ error: "Restaurant ID szükséges" });
    }

    const restaurant = await Restaurant.findByPk(restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ error: "Nem található az étterem" });
    }

    // CRITICAL: Verify user owns the restaurant before allowing menu item creation
    if (restaurant.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Nincs jogosultságod ételt hozzáadni ehhez az étteremhez" });
    }

    req.restaurant = restaurant;
    next();
  } catch (error) {
    res.status(500).json({ error: "Nem sikerült ellenőrizni a jogosultságot" });
  }
}
```

**Authorization Checks Applied:**
- ✅ `POST /` - Verifies user owns the restaurant via `verifyCreatePermission`
- ✅ `PATCH /:id` - Verifies ownership via `verifyRestaurantOwnership` (returns 403 if not owner)
- ✅ `DELETE /:id` - Verifies ownership via `verifyRestaurantOwnership` (returns 403 if not owner)
- ✅ `PATCH /:id/toggle-availability` - Verifies ownership via `verifyRestaurantOwnership` (returns 403 if not owner)

---

## 4. API Endpoints with Security

### 4.1 Restaurant Routes

| Method | Endpoint | Auth | Authorization | Response |
|--------|----------|------|---------------|----------|
| GET | `/restaurants` | ❌ | - | All public restaurants |
| GET | `/restaurants/owner/mine` | ✅ Bearer | Authenticated user only | User's restaurants only |
| GET | `/restaurants/owner/:id` | ✅ Bearer | Ownership check | 404 if not owner, 403 if different user |
| GET | `/restaurants/:id` | ❌ | - | Public restaurant by ID |
| POST | `/restaurants` | ✅ Bearer | - | Creates with `owner_id = req.user.id` |
| PATCH | `/restaurants/:id` | ✅ Bearer | Owner check | 403 Forbidden if not owner |
| DELETE | `/restaurants/:id` | ✅ Bearer | Owner check | 403 Forbidden if not owner |
| POST | `/restaurants/:id/images` | ✅ Bearer | Owner check | 403 Forbidden if not owner |

### 4.2 Menu Item Routes

| Method | Endpoint | Auth | Authorization | Response |
|--------|----------|------|---------------|----------|
| GET | `/menuitems` | ❌ | - | All public menu items |
| GET | `/menuitems/restaurant/:restaurantId` | ✅ Bearer | - | Menu items for restaurant |
| GET | `/menuitems/:id` | ❌ | - | Public menu item by ID |
| POST | `/menuitems` | ✅ Bearer | Owner check (via restaurant) | 403 if user doesn't own restaurant |
| PATCH | `/menuitems/:id` | ✅ Bearer | Owner check (via restaurant) | 403 if user doesn't own restaurant |
| DELETE | `/menuitems/:id` | ✅ Bearer | Owner check (via restaurant) | 403 if user doesn't own restaurant |
| PATCH | `/menuitems/:id/toggle-availability` | ✅ Bearer | Owner check (via restaurant) | 403 if user doesn't own restaurant |

---

## 5. Security Features Implemented

### 5.1 Secure Restaurant Creation

**Vulnerable Approach (❌ NOT USED):**
```javascript
// DON'T DO THIS - User could spoof owner_id
const newRestaurant = await Restaurant.create({
  owner_id: req.body.owner_id,  // ❌ User-provided
  name: req.body.name,
  address: req.body.address
});
```

**Secure Implementation (✅ USED):**
```javascript
// ✅ Correct - owner_id extracted from JWT token
const newRestaurant = await Restaurant.create({
  owner_id: req.user.id,  // From authentication token, not user input
  name: validateCreatePayload(req.body).name,
  address: validateCreatePayload(req.body).address
});
```

### 5.2 Owner-Only Data Filtering

**Before Authorization (Vulnerable Flow):**
1. User A requests `/restaurants/owner/mine`
2. Backend returns ALL restaurants from database

**After Authorization (Secure Flow):**
```javascript
router.get("/owner/mine", authenticate, async (req, res) => {
  const restaurants = await Restaurant.findAll({
    where: { owner_id: req.user.id },  // ✅ Filtered by authenticated user
    order: [["createdAt", "DESC"]]
  });
  return res.json(restaurants);
});
```

### 5.3 RBAC-Style Check (Owner Check)

When a user tries to access a specific restaurant or modify it:

```javascript
// Step 1: Fetch the resource
const restaurant = await Restaurant.findByPk(restaurantId);

// Step 2: Verify ownership
if (restaurant.owner_id !== req.user.id) {
  return res.status(403).json({ error: "Forbidden" });
}

// Step 3: Proceed with operation
await restaurant.update(updatedData);
```

**Status Codes Used:**
- `401 Unauthorized` - No token or invalid token
- `403 Forbidden` - User is authenticated but NOT authorized for this resource
- `404 Not Found` - Resource doesn't exist OR user doesn't have permission to see it

### 5.4 Transitive Authorization (Menu Items)

Menu items are indirectly owned via their restaurant:

```javascript
// Menu item belongs to restaurant
// Restaurant belongs to authenticated user
// Therefore: User can only modify menu items in their restaurants

const menuItem = await MenuItem.findByPk(menuItemId);
const restaurant = await Restaurant.findByPk(menuItem.restaurant_id);

if (restaurant.owner_id !== req.user.id) {
  return res.status(403).json({ error: "Forbidden" });
}
```

---

## 6. Data Flow Examples

### 6.1 Secure Creation Flow (Example)

**Frontend Request:**
```javascript
// User submits restaurant creation form
const response = await fetch('http://localhost:3000/restaurants', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Pizza Palace',
    address: '123 Main St',
    description: 'Best pizza in town'
    // NOTE: No owner_id sent - it's derived from token
  })
});
```

**Backend Processing:**
1. ✅ Middleware extracts `user.id` from token → `req.user.id = "uuid-of-user-a"`
2. ✅ Route handler validates input: name & address required
3. ✅ Create restaurant with database-generated UUID and `owner_id = req.user.id`
4. ✅ Return created restaurant (201 Created)

**Database Result:**
```sql
INSERT INTO restaurants (id, owner_id, name, address, description, ...)
VALUES ('uuid-123', 'user-a-uuid', 'Pizza Palace', '123 Main St', 'Best pizza in town', ...);
```

### 6.2 Secure Update Flow (Example)

**Frontend Request:**
```javascript
// User tries to update a restaurant
const response = await fetch('http://localhost:3000/restaurants/uuid-restaurant-123', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    description: 'Updated description'
  })
});
```

**Backend Processing:**
1. ✅ Middleware extracts `user.id` from token
2. ✅ Route fetches restaurant by ID from database
3. ✅ **AUTHORIZATION CHECK**: Compare `restaurant.owner_id` with `req.user.id`
   - If User A treats to update a restaurant owned by User B: **403 Forbidden**
   - If User A tries to update their own restaurant: **Proceed**
4. ✅ Update fields and return updated restaurant (200 OK)

**Authorization Scenarios:**
| User | Restaurant Owner | Result |
|------|------------------|--------|
| User A | User A | ✅ 200 OK - Update succeeds |
| User A | User B | ❌ 403 Forbidden - Access denied |
| Anonymous | User A | ❌ 401 Unauthorized - No token |

---

## 7. Migration Files

### 7.1 Add Foreign Key Constraint

**File:** `Backend/migrations/20260331_add_fk_restaurants_owner_id.sql`

```sql
ALTER TABLE restaurants
ADD CONSTRAINT fk_restaurants_owner_id
FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;
```

**Purpose:**
- Ensures `restaurants.owner_id` always points to valid `users.id`
- Prevents orphaned restaurant records
- Automatic cleanup when a user is deleted

---

## 8. Testing Security

### 8.1 Test: Unauthorized Restaurant Access

```bash
# Test 1: Try to access another user's restaurant
GET /restaurants/owner/other-user-restaurant-id
Authorization: Bearer <user-a-token>

# Expected: 404 Not Found or filtered out
# Why: Query filters by owner_id from token
```

### 8.2 Test: Unauthorized Menu Item Modification

```bash
# Test 2: Try to add menu item to another user's restaurant
POST /menuitems
Authorization: Bearer <user-a-token>
Body: { restaurant_id: "user-b-restaurant", name: "Hacked Item", price: 1 }

# Expected: 403 Forbidden
# Why: verifyCreatePermission checks restaurant.owner_id !== req.user.id
```

### 8.3 Test: Unauthorized Direct URL Access

```bash
# Test 3: Try to edit restaurant via direct URL (XSS/manipulation attempt)
PATCH /restaurants/99
Authorization: Bearer <user-b-token>
Body: { description: "Hacked!" }

# Expected: 403 Forbidden (if restaurant exists and owned by other user)
# Or: 404 Not Found (if restaurant doesn't exist)
```

---

## 9. Summary of Security Controls

| Control | Implementation | Benefit |
|---------|---|---|
| JWT tokens | Bearer token in `Authorization` header | Stateless authentication |
| User ID extraction | `req.user.id` from decoded token | Prevent ID spoofing |
| Ownership verification | Check `resource.owner_id === req.user.id` | Prevent unauthorized access |
| Database constraints | Foreign key with cascade delete | Referential integrity |
| Data filtering | WHERE owner_id = ? in queries | Only return authorized data |
| Authorization middleware | verifyRestaurantOwnership, verifyCreatePermission | Centralized access control |
| HTTP status codes | 401, 403, 404 | Semantic security responses |

---

## 10. Deployment Checklist

- [x] Model associations defined (User ↔ Restaurant ↔ MenuItem)
- [x] Authorization middleware implemented for menu items
- [x] Restaurant routes verify ownership (403 Forbidden on mismatch)
- [x] owner_id is server-set from JWT token (no client input)
- [x] Foreign key constraints added (migration file created)
- [x] Data filtering applied (GET /owner/mine)
- [x] Error handling with appropriate HTTP status codes
- [ ] Backend database: Run migration to add FK constraint
- [ ] Frontend: Ensure to store & send JWT token in Authorization header
- [ ] Testing: Verify security controls with multi-user scenarios

---

## 11. Frontend Integration

### 11.1 Storing and Sending JWT Tokens

**Angular Auth Service Example:**
```typescript
// Login stores token
login(credentials) {
  return this.http.post('/users/login', credentials).pipe(
    tap(response => {
      localStorage.setItem('token', response.token);  // Store securely
    })
  );
}

// API service adds token to all requests
constructor(private http: HttpClient) {}

private getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

createRestaurant(data) {
  return this.http.post('/restaurants', data, {
    headers: this.getHeaders()
  });
}
```

### 11.2 Handling 403 Responses

```typescript
// Handle authorization errors
this.restaurantService.updateRestaurant(id, data).subscribe(
  success => console.log('Updated'),
  error => {
    if (error.status === 403) {
      this.messageService.show('error', 'Hozzáférés szükséges', 'Nem tudod módosítani ezt az éttermet');
    } else if (error.status === 401) {
      // Redirect to login
      this.router.navigate(['/login']);
    }
  }
);
```

---

## Questions & Support

For questions about security implementation:
1. Review authentication flow in `Backend/middleware/auth_middleware.js`
2. Check authorization checks in route files (`restaurant.routes.js`, `menu-item.routes.js`)
3. Verify associations in model files (`User`, `Restaurant`, `MenuItem`)
4. Run migrations to ensure database constraints are in place
