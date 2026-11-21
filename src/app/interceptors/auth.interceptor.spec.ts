import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  AUTH_API_BASE_URL,
  AUTH_LOGIN_URL,
  AuthService,
} from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    authService.storeToken({
      accessToken: 'jwt-example',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('sends the JWT to the backend API', () => {
    http.get(`${AUTH_API_BASE_URL}/fabricantes`).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer jwt-example',
    );
    request.flush([]);
  });

  it('does not send the JWT to the login endpoint or another host', () => {
    http.post(AUTH_LOGIN_URL, {}).subscribe();
    http.get('https://example.com/data').subscribe();

    const loginRequest = httpTesting.expectOne(AUTH_LOGIN_URL);
    const externalRequest = httpTesting.expectOne('https://example.com/data');
    expect(loginRequest.request.headers.has('Authorization')).toBe(false);
    expect(externalRequest.request.headers.has('Authorization')).toBe(false);
    loginRequest.flush({});
    externalRequest.flush({});
  });
});
