# Admin Restaurant Management - Architecture Diagrams

Visual diagrams showing the system architecture and data flows.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLAVORFLEET SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐              ┌──────────────────┐              │
│  │   Browser   │              │  Angular 17 App  │              │
│  │  (Admin)    │◄────────────►│  (Frontend)      │              │
│  └─────────────┘              └──────────────────┘              │
│         │                             │                          │
│         │ HTTP/HTTPS                 │ HTTP Client              │
│         │                             │                          │
│         └─────────────┬───────────────┘                          │
│                       │                                           │
│                       ▼                                           │
│         ┌──────────────────────────────┐                        │
│         │   Express.js Backend         │                        │
│         │   (Node.js Server)           │                        │
│         └──────────────────────────────┘                        │
│                       │                                           │
│        ┌──────────────┼──────────────┐                           │
│        │              │              │                           │
│        ▼              ▼              ▼                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                  │
│  │   Auth   │  │  Admin   │  │   Standard   │                  │
│  │Middleware│  │Middleware│  │    Routes    │                  │
│  └──────────┘  └──────────┘  └──────────────┘                  │
│        │              │              │                           │
│        └──────────────┼──────────────┘                           │
│                       │                                           │
│                       ▼                                           │
│         ┌──────────────────────────────┐                        │
│         │     MySQL Database           │                        │
│         │  - users                     │                        │
│         │  - restaurants               │                        │
│         │  - restaurant_relations      │                        │
│         └──────────────────────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW WITH AUTH                        │
└──────────────────────────────────────────────────────────────────┘

Browser Request (with JWT in Authorization header)
           │
           ▼
    ┌─────────────────┐
    │ Express Router  │
    └────────┬────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ authenticate Middleware      │
    │                              │
    │ 1. Extract JWT from header   │
    │ 2. Verify JWT signature      │
    │ 3. Decode JWT               │
    │ 4. Extract user ID          │
    │ 5. Set req.user = {id}      │
    │                              │
    │ ✓ Valid? → Continue         │
    │ ✗ Invalid? → Return 401     │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ adminAuthorization           │
    │ Middleware                   │
    │                              │
    │ 1. Get user from database    │
    │ 2. Check user.role          │
    │                              │
    │ ✓ role === 'admin'?         │
    │   → Continue to handler     │
    │ ✗ role !== 'admin'?         │
    │   → Return 403 Forbidden    │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Route Handler                │
    │                              │
    │ - Execute logic             │
    │ - Query database            │
    │ - Return response           │
    └────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────────────────┐
    │ Send Response to Client      │
    │ - 200 with data             │
    │ - 403 forbidden error       │
    │ - 401 unauthorized error    │
    └──────────────────────────────┘
```

---

## 3. API Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────────┐
│           GET /admin/restaurants (with owner details)            │
└──────────────────────────────────────────────────────────────────┘

FRONTEND
────────
User Action
    │
    ▼
this.api.selectAll('admin/restaurants')
    │
    ▼
HttpClient.get('http://localhost:3000/admin/restaurants', {
  headers: {
    Authorization: 'Bearer eyJ...',
    Content-Type: 'application/json'
  }
})
    │
    ▼ (HTTP GET Request)

BACKEND
───────
Express Route: GET /admin/restaurants
    │
    ▼
Middleware Chain:
  [authenticate, adminAuthorization]
    │
    ▼
Sequelize Query:
    Restaurant.findAll({
      attributes: ['id', 'name', 'address', ...],
      include: [{
        model: User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'status']
      }],
      order: [['createdAt', 'DESC']]
    })
    │
    ▼
Database Query:
    SELECT r.id, r.name, r.address, ...,
           u.id, u.name, u.email, u.status
    FROM restaurants r
    JOIN users u ON r.owner_id = u.id
    ORDER BY r.createdAt DESC
    │
    ▼
Database
Returns:
  [{
    id: 'uuid-1',
    name: 'Restaurant 1',
    address: '123 Main St',
    ...,
    owner: {
      id: 'uuid-user',
      name: 'Owner Name',
      email: 'owner@email.com',
      status: true
    }
  }]
    │
    ▼
Response Handler:
    res.status(200).json({
      success: true,
      data: [restaurants...],
      count: 5
    })
    │
    ▼ (HTTP 200 Response)

FRONTEND
────────
Observable emits:
    {
      success: true,
      data: [...],
      count: 5
    }
    │
    ▼
Component receives in subscribe():
    next: (response) => {
      this.restaurants = response.data
      this.filteredRestaurants = [...this.restaurants]
      this.loading = false
    }
    │
    ▼
Update Component State
    │
    ▼
Angular Change Detection
    │
    ▼
Re-render Table with Data
    │
    ▼
User Sees Updated Table
```

