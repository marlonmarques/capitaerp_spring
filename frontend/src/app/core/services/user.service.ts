import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../auth/models/user.model';
import { AuthService } from './auth.service';

interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  findAll(page: number = 0, size: number = 10): Observable<Page<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<User>>(this.API_URL, { 
      headers: this.authService.getAuthHeaders(),
      params 
    });
  }

  findById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  insert(user: User): Observable<User> {
    return this.http.post<User>(this.API_URL, user, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, user, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  // Obter todas as roles disponíveis para seleção no formulário
  // Este endpoint deve ser criado no backend se não existir
  findAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/api/v1/roles`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }
}
