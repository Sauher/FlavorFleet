import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { CommonModule} from "../../../../../node_modules/@angular/common";
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, DividerModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  constructor(private auth: AuthService) {}
  isLoggedIn: boolean = true;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.isLoggedIn = this.auth.isLoggedUser();
  }

  async checkAuthStatus() {
    this.isLoggedIn = this.auth.isLoggedUser();
  }
}
