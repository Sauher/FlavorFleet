import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { StepsModule } from 'primeng/steps';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { InputMaskModule } from 'primeng/inputmask';
import { AuthService } from '../../../services/auth.service';

type Category = 'Pizza' | 'Burger' | 'Sushi';

interface Restaurant {
  id: number;
  name: string;
  category: Category;
  rating: number;
  etaMin: number;
  imageUrl: string;
}

interface OrderItem {
  id: number;
  restaurant: string;
  status: 'Úton' | 'Folyamatban' | 'Kiszállítva';
  priceFt: number;
  lines: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    RatingModule,
    DividerModule,
    StepsModule,
    TagModule,
    AvatarModule,
    InputMaskModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private auth: AuthService,
  ) {}

  

  isLoggedIn: boolean = false; // TODO: auth-ból
  query = '';
  selectedCategory: Category | 'All' = 'All';
  
  ngOnInit() {
    this.checkAuthStatus();
  }

  categories = [
  { label: 'Pizza', value: 'Pizza', icon: 'pi pi-fw pi-bolt' },   
  { label: 'Burger', value: 'Burger', icon: 'pi pi-fw pi-star' },
  { label: 'Sushi', value: 'Sushi', icon: 'pi pi-fw pi-heart' },
];
 

  restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Pizza Palazzo',
      category: 'Pizza',
      rating: 4.5,
      etaMin: 20,
      imageUrl:
        "https://www.google.com/search?sca_esv=bbb1899a236f26c2&sxsrf=ANbL-n4A7ts8MnsyDy16jBVYZm90ZhiHKA:1771692734106&udm=2&fbs=ADc_l-akmJ9clyHhwEynr9YRwEo_tYQUWp-_aNxOcHgKpLE-YUy1rF_kA3bn_mrSgXcgNhmuJ_hrB0X8wVkjBN1zt9F_hie2pcFxluQfXPCxcgtVVoHxGRs9ilE5qOh61dyxPQm3jzLbRzVXtSyV3YoGEZLSrP08hklX_PtI1f27El6F-XPGw_ix-NTUWfMjYlo3rC0eV5ZKjgU5r_Ze3u_Oqed6XQWVBg&q=pizza+palazzo&sa=X&ved=2ahUKEwjl1cTgheuSAxVSU1UIHX90EikQtKgLegQIDhAB&biw=1745&bih=866&dpr=1.1#sv=CAMSVhoyKhBlLUNpS1lhVlFlRnpEUVpNMg5DaUtZYVZRZUZ6RFFaTToOM0ExSUhqSVdPMWFjVU0gBCocCgZtb3NhaWMSEGUtQ2lLWWFWUWVGekRRWk0YADABGAcgnbKonQ8wAkoIEAIYAiACKAI"
    },
    {
      id: 2,
      name: 'Burger House',
      category: 'Burger',
      rating: 4.6,
      etaMin: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 3,
      name: 'Sushi',
      category: 'Sushi',
      rating: 4.4,
      etaMin: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  steps = [
    { label: 'Kosár' },
    { label: 'Folyamatban' },
    { label: 'Úton' },
  ];
  activeStepIndex = 2;

  currentOrderEta = 15;

  orders: OrderItem[] = [
    {
      id: 64573,
      restaurant: 'Pizza Palazzo',
      status: 'Úton',
      priceFt: 4460,
      lines: ['Cheeseburger Menü • 1×', 'Pepperoni Kotta'],
    },
    {
      id: 64572,
      restaurant: 'Burger House',
      status: 'Folyamatban',
      priceFt: 6190,
      lines: ['Sajtos Bolognese', 'Mazsol Bar(t)tal'],
    },
    {
      id: 64571,
      restaurant: 'Sushi Master',
      status: 'Kiszállítva',
      priceFt: 5120,
      lines: ['16 Részes Sushi Sott • 2 adag', 'Pad Thai'],
    },
  ];

  profile = {
    fullName: 'Olivér Schauer',
    email: 'oliver_schauer@email.com',
    phone: '06 30 123 4997',
    address: 'Budapest, Fő utca 5.',
  };

  get filteredRestaurants(): Restaurant[] {
    const q = this.query.trim().toLowerCase();
    return this.restaurants.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q);
      const matchesCat = this.selectedCategory === 'All' || r.category === this.selectedCategory;
      return matchesQuery && matchesCat;
    });
  }

  selectCategory(cat: Category) {
    this.selectedCategory = this.selectedCategory === cat ? 'All' : cat;
  }

  orderNow(r: Restaurant) {
    // TODO: routing / kosárhoz adás
    console.log('Order:', r);
  }

  statusSeverity(status: OrderItem['status']): 'success' | 'warn' | 'info' {
    if (status === 'Kiszállítva') return 'success';
    if (status === 'Folyamatban') return 'warn';
    return 'info';
  }

  formatFt(v: number) {
    // egyszerű formázás
    return v.toLocaleString('hu-HU') + ' Ft';
  }

  updateProfile() {
    console.log('Profile saved:', this.profile);
  }

  changePassword() {
    console.log('Change password clicked');
  }
  async checkAuthStatus() {
    this.isLoggedIn = this.auth.isLoggedUser();
  }
}