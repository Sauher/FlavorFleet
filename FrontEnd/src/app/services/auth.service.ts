import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private api : ApiService
  ) { }

  private tokenName = environment.tokenName;

  private isLoggedIn = new BehaviorSubject<boolean>(this.getToken());
  isLoggedIn$ = this.isLoggedIn.asObservable();


  getToken() {
    const sess = sessionStorage.getItem(this.tokenName);
    if (sess) return true;

    const locs = localStorage.getItem(this.tokenName);
    if (locs) {
      sessionStorage.setItem(this.tokenName, locs);
      return true;
    }

    return false;
  }

  login(token: string,id: string) {
    sessionStorage.setItem(this.tokenName, token);
    sessionStorage.setItem('userId', id);
    this.isLoggedIn.next(true);
  }

  logout() {
    sessionStorage.removeItem(this.tokenName);
    localStorage.removeItem(this.tokenName);
    this.isLoggedIn.next(false);
  }

  loggedUser() {
    // Check sessionStorage first, then localStorage
    let token = sessionStorage.getItem(this.tokenName) || localStorage.getItem(this.tokenName);
    if (token){
      try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const decodedUTF8Payload = new TextDecoder('utf-8').decode(
          new Uint8Array(decodedPayload.split('').map(char => char.charCodeAt(0)))
        );
        return JSON.parse(decodedUTF8Payload);
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    }
    return null;
  }

  storeUser(token: string) {
    localStorage.setItem(this.tokenName, token);
  }

  isLoggedUser(): boolean {
    return this.isLoggedIn.value;
  }

  async isAdmin(): Promise<boolean> {
    const user : any = await this.api.readById('users', this.loggedUser().id,true).toPromise();
    if (user) {
     if(user.role === 'admin'){
      return true;
     }
    }
    return false;
  }
}
