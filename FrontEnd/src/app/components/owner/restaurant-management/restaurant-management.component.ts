import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { MenubarModule } from 'primeng/menubar';
import { TabViewModule } from 'primeng/tabview';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';
import { FileUploadModule } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';

type MenuCategory = 'Pizza' | 'Burger' | 'Sushi' | 'Ital' | 'Desszert';

interface MenuItem {
  id: number;
  name: string;
  category: MenuCategory;
  priceFt: number;
  imageUrl: string;
  enabled: boolean;
}

interface DayHours {
  day: string;
  open: string; // "11:30"
  close: string; // "23:00"
}

@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MenubarModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ToggleButtonModule,
    TagModule,
    DividerModule,
    TableModule,
    AvatarModule,
    TabViewModule,
    ChartModule,
    TooltipModule,
    FileUploadModule,
    DialogModule,
  ],
  templateUrl: './restaurant-management.component.html',
  styleUrls: ['./restaurant-management.component.scss'],
})
export class RestaurantManagementComponent {
  // top nav
  activeTop = 'Kezelőpult';


  restaurant = {
    name: 'Pizza Palazzo',
    rating: 4.7,
    coverUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=60',
    logoUrl: 'https://i.pravatar.cc/80?img=12',
    isOpen: true,
  };

  // tabs in the "restaurant" header area
  headerTab: 'Menü' | 'Étterem' = 'Menü';

  categoryOptions: { label: string; value: MenuCategory }[] = [
    { label: 'Pizza', value: 'Pizza' },
    { label: 'Burger', value: 'Burger' },
    { label: 'Sushi', value: 'Sushi' },
    { label: 'Ital', value: 'Ital' },
    { label: 'Desszert', value: 'Desszert' },
  ];

  
  newItem = {
  name: '',
  priceFt: 2290,
  category: 'Pizza' as MenuCategory,
  imageDataUrl: '' as string, 
};

  items: MenuItem[] = [
    {
      id: 1,
      name: 'Margherita Pizza',
      category: 'Pizza',
      priceFt: 1990,
      imageUrl:
        'https://images.unsplash.com/photo-1601924582975-7e1a4f2b2e9b?auto=format&fit=crop&w=600&q=60',
      enabled: true,
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      category: 'Pizza',
      priceFt: 2290,
      imageUrl:
        'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=600&q=60',
      enabled: true,
    },
    {
      id: 3,
      name: 'Prosciutto e Funghi',
      category: 'Pizza',
      priceFt: 2490,
      imageUrl:
        'https://images.unsplash.com/photo-1544982503-7fb06b5a5121?auto=format&fit=crop&w=600&q=60',
      enabled: true,
    },
    {
      id: 4,
      name: 'Quattro Formaggi',
      category: 'Pizza',
      priceFt: 2590,
      imageUrl:
        'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=600&q=60',
      enabled: false,
    },
  ];

 
  hours: DayHours[] = [
    { day: 'Hétfő', open: '11:30', close: '23:00' },
    { day: 'Kedd', open: '11:30', close: '23:00' },
    { day: 'Szerda', open: '11:30', close: '23:00' },
    { day: 'Csütörtök', open: '11:30', close: '23:00' },
    { day: 'Péntek', open: '11:30', close: '24:00' },
    { day: 'Szombat', open: '11:30', close: '24:00' },
    { day: 'Vasárnap', open: '11:30', close: '24:00' },
  ];


  stats = {
    todayOrders: 18,
    weekRevenueFt: 727_250,
    openOrders: 4,
  };


  chartData = {
    labels: ['H', 'K', 'Sz', 'Cs', 'P', 'Szo', 'V'],
    datasets: [
      {
        label: 'Rendelések',
        data: [5, 8, 7, 9, 12, 10, 6],
      },
    ],
  };

  chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true }, ticks: { precision: 0 } },
    },
  };

  formatFt(v: number) {
    return v.toLocaleString('hu-HU') + ' Ft';
  }

  addItem() {
    const name = this.newItem.name.trim();
    if (!name) return;

    const nextId = Math.max(...this.items.map((x) => x.id), 0) + 1;
    const imageUrl = this.newItem.imageDataUrl
  ? this.newItem.imageDataUrl
  : 'https://images.unsplash.com/photo-1601924582975-7e1a4f2b2e9b?auto=format&fit=crop&w=600&q=60';
  this.newItem.name = '';
this.newItem.imageDataUrl = '';

    this.items = [
      {
        id: nextId,
        name,
        category: this.newItem.category,
        priceFt: this.newItem.priceFt,
        imageUrl,
        enabled: true,
      },
      ...this.items,
    ];

    this.newItem.name = '';
  }

  toggleEnabled(item: MenuItem) {
    item.enabled = !item.enabled;
  }

  editItem(item: MenuItem) {
    console.log('edit', item);
  }

  deleteItem(item: MenuItem) {
    this.items = this.items.filter((x) => x.id !== item.id);
  }
  onPickImage(event: any) {
  const file: File | undefined = event?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.newItem.imageDataUrl = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

removePickedImage() {
  this.newItem.imageDataUrl = '';
}
editVisible = false;
editModel: {
  id: number | null;
  name: string;
  priceFt: number;
  category: MenuCategory;
  imageDataUrl: string;
} = {
  id: null,
  name: '',
  priceFt: 0,
  category: 'Pizza',
  imageDataUrl: '',
};

openEdit(item: MenuItem) {
  this.editModel = {
    id: item.id,
    name: item.name,
    priceFt: item.priceFt,
    category: item.category,
    imageDataUrl: item.imageUrl,
  };
  this.editVisible = true;
}

saveEdit() {
  if (this.editModel.id == null) return;
  const name = this.editModel.name.trim();
  if (!name) return;

  this.items = this.items.map((it) =>
    it.id === this.editModel.id
      ? {
          ...it,
          name,
          priceFt: this.editModel.priceFt,
          category: this.editModel.category,
          imageUrl: this.editModel.imageDataUrl || it.imageUrl,
        }
      : it
  );

  this.editVisible = false;
}

onPickEditImage(event: any) {
  const file: File | undefined = event?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.editModel.imageDataUrl = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

removeEditImage() {
  this.editModel.imageDataUrl = '';
}
}