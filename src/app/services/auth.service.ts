import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

export const AUTH_API_BASE_URL = 'http://localhost:8080';
export const AUTH_LOGIN_URL = `${AUTH_API_BASE_URL}/auth/login`;

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export function isLoginResponse(value: unknown): value is LoginResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string' &&
    value.accessToken.length > 0 &&
    'tokenType' in value &&
    typeof value.tokenType === 'string' &&
    value.tokenType.length > 0 &&
    'expiresIn' in value &&
    typeof value.expiresIn === 'number' &&
    Number.isFinite(value.expiresIn) &&
    value.expiresIn > 0
  );
}

export function getAuthErrorMessage(body: unknown): string | undefined {
  if (typeof body === 'string') {
    const text = body.trim();
    if (text === 'LOGIN_INVALIDO') {
      return 'Credenciais inválidas.';
    }

    try {
      return getAuthErrorMessage(JSON.parse(text));
    } catch {
      return undefined;
    }
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'mensagem' in body &&
    typeof body.mensagem === 'string' &&
    body.mensagem.length > 0
  ) {
    return body.mensagem;
  }

  return undefined;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly accessTokenKey = 'estoke.accessToken';
  private readonly tokenTypeKey = 'estoke.tokenType';
  private readonly expiresAtKey = 'estoke.tokenExpiresAt';

  login(login: string, senha: string): Observable<unknown> {
    return this.http.post<unknown>(AUTH_LOGIN_URL, {
      login,
      senha,
    });
  }

  storeToken(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.setItem(this.accessTokenKey, response.accessToken);
    sessionStorage.setItem(this.tokenTypeKey, response.tokenType);
    sessionStorage.setItem(
      this.expiresAtKey,
      String(Date.now() + response.expiresIn * 1000),
    );
  }

  isAuthenticated(): boolean {
    return this.getValidToken() !== null;
  }

  authorizationHeader(): string | null {
    const token = this.getValidToken();
    return token ? `${token.tokenType} ${token.accessToken}` : null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.accessTokenKey);
      sessionStorage.removeItem(this.tokenTypeKey);
      sessionStorage.removeItem(this.expiresAtKey);
    }
  }

  private getValidToken(): {
    accessToken: string;
    tokenType: string;
  } | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const tokenType = sessionStorage.getItem(this.tokenTypeKey);
    const expiresAt = Number(sessionStorage.getItem(this.expiresAtKey));

    if (
      !accessToken ||
      !tokenType ||
      !Number.isFinite(expiresAt) ||
      Date.now() >= expiresAt
    ) {
      this.logout();
      return null;
    }

    return { accessToken, tokenType };
  }
}
