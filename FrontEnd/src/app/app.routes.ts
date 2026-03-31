import { Routes } from '@angular/router';
import { HomeComponent } from './components/common/home/home.component';
import { LoginComponent } from './components/common/login/login.component';
import { RegistrationComponent } from './components/common/registration/registration.component';
import { ProfileComponent } from './components/common/profile/profile/profile.component';
import { RestaurantsComponent } from './components/common/restaurants/restaurants/restaurants.component';
import { OrdersComponent } from './components/common/orders/orders/orders.component';
import { MenuManagementComponent } from './components/owner/menu-management/menu-management.component';
import { OrderManagementComponent } from './components/owner/order-management/order-management.component';
import { RestaurantManagementComponent } from './components/owner/restaurant-management/restaurant-management.component';
import { UserControlComponent } from './components/admin/user-control/user-control.component';
import { adminGuard } from './guards/admin.guard';
import { ownerGuard } from './guards/owner.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  //Common Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'restaurants', component: RestaurantsComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },

  // Owner routes
  { path: 'menu-management', component: MenuManagementComponent, canActivate: [ownerGuard] },
  { path: 'order-management', component: OrderManagementComponent, canActivate: [ownerGuard] },
  { path: 'restaurant-management/:id', component: RestaurantManagementComponent, canActivate: [ownerGuard] },
  { path: 'restaurant-management', component: RestaurantManagementComponent, canActivate: [ownerGuard] },

  //Admin routes

  {path: "user-control", component: UserControlComponent, canActivate: [adminGuard]},

  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
