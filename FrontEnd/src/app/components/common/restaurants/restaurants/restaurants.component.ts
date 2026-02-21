import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

type FoodType = 'Pizza' | 'Burger' | 'Sushi' | 'Saláta' | 'Desszert' | 'Mexikói';

interface Restaurant {
  id: number;
  name: string;
  desc: string;
  types: FoodType[];
  imageUrl: string;
}

@Component({
  selector: 'app-restaurants-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    TagModule,
    DividerModule,
  ],
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
})
export class RestaurantsComponent {
  query = '';
  selectedTypes: FoodType[] = [];

  typeOptions: { label: string; value: FoodType }[] = [
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Burger', value: 'Burger' },
    { label: 'Sushi', value: 'Sushi' },
    { label: 'Saláta', value: 'Saláta' },
    { label: 'Desszert', value: 'Desszert' },
    { label: 'Mexikói', value: 'Mexikói' },
  ];

  restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Pizza Palazzo',
      desc: 'Vékonytésztás pizzák, friss feltétek, gyors kiszállítás.',
      types: ['Pizza', 'Desszert'],
      imageUrl:
        'https://images.unsplash.com/photo-1548365328-8b849e6f52b8?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 2,
      name: 'Burger House',
      desc: 'Smash burgerek, kézműves szószok, ropogós köretek.',
      types: ['Burger', 'Desszert'],
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 3,
      name: 'Sushi Master',
      desc: 'Prémium sushi boxok, friss lazac, klasszikus makik.',
      types: ['Sushi', 'Saláta'],
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 4,
      name: 'Taco Loco',
      desc: 'Mexikói kedvencek: taco, burrito, nachos, csípős opciók.',
      types: ['Mexikói'],
      imageUrl:
        'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 5,
      name: 'Green Bowl',
      desc: 'Egészséges tálak, saláták és könnyű desszertek.',
      types: ['Saláta', 'Desszert'],
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  get filteredRestaurants(): Restaurant[] {
    const q = this.query.trim().toLowerCase();
    const types = this.selectedTypes;

    return this.restaurants.filter((r) => {
      const matchesName = !q || r.name.toLowerCase().includes(q);
      const matchesTypes =
        types.length === 0 || types.every((t) => r.types.includes(t));
      return matchesName && matchesTypes;
    });
  }

  clearFilters() {
    this.query = '';
    this.selectedTypes = [];
  }

  openRestaurant(r: Restaurant) {
    // TODO: navigálás pl. /etterem/:id
    console.log('Open restaurant:', r);
  }

  typeSeverity(t: FoodType): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    if (t === 'Pizza') return 'info';
    if (t === 'Burger') return 'warn';
    if (t === 'Sushi') return 'success';
    if (t === 'Mexikói') return 'danger';
    return 'secondary';
  }
}