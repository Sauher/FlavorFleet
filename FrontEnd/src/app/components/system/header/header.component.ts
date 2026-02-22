import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, BadgeModule, AvatarModule, InputTextModule, Ripple, CommonModule, ButtonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  @Input() title: string = '';
constructor(
    private auth: AuthService,
    private msg: MessageService,
    private router: Router,
  ) { }
  items: MenuItem[] = [];
  isLoggedIn: boolean = true;
  isOwner: boolean = false;
  isAdmin: boolean = false;
  private subscription: Subscription | null = null;

  async ngOnInit() {
    // Initial check and build
    await this.checkAuthStatus();
    this.buildMenuItems();

    // Subscribe to login status changes
    this.subscription = this.auth.isLoggedIn$.subscribe(async (loggedIn) => {
      await this.checkAuthStatus();
      this.buildMenuItems();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

   async checkAuthStatus() {
    this.isLoggedIn = this.auth.isLoggedUser();
    if (this.isLoggedIn) {
    this.isAdmin = await this.auth.isAdmin();
    this.isOwner = await this.auth.isOwner(); 
    }
  }

  buildMenuItems() {
    const menuItems: MenuItem[] = [];

    // Logged out items
    if (!this.isLoggedIn) {
      menuItems.push(
        {
          label: 'Éttermek',
          routerLink: '/restaurants'
        }
      );
    }
    if (this.isLoggedIn) {
      menuItems.push(
        {
          label: 'Éttermek',
          routerLink: '/restaurants'
        },
        {
          label: 'Rendeléseim',
          routerLink: '/orders'
        },
        {
          label: 'Profilom',
          routerLink: '/profile'
        }
      );

      if (this.isOwner) {
        menuItems.push(
          {
            label: 'Kezelőpult',
            items: [
              {
                label: 'Étterem kezelése',
                routerLink: '/restaurant-management'
              },
              {
                label: 'Menü kezelése',
                routerLink: '/menu-management'
              },
              {
                label: 'Beérkezett rendelések',
                routerLink: '/order-management'
              }
            ]
          }
        );
      }

      // Admin only items
      if (this.isAdmin) {
        menuItems.push(
           {
            label: 'Kezelőpult',
            items: [
              {
                label: 'Felhasználók kezelése',
                routerLink: '/user-management'
              },
              {
                label: 'Éttermek kezelése',
                routerLink: '/restaurant-admin-management'
              },
              {
                label: 'Rendelések kezelése',
                routerLink: '/order-admin-management'
              }
            ]
          }
        );
      }
    }

    // Mobile-only auth items (visible in hamburger menu)
    menuItems.push({ separator: true, styleClass: 'mobile-only-separator' });
    if (!this.isLoggedIn) {
      menuItems.push(
        {
          label: 'Bejelentkezés',
          routerLink: '/login',
          styleClass: 'mobile-only-item'
        },
        {
          label: 'Regisztráció',
          routerLink: '/register',
          styleClass: 'mobile-only-item'
        }
      );
    } else {
      menuItems.push(
        {
          label: 'Kijelentkezés',
          styleClass: 'mobile-only-item',
          command: () => this.onLogout()
        }
      );
    }

    this.items = menuItems;
  }

  onLogout() {
    this.auth.logout();
    this.msg.show('success', 'Siker', 'Sikeres kijelentkezés!');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}