import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthService,
  isAuthResponse,
} from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  usuario = '';
  senha = '';
  readonly mensagemErro = signal('');
  readonly carregando = signal(false);

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  async login(): Promise<void> {
    this.mensagemErro.set('');
    this.carregando.set(true);

    try {
      const resposta = await firstValueFrom(
        this.authService.login(this.usuario, this.senha),
      );

      if (!isAuthResponse(resposta)) {
        this.mensagemErro.set(
          'Resposta inválida do serviço de autenticação.',
        );
      } else if (resposta.sucesso) {
        await this.router.navigateByUrl('/home.html');
      } else {
        this.mensagemErro.set(
          resposta.mensagem || 'Credenciais inválidas.',
        );
      }
    } catch (error: unknown) {
      if (error instanceof HttpErrorResponse && this.isCredentialError(error)) {
        this.mensagemErro.set(
          isAuthResponse(error.error)
            ? error.error.mensagem
            : 'Credenciais inválidas.',
        );
      } else {
        this.mensagemErro.set(
          'Não foi possível conectar ao serviço de autenticação.',
        );
      }
    } finally {
      this.carregando.set(false);
    }
  }

  private isCredentialError(error: HttpErrorResponse): boolean {
    return (
      error.status === 401 ||
      error.status === 403 ||
      (typeof error.error === 'string' &&
        error.error.trim() === 'LOGIN_INVALIDO')
    );
  }
}
