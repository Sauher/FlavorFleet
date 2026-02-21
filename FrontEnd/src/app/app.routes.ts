import { Routes } from '@angular/router';
import { LoginComponent } from './components/common/login/login.component';
import { HomeComponent } from './components/common/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent},


  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
