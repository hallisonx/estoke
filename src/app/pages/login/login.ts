import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, getAuthErrorMessage, isLoginResponse } from '../../services/auth.service';
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

      if (isLoginResponse(resposta)) {
        this.authService.storeToken(resposta);
        await this.router.navigateByUrl('/home.html');
      } else {
        this.mensagemErro.set(
          'Resposta inválida do serviço de autenticação.',
        );
      }
    } catch (error: unknown) {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403)
      ) {
        this.mensagemErro.set(
          getAuthErrorMessage(error.error) || 'Credenciais inválidas.',
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
}
