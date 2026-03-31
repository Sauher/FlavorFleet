import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

import { ApiService } from '../../../services/api.service';
import { MessageService } from '../../../services/message.service';
import { Restaurant } from '../../../interfaces/restaurant';
import { MenuItem } from '../../../interfaces/menu-item';
import { environment } from '../../../../environments/environment';

interface MenuItemForm {
  name: string;
  description: string;
  price: number;
  image?: File | null;
  imagePreview?: string;
}

@Component({
  selector: 'app-menu-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    DividerModule,
    FileUploadModule,
    TextareaModule,
    PaginatorModule,
    TagModule,
    TooltipModule,
    DialogModule
  ],
  templateUrl: './menu-management.component.html',
  styleUrls: ['./menu-management.component.scss']
})
export class MenuManagementComponent implements OnInit {
  private readonly serverUrl = environment.serverUrl.replace(/\/$/, '');
  private readonly fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%23f3f4f6'/%3E%3Crect x='110' y='72' width='180' height='116' rx='14' fill='%23e5e7eb'/%3E%3Cpath d='M132 170l42-44 34 33 24-24 36 35H132z' fill='%239ca3af'/%3E%3Ccircle cx='248' cy='112' r='12' fill='%239ca3af'/%3E%3Ctext x='200' y='216' text-anchor='middle' font-family='Arial, sans-serif' font-size='18' fill='%236b7280'%3ENo image%3C/text%3E%3C/svg%3E";

  restaurants: Restaurant[] = [];
  selectedRestaurant: Restaurant | null = null;
  loadingRestaurants = false;
  loadingMenuItems = false;
  savingMenuItem = false;

  // Local UI state, persisted to backend
  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  
  // Pagination
  itemsPerPage = 5;
  currentPage = 0;
  totalItems = 0;

  newMenuItemForm: MenuItemForm = {
    name: '',
    description: '',
    price: 0,
    image: null,
    imagePreview: ''
  };

  // Edit mode state
  editDialogVisible = false;
  editingItem: MenuItem | null = null;
  editMenuItemForm: MenuItemForm = {
    name: '',
    description: '',
    price: 0,
    image: null,
    imagePreview: ''
  };

  constructor(
    private api: ApiService,
    private message: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOwnerRestaurants();
  }

  onRestaurantSelect(): void {
    if (this.selectedRestaurant) {
      this.loadMenuItemsForRestaurant();
      this.resetForm();
    }
  }

  private loadOwnerRestaurants(): void {
    this.loadingRestaurants = true;
    this.api.readAll('restaurants/owner/mine', true).subscribe({
      next: (response) => {
        this.loadingRestaurants = false;
        this.restaurants = (response as Restaurant[]) ?? [];
        if (this.restaurants.length > 0) {
          this.selectedRestaurant = this.restaurants[0];
          this.loadMenuItemsForRestaurant();
        }
      },
      error: () => {
        this.loadingRestaurants = false;
        this.message.show('error', 'Hiba', 'Nem sikerült betölteni az éttermeket.');
      }
    });
  }

  private loadMenuItemsForRestaurant(): void {
    if (!this.selectedRestaurant) return;
    this.loadingMenuItems = true;

    this.api.getMenuItemsByRestaurant(this.selectedRestaurant.id).subscribe({
      next: (response) => {
        this.loadingMenuItems = false;
        const source = (response as MenuItem[]) ?? [];
        this.menuItems = source.map((item) => ({
          ...item,
          description: item.description ?? ''
        }));
        this.totalItems = this.menuItems.length;
        this.currentPage = 0;
        this.updatePaginatedItems();
      },
      error: () => {
        this.loadingMenuItems = false;
        this.menuItems = [];
        this.filteredMenuItems = [];
        this.totalItems = 0;
        this.currentPage = 0;
        this.message.show('error', 'Hiba', 'Nem sikerült betölteni az étlapot.');
      }
    });
  }

