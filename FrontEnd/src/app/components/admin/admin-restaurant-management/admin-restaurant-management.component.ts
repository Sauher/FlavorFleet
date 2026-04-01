import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { SidebarModule } from 'primeng/sidebar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ApiService } from '../../../services/api.service';
import { MessageService as CustomMessageService } from '../../../services/message.service';
import { Restaurant } from '../../../interfaces/restaurant';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface RestaurantWithOwner extends Restaurant {
  owner?: {
    id: string;
    name: string;
    email: string;
    status: boolean;
  };
}

@Component({
  selector: 'app-admin-restaurant-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SidebarModule,
    DialogModule,
    InputTextarea,
    ToastModule,
    ConfirmDialogModule,
    InputGroupModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule,
    ToggleSwitchModule,
    CardModule,
    DividerModule,
    BadgeModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './admin-restaurant-management.component.html',
  styleUrl: './admin-restaurant-management.component.scss'
})
export class AdminRestaurantManagementComponent implements OnInit {
  restaurants: RestaurantWithOwner[] = [];
  filteredRestaurants: RestaurantWithOwner[] = [];
  loading = true;
  editDialogVisible = false;
  editForm!: FormGroup;
  selectedRestaurant: RestaurantWithOwner | null = null;
  searchValue = '';

  serverUrl = environment.serverUrl.replace(/\/$/, '');

  private readonly dayLabels = [
    'Hétfő',
    'Kedd',
    'Szerda',
    'Csütörtök',
    'Péntek',
    'Szombat',
    'Vasárnap'
  ];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private customMessageService: CustomMessageService,
    private confirmationService: ConfirmationService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      address: ['', Validators.required],
      phone: [''],
      image_url: ['']
    });
  }

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading = true;
    this.api.selectAll('admin/restaurants').subscribe({
      next: (response: any) => {
        this.restaurants = response.data || response;
        this.filteredRestaurants = [...this.restaurants];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading restaurants:', error);
        this.customMessageService.show(
          'error',
          'Hiba',
          'Az éttermek betöltése sikertelen.'
        );
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    const query = this.searchValue.toLowerCase().trim();

    if (!query) {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    this.filteredRestaurants = this.restaurants.filter((restaurant) => {
      const nameMatch = restaurant.name
        .toLowerCase()
        .includes(query);
      const ownerMatch = restaurant.owner?.name
        .toLowerCase()
        .includes(query);

      return nameMatch || ownerMatch;
    });
  }

  toggleRestaurantStatus(restaurant: RestaurantWithOwner): void {
    this.confirmationService.confirm({
      message: `Biztosan szeretnéd ${restaurant.is_active ? 'deaktiválni' : 'aktiválni'} a "${restaurant.name}" éttermet?`,
      header: 'Státusz megerősítése',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Igen',
      rejectLabel: 'Nem',
      accept: () => {
        const newStatus = !restaurant.is_active;
        this.api
          .update('admin/restaurants', restaurant.id, {
            is_active: newStatus
          })
          .subscribe({
            next: () => {
              restaurant.is_active = newStatus;
              this.customMessageService.show(
                'success',
                'Siker',
                `Az étterem sikeresen ${newStatus ? 'aktiválva' : 'deaktiválva'}.`
              );
            },
            error: (error: any) => {
              console.error('Error toggling restaurant status:', error);
              this.customMessageService.show(
                'error',
                'Hiba',
                'A státusz módosítása sikertelen.'
              );
            }
          });
      }
    });
  }

  openEditDialog(restaurant: RestaurantWithOwner): void {
    this.selectedRestaurant = restaurant;
    this.editForm.patchValue({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone || '',
      image_url: restaurant.image_url || ''
    });
    this.editDialogVisible = true;
  }

  saveRestaurant(): void {
    if (!this.editForm.valid || !this.selectedRestaurant) {
      this.customMessageService.show(
        'warn',
        'Figyelem',
        'Kérjük töltsd ki az összes kötelező mezőt.'
      );
      return;
    }

    const formValue = this.editForm.value;
    const updateData = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      address: formValue.address.trim(),
      phone: formValue.phone.trim(),
      image_url: formValue.image_url.trim()
    };

    this.api
      .put(`admin/restaurants`, this.selectedRestaurant.id, updateData)
      .subscribe({
        next: (response: any) => {
          const index = this.restaurants.findIndex(
            (r) => r.id === this.selectedRestaurant!.id
          );
          if (index !== -1) {
            this.restaurants[index] = { ...this.restaurants[index], ...response.data };
          }
          this.filteredRestaurants = [...this.restaurants];
          this.editDialogVisible = false;
          this.customMessageService.show(
            'success',
            'Siker',
            'Az étterem sikeresen frissítve.'
          );
        },
        error: (error: any) => {
          console.error('Error updating restaurant:', error);
          this.customMessageService.show(
            'error',
            'Hiba',
            'Az étterem frissítése sikertelen.'
          );
        }
      });
  }

  closeEditDialog(): void {
    this.editDialogVisible = false;
    this.selectedRestaurant = null;
    this.editForm.reset();
  }

  getStatusColor(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Aktív' : 'Inaktív';
  }

  formatDate(date: any): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getOwnerName(restaurant: RestaurantWithOwner): string {
    return restaurant.owner?.name || 'Ismeretlen';
  }

  getOwnerEmail(restaurant: RestaurantWithOwner): string {
    return restaurant.owner?.email || '-';
  }

  getRestaurantImage(restaurant: RestaurantWithOwner): string {
    if (restaurant.image_url) {
      return restaurant.image_url.startsWith('http')
        ? restaurant.image_url
        : `${this.serverUrl}${restaurant.image_url}`;
    }
    return '';
  }

  confirmDelete(restaurant: RestaurantWithOwner): void {
    this.confirmationService.confirm({
      message: `Biztosan szeretnéd véglegesen törölni az "${restaurant.name}" éttermet? Ez a művelet nem vonható vissza.`,
      header: 'Törlés megerősítése',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Törlés',
      rejectLabel: 'Mégse',
      accept: () => {
        this.api.delete('admin/restaurants', restaurant.id).subscribe({
          next: () => {
            this.restaurants = this.restaurants.filter(
              (r) => r.id !== restaurant.id
            );
            this.filteredRestaurants = [...this.restaurants];
            this.customMessageService.show(
              'success',
              'Siker',
              'Az étterem sikeresen törölve.'
            );
          },
          error: (error: any) => {
            console.error('Error deleting restaurant:', error);
            this.customMessageService.show(
              'error',
              'Hiba',
              'Az étterem törlése sikertelen.'
            );
          }
        });
      }
    });
  }
}