---

## 4. Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│    AdminRestaurantManagementComponent                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ INPUTS (from route)                                      │   │
│  │ - None (global admin access)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ COMPONENT STATE                                          │   │
│  │ - restaurants: RestaurantWithOwner[]                     │   │
│  │ - filteredRestaurants: RestaurantWithOwner[]            │   │
│  │ - loading: boolean                                       │   │
│  │ - editDialogVisible: boolean                             │   │
│  │ - selectedRestaurant: RestaurantWithOwner | null        │   │
│  │ - searchValue: string                                    │   │
│  │ - editForm: FormGroup                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                           │
│        ┌──────────────┼──────────────┐                           │
│        │              │              │                           │
│        ▼              ▼              ▼                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                  │
│  │   Load   │  │  Search  │  │   Edit/     │                  │
│  │Restaurants│  │ Function │  │ Update Ops  │                  │
│  └──────────┘  └──────────┘  └──────────────┘                  │
│        │              │              │                           │
│        └──────────────┼──────────────┘                           │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SERVICES (Injected)                                      │   │
│  │ - ApiService (HTTP calls)                                │   │
│  │ - MessageService (Toast notifications)                  │   │
│  │ - ConfirmationService (Confirmation dialogs)            │   │
│  │ - FormBuilder (Form creation)                           │   │
│  │ - AuthService (User verification)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                       │                                           │
│                       ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ OUTPUTS (to template)                                    │   │
│  │ - Rendered HTML/table                                    │   │
│  │ - Modal dialogs                                          │   │
│  │ - Toast messages                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 5. User Interaction Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                                 │
└──────────────────────────────────────────────────────────────────┘

LOGIN
┌────────┐
│ Login  │
│ Page   │
└───┬────┘
    │ Credentials
    ▼
┌──────────────────────┐
│ Admin Logged In      │
│ JWT Token Generated  │
└───┬──────────────────┘
    │ Click Menu
    ▼
┌──────────────────────┐     ┌───────────────────────┐
│ Header Menu          │     │ Route: /admin-        │
│ - Kezelőpult ▼       │────►│ restaurants           │
│   - Éttermek kezelése│     │                       │
└──────────────────────┘     └───┬───────────────────┘
                                 │ adminGuard?
                                 ▼
                        ┌────────────────────┐
                        │ Admin Restaurant   │
                        │ Management Page    │
                        └────┬───────────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          ┌─────────┐  ┌──────────┐ ┌──────────┐
          │  Search │  │   View   │ │  Edit   │
          │Restaurants│ │  Details │ │ Details │
          └─────────┘  └──────────┘ └──────────┘
                │            │            │
                ▼            ▼            ▼
            Filter      Toggle Status   Click Edit
            Results       (with confirm)  Button
                │            │            │
                ▼            ▼            ▼
            Updated    Status Changed   Modal Opens
            Table      Toast Shown      Form Pre-filled
                                            │
                                            ▼
                                       User Modifies
                                       Form Fields
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        ▼                   ▼                   ▼
                    Click Save          Click Cancel         Click Delete
                        │                   │                   │
                        ▼                   ▼                   ▼
                    Validate             Close Modal      Confirmation
                    Form                 No Changes       Dialog
                        │                   │                   │
                        ▼                   ▼                   ▼
                    API Call            Return to        User Confirms
                    (PUT)               Table                 │
                        │                   │                   ▼
                        ▼                   ▼               API Call
                    Update DB            Table View        (DELETE)
                        │                   │                   │
                        ▼                   ▼                   ▼
                    Success             Display          Soft Delete
                    Toast                                     │
                        │                                     ▼
                        ▼                                 Success
                    Modal Close                          Toast
                        │
                        ▼
                    Table Updates
                    with New Data
```

---

## 6. Database Schema & Relationships

```
┌──────────────────────────┐
│         USERS            │
├──────────────────────────┤
│ id (UUID, PK)            │
│ name                     │
│ email                    │
│ password (hashed)        │
│ role (admin/owner/user)  │
│ status (active/inactive) │
│ lastLoginAt              │
│ createdAt, updatedAt     │
└────────────┬─────────────┘
             │
             │ Foreign Key
             │ 1:N
             │
             ▼
