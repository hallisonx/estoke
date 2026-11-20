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
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('posts the credentials to the authentication endpoint', () => {
    let response: { sucesso: boolean; mensagem: string } | undefined;
    service.login('admin', '123456').subscribe((value) => {
      response = value;
    });

    const request = httpTesting.expectOne('http://localhost:8080/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'admin',
      senha: '123456',
    });
    request.flush({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
    });

    expect(response).toEqual({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
    });
  });
});
