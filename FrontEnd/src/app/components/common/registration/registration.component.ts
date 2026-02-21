import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../services/api.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    ButtonModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  loading = false;

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private router: Router
  ) {}

  onRegister() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.msg.show('error', 'Hiba', 'Kérjük töltsd ki az összes mezőt!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.msg.show('error', 'Hiba', 'A két jelszó nem egyezik!');
      return;
    }

    if (this.password.length < 6) {
      this.msg.show('error', 'Hiba', 'A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(this.email)) {
      this.msg.show('error', 'Hiba', 'Kérjük érvényes email címet adj meg!');
      return;
    }
    

    if (!this.acceptTerms) {
      this.msg.show('error', 'Hiba', 'El kell fogadnod az Általános Szerződési Feltételeket!');
      return;
    }

    this.loading = true;
    this.api.registration('users', {
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.msg.show('success', 'Siker', 'Sikeres regisztráció! Most már bejelentkezhetsz.');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.msg.show('error', 'Hiba', err.error?.message || 'Hiba történt a regisztráció során!');
      }
    });
  }
}
