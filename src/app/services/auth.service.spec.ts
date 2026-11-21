import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts the credentials to the authentication endpoint', () => {
    let response: unknown;
    service.login('admin', '123456').subscribe((value) => {
      response = value;
    });

    const request = httpTesting.expectOne('http://localhost:8080/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.responseType).toBe('json');
    expect(request.request.body).toEqual({
      login: 'admin',
      senha: '123456',
    });
    request.flush({
      accessToken: 'jwt-example',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });

    expect(response).toEqual({
      accessToken: 'jwt-example',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  });

  it('stores the JWT for this tab and clears it on logout', () => {
    expect(service.isAuthenticated()).toBe(false);

    service.storeToken({
      accessToken: 'jwt-example',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.authorizationHeader()).toBe('Bearer jwt-example');

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.authorizationHeader()).toBeNull();
  });
});