  addMenuItem(): void {
    const name = this.newMenuItemForm.name.trim();
    const price = Number(this.newMenuItemForm.price);

    if (!name) {
      this.message.show('warn', 'Hiányzó név', 'Az étel neve kötelező.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      this.message.show('warn', 'Érvénytelen ár', 'Az ár 0-nál nagyobbnak kell lennie.');
      return;
    }

    if (!this.selectedRestaurant) {
      this.message.show('warn', 'Válassz éttermet', 'Előbb válassz egy éttermet.');
      return;
    }

    this.savingMenuItem = true;

    const payload = {
      restaurant_id: this.selectedRestaurant.id,
      name,
      description: this.newMenuItemForm.description.trim(),
      price,
      is_available: true,
      imageURL: this.normalizePersistedImageUrl(this.newMenuItemForm.imagePreview)
    };

    this.api.createMenuItem(payload).subscribe({
      next: (response) => {
        this.savingMenuItem = false;
        const created = response as MenuItem;
        this.menuItems.unshift({
          ...created,
          description: created.description ?? ''
        });
        this.totalItems = this.menuItems.length;
        this.currentPage = 0;
        this.updatePaginatedItems();
        this.resetForm();
        this.message.show('success', 'Hozzáadva', `"${name}" sikeresen hozzáadva.`);
      },
      error: (error) => {
        this.savingMenuItem = false;
        this.message.show('error', 'Hiba', this.resolveApiError(error, 'Nem sikerült hozzáadni az ételt.'));
      }
    });
  }

  onImageSelect(event: any): void {
    const file: File | undefined = event?.files?.[0];
    if (!file) return;

    // Check file size (max 5 MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.message.show('warn', 'Fájl túl nagy', 'Maximum 5 MB méretű képet tölthetsz fel.');
      return;
    }

    if (!this.selectedRestaurant?.id) {
      this.message.show('warn', 'Válassz éttermet', 'Előbb válassz éttermet a képfeltöltéshez.');
      return;
    }

    this.newMenuItemForm.image = file;

    this.api.uploadMenuItemImage([file], this.selectedRestaurant.id).subscribe({
      next: (response: any) => {
        this.newMenuItemForm.imagePreview = String(response?.imageURL || '');
        this.message.show('success', 'Sikeres feltöltés', 'A kép sikeresen feltöltve.');
      },
      error: (error) => {
        this.newMenuItemForm.image = null;
        this.newMenuItemForm.imagePreview = '';
        this.message.show('error', 'Hiba', this.resolveApiError(error, 'Nem sikerült feltölteni a képet.'));
      }
    });
  }

  removeImage(): void {
    this.newMenuItemForm.image = null;
    this.newMenuItemForm.imagePreview = '';
  }

  toggleMenuItemAvailability(item: MenuItem): void {
    const current = item.is_available;
    item.is_available = !current;

    this.api.toggleMenuItemAvailability(item.id).subscribe({
      next: () => {
        this.message.show('info', 'Mentve', `"${item.name}" elérhetősége frissítve.`);
      },
      error: () => {
        item.is_available = current;
        this.message.show('error', 'Hiba', 'Nem sikerült módosítani az elérhetőséget.');
      }
    });
  }

  deleteMenuItem(item: MenuItem, _index: number): void {
    if (!confirm(`Biztosan törlöd: "${item.name}"?`)) {
      return;
    }

    this.api.deleteMenuItem(item.id).subscribe({
      next: () => {
        this.menuItems = this.menuItems.filter((menuItem) => menuItem.id !== item.id);
        this.totalItems = this.menuItems.length;
        if (this.currentPage >= Math.ceil(this.totalItems / this.itemsPerPage)) {
          this.currentPage = Math.max(0, this.currentPage - 1);
        }
        this.updatePaginatedItems();
        this.message.show('success', 'Törölve', `"${item.name}" sikeresen törölve.`);
      },
      error: () => {
        this.message.show('error', 'Hiba', 'Nem sikerült törölni az ételt.');
      }
    });
  }

