import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/system/header/header.component';
import { FooterComponent } from './components/system/footer/footer.component';
import { MessageComponent } from './components/system/message/message.component';
import { HomeComponent } from "./components/common/home/home.component";
import { ProfileComponent } from './components/common/profile/profile/profile.component';
import { OrdersComponent } from './components/common/orders/orders/orders.component';
import { RestaurantsComponent } from './components/common/restaurants/restaurants/restaurants.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, MessageComponent, HomeComponent, ProfileComponent,OrdersComponent,RestaurantsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  app_title = 'FlavorFleet';
}
