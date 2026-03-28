import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RatingModule } from 'primeng/rating';
import { DividerModule } from 'primeng/divider';
import { MessageService } from '../../../../services/message.service';
import { UploaderModule } from "angular-uploader";
import { Uploader, UploadWidgetConfig, UploadWidgetResult } from 'uploader';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Router } from "@angular/router";
import { User } from '../../../../interfaces/user';
import { ApiService } from '../../../../services/api.service';
import { AuthService } from '../../../../services/auth.service';

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
    UploaderModule
],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
   constructor(private msg: MessageService, private router: Router,private api: ApiService,private auth: AuthService) {}

  ngOnInit(): void {
    this.getUser();
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  user: User = {
    name: '',
    email: '',
    pictureURL:''
  };


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

  getUser(){
    this.api.readById('users', this.auth.loggedUser()?.id,true ).subscribe({
      next: (res) => {
        this.user = res as User;
        console.log(this.user)
      }
    });
  }

  viewAddresses(){}


  //File upload
    uploadedFileUrl:string = ''

    uploader = Uploader({
    apiKey: 'free', 
    });
    options: UploadWidgetConfig = {
      multi: false,
    };
    onComplete = (files: UploadWidgetResult[]) => {
      this.uploadedFileUrl = files[0]?.fileUrl;
      console.log(this.uploadedFileUrl)
      this.editUser.pictureURL = this.uploadedFileUrl
    };
 

editProfileVisible = false;
changePasswordVisible = false;

/** form modellek (modalokhoz) */
editUser : User = { name: '', email: '', pictureURL: '' };
passwordModel = { password: '', confirm: '' };

openEditProfile() {
  this.editUser = { name: this.user.name, email: this.user.email, pictureURL: this.user.pictureURL };
  this.editProfileVisible = true;
}

saveProfile() {
  this.user = { ...this.user, name: this.editUser.name.trim(), email: this.editUser.email.trim(), pictureURL: this.editUser.pictureURL?.trim() };
  this.editProfileVisible = false;

  this.api.update('users', this.auth.loggedUser()?.id, this.editUser).subscribe({
    next: () => {
      this.msg.show(  'success',  'Mentve', 'Név, email és profilkép frissítve.' );
    }
    ,error: () => {
      this.msg.show(  'error',  'Hiba', 'Név, email és profilkép frissítése sikertelen.' );
    }
  });
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
  this.api.update('users', this.auth.loggedUser()?.id, { password: p }).subscribe({
    next: () => {
      this.msg.show('success',  'Siker',  'Jelszó módosítva.' );
    },
    error: () => {
      this.msg.show('error',  'Hiba',  'Jelszó módosítása sikertelen.' );
    }
  });
  this.msg.show('success',  'Siker',  'Jelszó módosítva.' );

}
}