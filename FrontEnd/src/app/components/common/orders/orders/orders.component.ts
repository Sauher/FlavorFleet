import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

type OrderStatus = 'Függőben' | 'Folyamatban' | 'Úton' | 'Kiszállítva' | 'Lemondva';

interface OrderLine {
  name: string;
  qty: number;
  priceFt: number; 
}

interface Order {
  id: number;
  restaurant: string;
  status: OrderStatus;
  createdAtIso: string; 
  etaMin?: number;
  address: string;
  lines: OrderLine[];
  deliveryFt: number;
  serviceFt: number;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    TableModule,
    
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
  query = '';
  statusFilter: OrderStatus | 'Összes' = 'Összes';

  statusOptions: Array<{ label: string; value: OrderStatus | 'Összes' }> = [
    { label: 'Összes', value: 'Összes' },
    { label: 'Függőben', value: 'Függőben' },
    { label: 'Folyamatban', value: 'Folyamatban' },
    { label: 'Úton', value: 'Úton' },
    { label: 'Kiszállítva', value: 'Kiszállítva' },
    { label: 'Lemondva', value: 'Lemondva' },
  ];

  orders: Order[] = [
    {
      id: 64591,
      restaurant: 'Burger House',
      status: 'Úton',
      createdAtIso: '2026-02-21T12:12:00',
      etaMin: 12,
      address: 'Budapest, Fő utca 5.',
      lines: [
        { name: 'Dupla sajtos burger', qty: 1, priceFt: 3190 },
        { name: 'Édesburgonya', qty: 1, priceFt: 1290 },
        { name: 'Cola 0.33', qty: 2, priceFt: 490 },
      ],
      deliveryFt: 590,
      serviceFt: 290,
    },
    {
      id: 64572,
      restaurant: 'Pizza Palazzo',
      status: 'Kiszállítva',
      createdAtIso: '2026-02-20T19:40:00',
      address: 'Budapest, Fő utca 5.',
      lines: [
        { name: 'Pepperoni pizza (32cm)', qty: 1, priceFt: 3890 },
        { name: 'Fokhagymás dip', qty: 2, priceFt: 390 },
      ],
      deliveryFt: 690,
      serviceFt: 290,
    },
    {
      id: 64531,
      restaurant: 'Sushi Master',
      status: 'Lemondva',
      createdAtIso: '2026-02-18T13:05:00',
      address: 'Budapest, Fő utca 5.',
      lines: [
        { name: '16 részes sushi box', qty: 1, priceFt: 5290 },
        { name: 'Miso leves', qty: 1, priceFt: 890 },
      ],
      deliveryFt: 890,
      serviceFt: 290,
    },
    {
      id: 64512,
      restaurant: 'Burger House',
      status: 'Folyamatban',
      createdAtIso: '2026-02-21T11:40:00',
      etaMin: 25,
      address: 'Budapest, Fő utca 5.',
      lines: [{ name: 'Cheeseburger menü', qty: 1, priceFt: 3990 }],
      deliveryFt: 590,
      serviceFt: 290,
    },
  ];


  detailsVisible = false;
  selectedOrder: Order | null = null;


  get sortedOrders(): Order[] {
    return [...this.orders].sort(
      (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
    );
  }

  get filteredOrders(): Order[] {
    const q = this.query.trim().toLowerCase();
    return this.sortedOrders.filter((o) => {
      const matchesStatus = this.statusFilter === 'Összes' || o.status === this.statusFilter;
      const matchesQuery =
        !q ||
        o.restaurant.toLowerCase().includes(q) ||
        o.lines.some((l) => l.name.toLowerCase().includes(q)) ||
        String(o.id).includes(q);
      return matchesStatus && matchesQuery;
    });
  }

  openDetails(order: Order) {
    this.selectedOrder = order;
    this.detailsVisible = true;
  }

  closeDetails() {
    this.detailsVisible = false;
    this.selectedOrder = null;
  }

  lineTotalFt(l: OrderLine): number {
    return l.qty * l.priceFt;
  }

  itemsSubtotalFt(o: Order): number {
    return o.lines.reduce((sum, l) => sum + this.lineTotalFt(l), 0);
  }

  grandTotalFt(o: Order): number {
    return this.itemsSubtotalFt(o) + o.deliveryFt + o.serviceFt;
  }

  formatFt(v: number) {
    return v.toLocaleString('hu-HU') + ' Ft';
  }

  formatDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  severity(status: OrderStatus): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    switch (status) {
      case 'Kiszállítva': return 'success';
      case 'Úton': return 'info';
      case 'Folyamatban': return 'warn';
      case 'Függőben': return 'secondary';
      case 'Lemondva': return 'danger';
    }
  }

}