import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DividerModule } from 'primeng/divider';
import { InputTextarea } from 'primeng/inputtextarea';
import { UploaderModule } from 'angular-uploader';
import { Uploader, UploadWidgetConfig, UploadWidgetResult } from 'uploader';
import { environment } from '../../../../environments/environment';

import { ApiService } from '../../../services/api.service';
import { MessageService } from '../../../services/message.service';
import { OpeningHoursEntry, Restaurant } from '../../../interfaces/restaurant';

interface EditorDayHours {
  day: number;
  label: string;
  opening_time: string;
  closing_time: string;
}

@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToggleButtonModule,
    DividerModule,
    UploaderModule,
    InputTextarea
  ],
  templateUrl: './restaurant-management.component.html',
  styleUrls: ['./restaurant-management.component.scss']
})
export class RestaurantManagementComponent implements OnInit {
  private readonly dayLabels = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
  private readonly serverUrl = environment.serverUrl.replace(/\/$/, '');

  restaurants: Restaurant[] = [];
  loadingList = false;
  loadingEditor = false;
  saving = false;
  deletingRestaurantId: string | null = null;
  currentRestaurantId: string | null = null;
  creatingRestaurant = false;

  createModel = {
    name: '',
    description: '',
    address: ''
  };

  editorModel = {
    id: '',
    name: '',
    description: '',
    address: '',
    is_open: false,
    opening_hours: [] as EditorDayHours[],
    images: [] as string[]
  };

