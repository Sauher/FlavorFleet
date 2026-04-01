import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ApiService } from '../../../../services/api.service';
import { Restaurant } from '../../../../interfaces/restaurant';

type FoodType = 'Pizza' | 'Burger' | 'Sushi' | 'Saláta' | 'Desszert' | 'Mexikói';


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
export class RestaurantsComponent implements OnInit {
  constructor(private api: ApiService) {}

  query = '';
  selectedTypes: FoodType[] = [];

  ngOnInit() {
    this.getRestaurants();
  }

  typeOptions: { label: string; value: FoodType }[] = [
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Burger', value: 'Burger' },
    { label: 'Sushi', value: 'Sushi' },
    { label: 'Saláta', value: 'Saláta' },
    { label: 'Desszert', value: 'Desszert' },
    { label: 'Mexikói', value: 'Mexikói' },
  ];

  restaurants: Restaurant[] = [];

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

  getRestaurants(){
    this.api.readAll('restaurants', true).subscribe(data => {
      this.restaurants = data as Restaurant[];
    });
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