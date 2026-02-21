import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { MessageService } from '../../../../services/message.service';

import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

interface FavoriteItem {
  id: number;
  name: string;
  rating: number;
  etaMin: number;
  imageUrl: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    RatingModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    PasswordModule,

  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
   constructor(private msg: MessageService) {}
  user = {
    name: 'Máté Horváth',
    email: 'mate.horvath@email.com',
    avatarUrl: 'https://i.pravatar.cc/160?img=12',
  };

  personalCards = [
    { title: 'Címek', subtitle: '6 Mentett cím', action: 'Megtekintés', icon: 'pi pi-map-marker' },
    { title: 'Fizetési módok', subtitle: '3 Hozzáadott kártya', action: 'Megtekintés', icon: 'pi pi-credit-card' },
    { title: 'Rendeléstörténet', subtitle: '32 Teljesített rendelés', action: 'Megtekintés', icon: 'pi pi-history' },
  ];

  favorites: FavoriteItem[] = [
    {
      id: 1,
      name: 'Pizza Palazzo',
      rating: 4.7,
      etaMin: 20,
      imageUrl:
        'https://images.unsplash.com/photo-1548365328-8b849e6f52b8?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 2,
      name: 'Burger House',
      rating: 4.7,
      etaMin: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 3,
      name: 'Sushi Master',
      rating: 4.7,
      etaMin: 15,
      imageUrl:
        'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=60',
    },
  ];

  editProfile() {
    console.log('Edit profile');
  }

  openPersonal(item: any) {
    console.log('Open personal:', item.title);
  }

  openFavorite(item: FavoriteItem) {
    console.log('Open favorite:', item.name);
  }
 

editProfileVisible = false;
changePasswordVisible = false;

/** form modellek (modalokhoz) */
editModel = { name: '', email: '' };
passwordModel = { password: '', confirm: '' };

openEditProfile() {
  this.editModel = { name: this.user.name, email: this.user.email };
  this.editProfileVisible = true;
}

saveProfile() {
  this.user = { ...this.user, name: this.editModel.name.trim(), email: this.editModel.email.trim() };
  this.editProfileVisible = false;

  this.msg.show(  'success',  'Mentve', 'Név és email frissítve.' );
}

openChangePassword() {
  this.passwordModel = { password: '', confirm: '' };
  this.changePasswordVisible = true;
}

savePassword() {
  const p = this.passwordModel.password;
  const c = this.passwordModel.confirm;

  if (!p || p.length < 6) {
    this.msg.show('error', 'Hiba', 'A jelszó legyen legalább 6 karakter.' );
    return;
  }
  if (p !== c) {
    this.msg.show('error',  'Hiba',  'A jelszavak nem egyeznek.' );
    return;
  }

  this.changePasswordVisible = false;
  this.msg.show('success',  'Siker',  'Jelszó módosítva.' );

  // TODO: backend hívás ide
}
}