  openEditDialog(item: MenuItem): void {
    this.editingItem = { ...item };
    this.editMenuItemForm = {
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: null,
      imagePreview: item.imageURL || ''
    };
    this.editDialogVisible = true;
  }

  saveEditedMenuItem(): void {
    const name = this.editMenuItemForm.name.trim();
    const price = Number(this.editMenuItemForm.price);

    if (!name) {
      this.message.show('warn', 'Hiányzó név', 'Az étel neve kötelező.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      this.message.show('warn', 'Érvénytelen ár', 'Az ár 0-nál nagyobbnak kell lennie.');
      return;
    }

    if (!this.editingItem) return;

    const payload = {
      name,
      description: this.editMenuItemForm.description.trim(),
      price,
      imageURL: this.normalizePersistedImageUrl(this.editMenuItemForm.imagePreview || this.editingItem.imageURL || null)
    };

    this.api.updateMenuItem(this.editingItem.id, payload).subscribe({
      next: (response) => {
        const updatedItem = response as MenuItem;
        const index = this.menuItems.findIndex((m) => m.id === this.editingItem!.id);
        if (index >= 0) {
          this.menuItems[index] = {
            ...updatedItem,
            description: updatedItem.description ?? ''
          };
          this.updatePaginatedItems();
          this.message.show('success', 'Mentve', `"${name}" sikeresen módosítva.`);
          this.cancelEdit();
        }
      },
      error: (error) => {
        this.message.show('error', 'Hiba', this.resolveApiError(error, 'Nem sikerült menteni a módosítást.'));
      }
    });
  }

  onEditImageSelect(event: any): void {
    const file: File | undefined = event?.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.message.show('warn', 'Fájl túl nagy', 'Maximum 5 MB méretű képet tölthetsz fel.');
      return;
    }

    if (!this.selectedRestaurant?.id) {
      this.message.show('warn', 'Válassz éttermet', 'Előbb válassz éttermet a képfeltöltéshez.');
      return;
    }

    this.editMenuItemForm.image = file;

    this.api.uploadMenuItemImage([file], this.selectedRestaurant.id).subscribe({
      next: (response: any) => {
        this.editMenuItemForm.imagePreview = String(response?.imageURL || '');
        this.message.show('success', 'Sikeres feltöltés', 'A kép sikeresen feltöltve.');
      },
      error: (error) => {
        this.editMenuItemForm.image = null;
        this.message.show('error', 'Hiba', this.resolveApiError(error, 'Nem sikerült feltölteni a képet.'));
      }
    });
  }

  removeEditImage(): void {
    this.editMenuItemForm.image = null;
    this.editMenuItemForm.imagePreview = '';
  }

  cancelEdit(): void {
    this.editDialogVisible = false;
    this.editingItem = null;
    this.editMenuItemForm = {
      name: '',
      description: '',
      price: 0,
      image: null,
      imagePreview: ''
    };
  }

  updatePaginatedItems(): void {
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.filteredMenuItems = this.menuItems.slice(start, end);
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.updatePaginatedItems();
  }

  resolveImageUrl(imagePath: string | undefined | null): string {
    if (!imagePath) {
      return this.fallbackImage;
    }

    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    if (imagePath.startsWith('/')) {
      return `${this.serverUrl}${imagePath}`;
    }

    return `${this.serverUrl}/${imagePath}`;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('hu-HU') + ' Ft';
  }

  private resetForm(): void {
    this.newMenuItemForm = {
      name: '',
      description: '',
      price: 0,
      image: null,
      imagePreview: ''
    };
  }

  private normalizePersistedImageUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith('data:')) {
      return null;
    }

    return trimmed;
  }

  private resolveApiError(error: any, fallback: string): string {
    return error?.error?.error || error?.error?.message || fallback;
  }
}
