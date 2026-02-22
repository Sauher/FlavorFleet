import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/system/header/header.component';
import { FooterComponent } from './components/system/footer/footer.component';
import { MessageComponent } from './components/system/message/message.component';
import { AuthService } from './services/auth.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MessageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  app_title = 'FlavorFleet';
  private subscription: Subscription | null = null;

  constructor(
    private auth: AuthService,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    await this.applyRoleTheme();

    this.subscription = this.auth.isLoggedIn$.subscribe(async () => {
      await this.applyRoleTheme();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private async applyRoleTheme() {
    const user = this.auth.loggedUser();
    if (!user) {
      this.themeService.applyTheme('user');
      return;
    }

    if (await this.auth.isAdmin()) {
      this.themeService.applyTheme('admin');
    } else if (await this.auth.isOwner()) {
      this.themeService.applyTheme('owner');
    } else {
      this.themeService.applyTheme('user');
    }
  }
}
