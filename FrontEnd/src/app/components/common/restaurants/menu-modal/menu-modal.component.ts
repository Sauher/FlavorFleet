import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { ApiService } from '../../../../services/api.service';
import { CartService } from '../../../../services/cart.service';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  restaurant_id: string;
  available?: boolean;
}

@Component({
  selector: 'app-menu-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ScrollPanelModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
  ],
  providers: [MessageService],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="'Menü - ' + restaurantName"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [breakpoints]="{ '960px': '95vw', '640px': '100vw' }"
      (onHide)="onClose()"
      [closeOnEscape]="true"
      [blockScroll]="true"
      styleClass="menu-modal-dialog"
    >
      <!-- Search Bar -->
      <div class="menu-search">
        <p-iconField iconPosition="left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Keresés menü alapján..."
            class="w-full"
          />
        </p-iconField>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <i class="pi pi-spinner pi-spin"></i>
        <p>Menü betöltése...</p>
      </div>

      <!-- Menu Items -->
      <div *ngIf="!loading && filteredMenuItems.length > 0" class="menu-items">
        <div class="menu-item" *ngFor="let item of filteredMenuItems">
          <!-- Item Image -->
          <div class="item-image" *ngIf="item.imageUrl">
            <img [src]="item.imageUrl" [alt]="item.name" />
          </div>
          <div class="item-image placeholder" *ngIf="!item.imageUrl">
            <i class="pi pi-image"></i>
          </div>

          <!-- Item Details -->
          <div class="item-details">
            <h4 class="item-name">{{ item.name }}</h4>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-footer">
              <span class="item-price">{{ item.price | currency: 'HUF' }}</span>
              <button
                pButton
                type="button"
                label="Kosárba"
                icon="pi pi-shopping-cart"
                (click)="addToCart(item)"
                class="p-button-sm p-button-rounded"
                [disabled]="!item.available"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredMenuItems.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>
          {{
            searchQuery
              ? 'Nincs olyan tétel a menüben'
              : 'A menü jelenleg üres'
          }}
        </p>
      </div>

      <!-- Footer with Close Button -->
      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Bezárás"
          icon="pi pi-times"
          (click)="onClose()"
          class="p-button-secondary"
        ></button>
      </ng-template>
    </p-dialog>

    <!-- Toast for notifications -->
    <p-toast></p-toast>
  `,
  styles: [
    `
      :host {
        ::ng-deep {
          .menu-modal-dialog {
            &.p-dialog .p-dialog-mask {
              background: rgba(0, 0, 0, 0.5) !important;
            }

            .p-dialog {
              border-radius: 1.5rem !important;
              overflow: hidden !important;

              .p-dialog-header {
                background-color: var(--p-primary-500);
                color: white;
                border: none;
                border-radius: 1.5rem 1.5rem 0 0 !important;
                padding: 1.25rem 1.5rem;

                .p-dialog-title {
                  font-weight: 600;
                  font-size: 1.1rem;
                }

                .p-dialog-header-close {
                  color: white;
                  width: 2.5rem;
                  height: 2.5rem;

                  &:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                  }
                }
              }

              .p-dialog-content {
                padding: 1.5rem;
                background-color: var(--p-surface-ground);
                border-radius: 0 0 0 0;
              }

              .p-dialog-footer {
                background-color: var(--p-surface-section);
                border-top: 1px solid var(--p-surface-border);
                padding: 1rem 1.5rem;
                border-radius: 0 0 1.5rem 1.5rem !important;
              }
            }
          }
        }
      }

      .menu-search {
        margin-bottom: 1.5rem;

        :deep(.p-iconfield) {
          width: 100%;

          input {
            width: 100%;
            padding: 0.7rem 0.875rem 0.7rem 2.5rem;
            border-radius: 1rem;
            border: 1px solid var(--p-field-border-color);
            font-size: 0.95rem;
            transition: all 0.2s ease;
            background-color: var(--p-surface-card);

            &::placeholder {
              color: var(--p-text-muted-color);
            }

            &:focus {
              border-color: var(--p-primary-500);
              box-shadow: 0 0 0 0.2rem
                var(--p-primary-500, rgba(13, 110, 253, 0.25));
              background-color: var(--p-surface-card);
            }
          }
        }
      }

      .menu-items {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1rem;
      }

      .menu-item {
        display: flex;
        flex-direction: column;
        background: var(--p-surface-card);
        border-radius: 1.25rem;
        overflow: hidden;
        border: 1px solid var(--p-surface-border);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }
      }

      .item-image {
        width: 100%;
        height: 200px;
        overflow: hidden;
        background-color: var(--p-surface-section);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        &.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--p-text-muted-color);

          i {
            font-size: 3rem;
          }
        }
      }

      .item-details {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        flex: 1;
      }

      .item-name {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--p-text-color);
      }

      .item-description {
        margin: 0;
        font-size: 0.85rem;
        color: var(--p-text-muted-color);
        line-height: 1.4;
        flex: 1;
      }

      .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--p-surface-border);
      }

      .item-price {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--p-primary-500);
      }

      .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
        color: var(--p-text-muted-color);

        i {
          font-size: 2.5rem;
          animation: spin 2s linear infinite;
          color: var(--p-primary-500);
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        gap: 1rem;
        color: var(--p-text-muted-color);

        i {
          font-size: 3rem;
          color: var(--p-primary-300);
        }

        p {
          margin: 0;
          font-size: 1rem;
        }
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 768px) {
        .menu-items {
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .item-image {
          height: 150px;
        }

        .item-details {
          padding: 0.75rem;
        }
      }

      @media (max-width: 480px) {
        .menu-items {
          grid-template-columns: 1fr;
        }

        .item-image {
          height: 180px;
        }
      }
    `,
  ],
})
export class MenuModalComponent implements OnInit {
  @Input() visible = false;
  @Input() restaurantId: string = '';
  @Input() restaurantName: string = '';

  @Output() onVisibleChange = new EventEmitter<boolean>();

  menuItems: MenuItem[] = [];
  filteredMenuItems: MenuItem[] = [];
  searchQuery = '';
  loading = false;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadMenuItems();
  }

  /**
   * Fetch menu items for the restaurant
   */
  loadMenuItems(): void {
    if (!this.restaurantId) {
      console.warn('[MenuModal] No restaurantId provided');
      return;
    }

    console.log(`[MenuModal] Loading menu items for restaurant ID: ${this.restaurantId}`);
    this.loading = true;
    
    this.apiService.getMenuItemsByRestaurant(this.restaurantId).subscribe({
      next: (response: any) => {
        console.log(`[MenuModal] Received response:`, response);
        this.menuItems = response.data || response;
        console.log(`[MenuModal] Loaded ${this.menuItems.length} menu items`);
        this.filteredMenuItems = [...this.menuItems];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('[MenuModal] Error loading menu items:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hiba',
          detail: 'Az étlap betöltése sikertelen.',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  /**
   * Filter menu items by search query
   */
  onSearchChange(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredMenuItems = [...this.menuItems];
      return;
    }

    this.filteredMenuItems = this.menuItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description
        .toLowerCase()
        .includes(query);
      return nameMatch || descMatch;
    });
  }

  /**
   * Add item to cart
   */
  addToCart(item: MenuItem): void {
    this.cartService.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: this.restaurantId,
      imageUrl: item.imageUrl,
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Siker',
      detail: `"${item.name}" hozzáadva a kosárhoz.`,
      life: 2000,
    });
  }

  /**
   * Close modal
   */
  onClose(): void {
    this.visible = false;
    this.searchQuery = '';
    this.onVisibleChange.emit(false);
  }
}
