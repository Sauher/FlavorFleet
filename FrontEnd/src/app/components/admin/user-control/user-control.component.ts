import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../../services/api.service';
import { MessageService } from '../../../services/message.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-user-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TreeTableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [ConfirmationService],
  templateUrl: './user-control.component.html',
  styleUrl: './user-control.component.scss'
})
export class UserControlComponent implements OnInit {
  userTree: TreeNode[] = [];
  users: User[] = [];

  editDialogVisible = false;
  selectedUser: User = { name: '', email: '', password: '' };

  roleOptions = [
    { label: 'Admin', value: 'admin' },
    { label: 'Tulajdonos', value: 'owner' },
    { label: 'Felhasználó', value: 'user' }
  ];

  statusOptions = [
    { label: 'Aktív', value: true },
    { label: 'Inaktív', value: false }
  ];

  constructor(
    private api: ApiService,
    private msg: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.selectAll('users').subscribe({
      next: (res: any) => {
        this.users = res;
        this.buildTree();
      },
      error: () => {
        this.msg.show('error', 'Error', 'Failed to load users.');
      }
    });
  }

  buildTree(): void {
    const admins = this.users.filter(u => u.role === 'admin' && u.status !== false);
    const owners = this.users.filter(u => u.role === 'owner' && u.status !== false);
    const regularUsers = this.users.filter(u => u.role === 'user' && u.status !== false);
    const inactive = this.users.filter(u => u.status === false);

    this.userTree = [
      {
        data: { name: 'Adminok', email: '', role: 'admin', isCategory: true },
        expanded: true,
        children: admins.map(u => ({
          data: { ...u, isCategory: false }
        }))
      },
      {
        data: { name: 'Tulajdonosok', email: '', role: 'owner', isCategory: true },
        expanded: true,
        children: owners.map(u => ({
          data: { ...u, isCategory: false }
        }))
      },
      {
        data: { name: 'Felhasználók', email: '', role: 'user', isCategory: true },
        expanded: true,
        children: regularUsers.map(u => ({
          data: { ...u, isCategory: false }
        }))
      },
      {
        data: { name: 'Inaktív fiókok', email: '', role: 'inactive', isCategory: true },
        expanded: false,
        children: inactive.map(u => ({
          data: { ...u, isCategory: false }
        }))
      }
    ];
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.editDialogVisible = true;
  }

  saveUser(): void {
    if (!this.selectedUser.id) return;

    const updateData: any = {
      name: this.selectedUser.name,
      email: this.selectedUser.email,
      role: this.selectedUser.role,
      status: this.selectedUser.status
    };

    this.api.update('users', this.selectedUser.id, updateData).subscribe({
      next: () => {
        this.msg.show('success', 'Success', 'User updated successfully.');
        this.editDialogVisible = false;
        this.loadUsers();
      },
      error: () => {
        this.msg.show('error', 'Error', 'Failed to update user.');
      }
    });
  }

  deleteUser(event: Event, user: User): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete ${user.name}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!user.id) return;
        this.api.delete('users', user.id).subscribe({
          next: () => {
            this.msg.show('success', 'Success', 'User deleted successfully.');
            this.loadUsers();
          },
          error: () => {
            this.msg.show('error', 'Error', 'Failed to delete user.');
          }
        });
      }
    });
  }

  getRoleSeverity(role: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch (role) {
      case 'admin': return 'danger';
      case 'owner': return 'success';
      case 'user': return 'info';
      default: return 'secondary';
    }
  }

  getStatusSeverity(status: boolean | undefined): "success" | "danger" | "secondary" {
    return status !== false ? 'success' : 'danger';
  }
}