  constructor(
    private api: ApiService,
    private message: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.currentRestaurantId = params.get('id');
      this.creatingRestaurant = this.currentRestaurantId === 'new';

      if (this.creatingRestaurant) {
        this.resetCreateModel();
      } else if (this.currentRestaurantId) {
        this.loadRestaurantForEdit(this.currentRestaurantId);
      } else {
        this.loadOwnerRestaurants();
      }
    });
  }

  openCreateRestaurant(): void {
    this.router.navigate(['/restaurant-management', 'new']);
  }

  openRestaurant(restaurant: Restaurant): void {
    this.router.navigate(['/restaurant-management', restaurant.id]);
  }

  backToList(): void {
    this.router.navigate(['/restaurant-management']);
  }

  deleteRestaurant(restaurant: Restaurant, event?: Event): void {
    event?.stopPropagation();

    if (!restaurant?.id) {
      return;
    }

    if (!confirm(`Biztosan törlöd a(z) "${restaurant.name}" éttermet?`)) {
      return;
    }

    this.deletingRestaurantId = restaurant.id;
    this.api.delete('restaurants', restaurant.id).subscribe({
      next: () => {
        this.deletingRestaurantId = null;
        this.restaurants = this.restaurants.filter((item) => item.id !== restaurant.id);
        this.message.show('success', 'Törölve', `A(z) "${restaurant.name}" étterem törölve lett.`);
      },
      error: (error) => {
        this.deletingRestaurantId = null;
        const errorMessage = this.resolveRestaurantError(error, 'Nem sikerült törölni az éttermet.');
        this.message.show('error', 'Hiba', errorMessage);
      }
    });
  }

  saveRestaurant(): void {
    if (!this.editorModel.id) {
      return;
    }

    if (!this.editorModel.address.trim()) {
      this.message.show('warn', 'Hiányzó cím', 'A cím megadása kötelező.');
      return;
    }

    this.saving = true;
    const openingHoursPayload: OpeningHoursEntry[] = this.editorModel.opening_hours.map((hour) => ({
      day: hour.day,
      opening_time: hour.opening_time || null,
      closing_time: hour.closing_time || null
    }));

    this.api
      .update('restaurants', this.editorModel.id, {
        description: this.editorModel.description,
        address: this.editorModel.address,
        is_open: this.editorModel.is_open,
        opening_hours: openingHoursPayload,
        images: this.editorModel.images
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.message.show('success', 'Mentve', 'Az étterem adatai frissítve lettek.');
        },
        error: (error) => {
          this.saving = false;
          const errorMessage = this.resolveRestaurantError(error, 'Nem sikerült menteni a módosításokat.');
          this.message.show('error', 'Hiba', errorMessage);
        }
      });
  }

  createRestaurant(): void {
    const name = this.createModel.name.trim();
    const address = this.createModel.address.trim();

    if (!name) {
      this.message.show('warn', 'Hiányzó név', 'A név megadása kötelező.');
      return;
    }

    if (!address) {
      this.message.show('warn', 'Hiányzó cím', 'A cím megadása kötelező.');
      return;
    }

    this.saving = true;
    this.api
      .insert(
        'restaurants',
        {
          name,
          description: this.createModel.description.trim(),
          address
        },
        true
      )
      .subscribe({
        next: () => {
          this.saving = false;
          this.message.show('success', 'Sikeres létrehozás', 'Az étterem sikeresen létrejött.');
          this.router.navigate(['/restaurant-management']);
        },
        error: (error) => {
          this.saving = false;
          const errorMessage = this.resolveRestaurantError(error, 'Nem sikerült létrehozni az éttermet.');
          this.message.show('error', 'Hiba', errorMessage);
        }
      });
  }

  // ── Uploader (angular-uploader) setup ──
  uploader = Uploader({ apiKey: 'free' });

  uploaderOptions: UploadWidgetConfig = {
    multi: true,
  };

  onUploadComplete = (files: UploadWidgetResult[]) => {
    if (!this.editorModel.id) {
      this.message.show('warn', 'Előbb mentsd', 'Először hozd létre az éttermet, utána tudsz képet feltölteni.');
      return;
    }

    for (const file of files) {
      if (this.editorModel.images.length >= 2) {
        this.message.show('warn', 'Maximum 2 kép', 'Egyszerre legfeljebb 2 képet tárolhatsz.');
        break;
      }
      if (file.fileUrl) {
        this.editorModel.images.push(file.fileUrl);
      }
    }
  };

  removeRestaurantImage(index: number): void {
    this.editorModel.images = this.editorModel.images.filter((_, imageIndex) => imageIndex !== index);
  }

  trackByDay(_index: number, item: EditorDayHours): number {
    return item.day;
  }

  resolveImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }

    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      try {
        const parsed = new URL(imagePath);
        if (parsed.pathname.startsWith('/uploads/')) {
          return `${this.serverUrl}${parsed.pathname}`;
        }
      } catch {
        return imagePath;
      }

      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `${this.serverUrl}${imagePath}`;
    }

    return `${this.serverUrl}/${imagePath}`;
  }

  private loadOwnerRestaurants(): void {
    this.loadingList = true;
    this.api.readAll('restaurants/owner/mine', true).subscribe({
      next: (response) => {
        this.loadingList = false;
        const source = (response as Restaurant[]) ?? [];
        this.restaurants = source.map((restaurant) => ({
          ...restaurant,
          images: this.normalizeImagesField((restaurant as any)?.images)
        }));
      },
      error: () => {
        this.loadingList = false;
        this.message.show('error', 'Hiba', 'Nem sikerült betölteni az éttermeket.');
      }
    });
  }

  private loadRestaurantForEdit(id: string): void {
    this.loadingEditor = true;
    this.api.readById('restaurants/owner', id, true).subscribe({
      next: (response) => {
        this.loadingEditor = false;
        const restaurant = response as Restaurant;
        this.editorModel = {
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description ?? '',
          address: restaurant.address,
          is_open: restaurant.is_open,
          opening_hours: this.mapOpeningHoursForEditor(restaurant.opening_hours),
          images: this.normalizeImagesField((restaurant as any)?.images).slice(0, 2)
        };
      },
      error: () => {
        this.loadingEditor = false;
        this.message.show('error', 'Hiba', 'Nem sikerült betölteni az étterem adatait.');
        this.backToList();
      }
    });
  }

  private mapOpeningHoursForEditor(openingHours: OpeningHoursEntry[] | null | undefined): EditorDayHours[] {
    const source = Array.isArray(openingHours) ? openingHours : [];

    return this.dayLabels.map((label, day) => {
      const current = source.find((entry) => entry.day === day);
      return {
        day,
        label,
        opening_time: current?.opening_time ?? '',
        closing_time: current?.closing_time ?? ''
      };
    });
  }

  private resetCreateModel(): void {
    this.createModel = {
      name: '',
      description: '',
      address: ''
    };
  }

  private resolveRestaurantError(error: any, fallbackMessage: string): string {
    if (error?.status === 413) {
      return 'A feltöltött kép túl nagy. Kérlek tölts fel kisebb méretű képet.';
    }

    return error?.error?.error || fallbackMessage;
  }

  private normalizeImagesField(images: unknown): string[] {
    if (Array.isArray(images)) {
      return images.filter((image): image is string => typeof image === 'string' && !!image);
    }

    if (typeof images === 'string') {
      const trimmed = images.trim();
      if (!trimmed) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((image): image is string => typeof image === 'string' && !!image);
        }
      } catch {
        return [trimmed];
      }
    }

    return [];
  }
}
