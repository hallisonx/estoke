import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { afterEach, vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates to home.html when the API authenticates the user', async () => {
    const navigateByUrl = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    component.usuario = 'admin';
    component.senha = '123456';

    const login = component.login();
    const request = httpTesting.expectOne('http://localhost:8080/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      login: 'admin',
      senha: '123456',
    });
    request.flush({
      accessToken: 'jwt-example',
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
    await login;

    expect(navigateByUrl).toHaveBeenCalledWith('/home.html');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
    expect(TestBed.inject(AuthService).authorizationHeader()).toBe(
      'Bearer jwt-example',
    );
  });

  it('does not authenticate when the response has no JWT', async () => {
    const navigateByUrl = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    const login = component.login();

    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush({
        sucesso: true,
        mensagem: 'Login realizado com sucesso',
      });
    await login;

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(component.mensagemErro()).toBe(
      'Resposta inválida do serviço de autenticação.',
    );
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });

  it('shows the backend message when HTTP 401 rejects the credentials', async () => {
    const navigateByUrl = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    component.usuario = 'admin';
    component.senha = 'incorreta';

    const login = component.login();
    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush(
        { mensagem: 'Usuário ou senha inválidos' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await login;

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(component.mensagemErro()).toBe('Usuário ou senha inválidos');
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
  });

  it('shows invalid credentials and resets the button after HTTP 401', async () => {
    component.usuario = 'admin';
    component.senha = 'incorreta';

    const login = component.login();
    expect(component.carregando()).toBe(true);

    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush(
        { mensagem: 'Usuário ou senha inválidos' },
        {
          status: 401,
          statusText: 'Unauthorized',
        },
      );
    await login;
    fixture.detectChanges();

    expect(component.mensagemErro()).toBe('Usuário ou senha inválidos');
    expect(component.carregando()).toBe(false);
    expect(fixture.nativeElement.querySelector('button').textContent).toContain(
      'Entrar',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'Usuário ou senha inválidos',
    );
  });

  it('shows a connection error when the API is unavailable', async () => {
    const login = component.login();
    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush('', { status: 500, statusText: 'Server Error' });
    await login;

    expect(component.mensagemErro()).toBe(
      'Não foi possível conectar ao serviço de autenticação.',
    );
  });
});
