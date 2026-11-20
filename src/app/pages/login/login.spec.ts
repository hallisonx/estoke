import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { afterEach, vi } from 'vitest';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
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
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
    });
    await login;

    expect(navigateByUrl).toHaveBeenCalledWith('/home.html');
  });

  it('shows an error when the API rejects the credentials', async () => {
    const navigateByUrl = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    component.usuario = 'admin';
    component.senha = 'incorreta';

    const login = component.login();
    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush({
        sucesso: false,
        mensagem: 'Usuário ou senha inválidos',
      });
    await login;

    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(component.mensagemErro()).toBe('Usuário ou senha inválidos');
  });

  it('shows invalid credentials and resets the button after HTTP 401', async () => {
    component.usuario = 'admin';
    component.senha = 'incorreta';

    const login = component.login();
    expect(component.carregando()).toBe(true);

    httpTesting
      .expectOne('http://localhost:8080/auth/login')
      .flush(
        {
          sucesso: false,
          mensagem: 'Usuário ou senha inválidos',
        },
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