┌──────────────────────────┐
│      RESTAURANTS         │
├──────────────────────────┤
│ id (UUID, PK)            │
│ owner_id (UUID, FK)──┐   │
│ name                 │   │
│ description         │   │
│ address             │   │
│ phone               │   │
│ image_url           │   │
│ is_active (boolean) │   │
│ is_open (boolean)   │   │
│ opening_hours (JSON)│   │
│ images (JSON)       │   │
│ createdAt, updatedAt│   │
└─────────────────────┘   │
                          │
      ┌───────────────────┘
      │
      ▼
 Points to USERS table

QUERY FOR ADMIN RESTAURANTS:
SELECT r.*, u.name, u.email
FROM restaurants r
INNER JOIN users u ON r.owner_id = u.id
WHERE u.role = 'admin' (or not, to see all)
ORDER BY r.createdAt DESC
```

---

## 7. Frontend Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│  AdminRestaurantManagementComponent                     │
└─────────────────────────────────────────────────────────┘
    │
    ├─► Angular Core
    │   ├─ @angular/core (Component, OnInit)
    │   ├─ @angular/common (CommonModule)
    │   └─ @angular/forms (FormGroup, Validators, etc.)
    │
    ├─► PrimeNG Components
    │   ├─ table (DataTable)
    │   ├─ dialog (Modal dialogs)
    │   ├─ button (Action buttons)
    │   ├─ inputtext (Text inputs)
    │   ├─ inputtextarea (Text areas)
    │   ├─ toggleswitch (Status toggle)
    │   ├─ confirmdialog (Confirmation)
    │   ├─ badge (Status indicator)
    │   ├─ toast (Notifications)
    │   ├─ iconfield (Search field)
    │   └─ card, divider (Layout)
    │
    ├─► Custom Services
    │   ├─ ApiService (HTTP calls)
    │   ├─ AuthService (Auth check)
    │   └─ MessageService (Notifications)
    │
    └─► Interfaces
        └─ Restaurant (Type safety)
```

---

## 8. Middleware Stack Architecture

```
┌────────────────────────────────────────────────────┐
│              MIDDLEWARE PIPELINE                   │
└────────────────────────────────────────────────────┘

Incoming Request
    │
    ▼
┌─────────────────────────┐
│ Global Middleware       │
│ - cors()                │
│ - express.json()        │
│ - express.static()      │
└────────┬────────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │ Route: /admin/restaurants           │
    │                                     │
    │ [authenticate, adminAuthorization]  │
    │          │                │         │
    │          │                │         │
    │          ▼                ▼         │
    │     ┌────────────┐  ┌────────────┐ │
    │     │ Middleware │  │ Middleware │ │
    │     │    #1      │  │    #2      │ │
    │     │            │  │            │ │
    │     │ Check JWT  │  │ Check Role │ │
    │     │ Valid?     │  │ = 'admin'? │ │
    │     │            │  │            │ │
    │     └────┬───────┘  └─────┬──────┘ │
    │          │                │        │
    │          Yes               Yes     │
    │          │                │        │
    │          ▼                ▼        │
    │     ┌─────────────────────────┐   │
    │     │   Route Handler         │   │
    │     │                         │   │
    │     │ async (req, res) => {   │   │
    │     │   const restaurants =   │   │
    │     │     await Restaurant    │   │
    │     │       .findAll({...})   │   │
    │     │   return res.json(...)  │   │
    │     │ }                       │   │
    │     └──────────┬──────────────┘   │
    │                │                   │
    └────────────────┼───────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │ Response         │
            │ - 200 OK        │
            │ - 401 Forbidden │
            │ - 403 Forbidden │
            │ - 500 Error     │
            └──────────────────┘
```

---

## 9. State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│           ANGULAR CHANGE DETECTION & STATE                   │
└──────────────────────────────────────────────────────────────┘

Initial State
┌─────────────────────────────────┐
│ restaurants: []                 │
│ filteredRestaurants: []         │
│ loading: true                   │
│ editDialogVisible: false        │
│ selectedRestaurant: null        │
│ searchValue: ''                 │
└─────────────────────────────────┘
    │
    ▼
