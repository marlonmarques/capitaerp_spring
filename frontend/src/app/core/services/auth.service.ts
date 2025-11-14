import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, User, TokenPayload } from '../auth/models/user.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notification: NotificationService
  ) {
    this.loadStoredUser();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);
    body.set('grant_type', 'password');
    body.set('scope', environment.oauth.scope);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.oauth.clientId}:${environment.oauth.clientSecret}`)
    });

    return this.http.post<AuthResponse>(`${this.API_URL}/oauth2/token`, body.toString(), { headers }).pipe(
      tap(response => {
        this.storeTokens(response);
        // Buscar informações do usuário após login bem-sucedido
        this.loadUserInfo().subscribe({
          next: (user) => {
            this.storeUser(user);
            this.currentUserSubject.next(user);
          },
          error: (error) => {
            console.error('Erro ao carregar informações do usuário:', error);
          }
        });
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    const body = new URLSearchParams();
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken!);
    body.set('scope', environment.oauth.scope);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${environment.oauth.clientId}:${environment.oauth.clientSecret}`)
    });

    return this.http.post<AuthResponse>(`${this.API_URL}/oauth2/token`, body.toString(), { headers }).pipe(
      tap(response => {
        this.storeTokens(response);
      })
    );
  }

  loadUserInfo(): Observable<User> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.getToken()
    });

    return this.http.get<User>(`${this.API_URL}/users/me`, { headers }).pipe(
      tap(user => {
        this.storeUser(user);
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    // Chamar endpoint de logout do backend se necessário
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token) {
      const body = new URLSearchParams();
      body.set('token', token);
      body.set('refresh_token', refreshToken!);

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${environment.oauth.clientId}:${environment.oauth.clientSecret}`)
      });

      this.http.post(`${this.API_URL}/oauth2/revoke`, body.toString(), { headers }).subscribe({
        next: () => console.log('Logout realizado no servidor'),
        error: (error) => console.error('Erro no logout remoto:', error)
      });
    }

    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
    this.notification.success('Logout realizado com sucesso!');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    // Verificar se o token está expirado
    return !this.isTokenExpired(payload);
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.some(role => user.roles.includes(role)) : false;
  }

  private storeTokens(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.access_token);
    if (response.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    }
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const payload = token.split('.')[1];
      // Adicionar padding se necessário para base64
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decodedPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  private isTokenExpired(payload: TokenPayload): boolean {
    // O payload.exp está em segundos, converter para milissegundos
    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
  }

  // Método para adicionar token às requisições automaticamente
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
