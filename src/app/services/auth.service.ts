import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  sucesso: boolean;
  mensagem: string;
}

export function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sucesso' in value &&
    typeof value.sucesso === 'boolean' &&
    'mensagem' in value &&
    typeof value.mensagem === 'string'
  );
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(login: string, senha: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      'http://localhost:8080/auth/login',
      {
        login,
        senha,
      },
    );
  }
}
