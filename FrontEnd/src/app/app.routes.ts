import { Routes } from '@angular/router';
import { HomeComponent } from './components/common/home/home.component';
import { LoginComponent } from './components/common/login/login.component';
import { RegistrationComponent } from './components/common/registration/registration.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'home', component: HomeComponent},


  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