Component Init
ngOnInit() → loadRestaurants()
    │
    ▼
API Call in Flight
┌─────────────────────────────────┐
│ loading: true                   │
│ restaurants: []                 │
└─────────────────────────────────┘
    │
    ▼
API Response Received
    │
    ▼
State Updated
┌─────────────────────────────────┐
│ loading: false                  │
│ restaurants: [100 items]        │
│ filteredRestaurants: [100 items]│
└─────────────────────────────────┘
    │
    ▼
Change Detection Triggers
    │
    ▼
Template Re-renders
- Table shows restaurants
- Loading spinner removed
    │
    ▼
User Types in Search
searchValue = "Central"
    │
    ▼
onSearchChange() executes
    │
    ▼
State Updated
┌─────────────────────────────────┐
│ searchValue: "Central"          │
│ filteredRestaurants: [5 items]  │
└─────────────────────────────────┘
    │
    ▼
Change Detection Triggers
    │
    ▼
Table Re-renders with Filtered Data
    │
    ▼
User Clicks Edit
    │
    ▼
State Updated
┌─────────────────────────────────┐
│ selectedRestaurant: {...}       │
│ editDialogVisible: true         │
│ editForm: {pre-filled}          │
└─────────────────────────────────┘
    │
    ▼
Change Detection Triggers
    │
    ▼
Modal Dialog Shows
Form displays with data
    │
    ▼
User Saves Changes
    │
    ▼
API Call (PUT request)
    │
    ▼
State Updated
┌─────────────────────────────────┐
│ restaurants: [updated item]     │
│ filteredRestaurants: [updated]  │
│ editDialogVisible: false        │
│ selectedRestaurant: null        │
└─────────────────────────────────┘
    │
    ▼
Change Detection Triggers
    │
    ▼
Table Updates Automatically
Modal Closes
Toast Shows Success
```

---

## 10. Security Layers Visualization

```
┌──────────────────────────────────────────────────┐
│           SECURITY LAYERING                      │
└──────────────────────────────────────────────────┘

LAYER 1: Frontend Route Guard
┌────────────────────────────────┐
│ Route: /admin-restaurants      │
│ Guard: adminGuard              │
│                                │
│ Is User Admin?                 │
│ - No → Redirect to /home       │
│ - Yes → Allow navigation       │
└────────────────────────────────┘
         │
         ▼
LAYER 2: Frontend Component
┌────────────────────────────────┐
│ Component Loads                │
│                                │
│ Check isLoggedUser()?          │
│ - No → Navigate to login       │
│ - Yes → Continue               │
└────────────────────────────────┘
         │
         ▼
LAYER 3: HTTP Request
┌────────────────────────────────┐
│ HTTP Header:                   │
│ Authorization: Bearer JWT      │
│                                │
│ Include token in every request │
│ Sent via HTTPS (TLS)          │
└────────────────────────────────┘
         │
         ▼
LAYER 4: Backend JWT Verification
┌────────────────────────────────┐
│ authenticate Middleware        │
│                                │
│ Verify JWT signature           │
│ Check token expiration         │
│ Extract user ID               │
│                                │
│ Invalid?                       │
│ - Return 401 Unauthorized      │
│ Valid?                         │
│ - Continue to next middleware  │
└────────────────────────────────┘
         │
         ▼
LAYER 5: Role Authorization
┌────────────────────────────────┐
│ adminAuthorization Middleware  │
│                                │
│ Query: SELECT role FROM users  │
│ Check: role === 'admin'       │
│                                │
│ Not Admin?                     │
│ - Return 403 Forbidden         │
│ Is Admin?                      │
│ - Continue to route handler    │
└────────────────────────────────┘
         │
         ▼
LAYER 6: Database Query
┌────────────────────────────────┐
│ Execute Handler Logic          │
│                                │
│ Query Database                 │
│ Filter by admin permissions    │
│ (show all, not filtered)      │
└────────────────────────────────┘
         │
         ▼
LAYER 7: Response
┌────────────────────────────────┐
│ Send Response                  │
│ - 200 OK with data            │
│ - 401 for no/invalid token    │
│ - 403 for non-admin           │
│ - 500 for server errors       │
│                                │
│ HTTPS Encryption               │
└────────────────────────────────┘
```

---

These diagrams show how the Admin Restaurant Management system is architected and how data flows through the application at multiple levels! 🎯
