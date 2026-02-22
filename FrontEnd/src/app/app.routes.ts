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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'restaurants', component: RestaurantsComponent},
  { path: 'orders', component: OrdersComponent},
  { path: 'menu-management', component: MenuManagementComponent},
  { path: 'order-management', component: OrderManagementComponent},
  { path: 'restaurant-management', component: RestaurantManagementComponent},




  { path: '', redirectTo: '/home', pathMatch: 'full' }
];
