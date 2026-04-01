import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private server = environment.serverUrl;
  private tokenName = environment.tokenName;

  constructor(
    private http: HttpClient
  ) { }

  tokenHeader(): {headers: HttpHeaders} {
    let token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return { headers };
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenName) || sessionStorage.getItem(this.tokenName);
  }

  //  endpoints

  registration(table: string, data: object) {
    return this.http.post(`${this.server}/${table}/registration`, data);
  }

  login(table: string, data: object) {
    return this.http.post<any>(`${this.server}/${table}/login`, data);
  }

  //lostpass() { }

  //restorepass() { }

  readById(table: string, id: string, authenticated: boolean = false) {
    if (authenticated) {
      return this.http.get(`${this.server}/${table}/${id}`, this.tokenHeader());
    }
    return this.http.get(`${this.server}/${table}/${id}`);
  }

  readByField(table: string, field: string, op: string, value: string, authenticated: boolean = false) {
    if (authenticated) {
      return this.http.get(`${this.server}/${table}/${field}/${op}/${value}`, this.tokenHeader());
    }
    return this.http.get(`${this.server}/${table}/${field}/${op}/${value}`);
  }

  readAll(table: string, authenticated: boolean = false) {
    if (authenticated) {
      return this.http.get(`${this.server}/${table}`, this.tokenHeader());
    }
    return this.http.get(`${this.server}/${table}`);
  }

  sendMail(data: object) {
    return this.http.post(`${this.server}/sendmail`, data);
  }

  // private endpoints

  selectById(table: string, id: string) {
    return this.http.get(`${this.server}/${table}/${id}`, this.tokenHeader());
  }

  selectByField(table: string, field: string, op: string, value: string) {
    return this.http.get(`${this.server}/${table}/${field}/${op}/${value}`, this.tokenHeader());
  }

  selectAll(table: string) {
    return this.http.get(`${this.server}/${table}`, this.tokenHeader());
  }

  insert(table: string, data: object, authenticated: boolean = false) {
    if (authenticated) {
      return this.http.post(`${this.server}/${table}`, data, this.tokenHeader());
    }
    return this.http.post(`${this.server}/${table}`, data);
  }

  update(table: string, id: string, data: object) {
    return this.http.patch(`${this.server}/${table}/${id}`, data, this.tokenHeader());
  }

  put(table: string, id: string, data: object) {
    return this.http.put(`${this.server}/${table}/${id}`, data, this.tokenHeader());
  }

  delete(table: string, id: string) {
    return this.http.delete(`${this.server}/${table}/${id}`, this.tokenHeader());
  }

  deleteAll(table: string) {
    return this.http.delete(`${this.server}/${table}`, this.tokenHeader());
  }

  uploadFile() { }

  downloadFile() { }

  deleteFile() { }

  // Menu Item endpoints
  getMenuItemsByRestaurant(restaurantId: string) {
    return this.http.get(`${this.server}/menuitems/restaurant/${restaurantId}`, this.tokenHeader());
  }

  createMenuItem(data: object) {
    return this.http.post(`${this.server}/menuitems`, data, this.tokenHeader());
  }

  updateMenuItem(id: string, data: object) {
    return this.http.patch(`${this.server}/menuitems/${id}`, data, this.tokenHeader());
  }

  toggleMenuItemAvailability(id: string) {
    return this.http.patch(`${this.server}/menuitems/${id}/toggle-availability`, {}, this.tokenHeader());
  }

  deleteMenuItem(id: string) {
    return this.http.delete(`${this.server}/menuitems/${id}`, this.tokenHeader());
  }

  uploadMenuItemImage(files: File[], restaurantId?: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append('image', file));
    if (restaurantId) {
      formData.append('restaurant_id', restaurantId);
    }
    return this.http.post(`${this.server}/menuitems/upload/image`, formData, this.tokenHeader());
  }
}
