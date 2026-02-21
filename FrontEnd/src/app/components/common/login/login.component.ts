import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  loading = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private msg: MessageService,
    private router: Router
  ) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.msg.show('error', 'Hiba', 'Kérjük töltsd ki az összes mezőt!');
      return;
    }

    this.loading = true;
    this.api.login('users', { email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.token) {
          this.auth.login(res.token, res.id);
          if (this.rememberMe) {
            this.auth.storeUser(res.token);
          }
          this.msg.show('success', 'Siker', 'Sikeres bejelentkezés!');
          this.router.navigate(['/home']);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.msg.show('error', 'Hiba', err.error?.message || 'Hibás e-mail vagy jelszó!');
      }
    });
  }
}
