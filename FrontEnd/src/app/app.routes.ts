import { Routes } from '@angular/router';
import { HomeComponent } from './components/common/home/home.component';
import { LoginComponent } from './components/common/login/login.component';
import { RegistrationComponent } from './components/common/registration/registration.component';
import { ProfileComponent } from './components/common/profile/profile/profile.component';
import { RestaurantsComponent } from './components/common/restaurants/restaurants/restaurants.component';
import { OrdersComponent } from './components/common/orders/orders/orders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'restaurants', component: RestaurantsComponent},
  { path: 'orders', component: OrdersComponent},




  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
