import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Record<string, unknown> | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  readonly currentUserSignal = signal<Record<string, unknown> | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', payload).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        if (res.user) {
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
        } else {
          localStorage.removeItem(this.userKey);
        }
        this.currentUserSignal.set(res.user ?? null);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSignal.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private getStoredUser(): Record<string, unknown> | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Failed to parse stored user', err);
      return null;
    }
  }
}
