import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, NovoCliente } from '../../models/cliente.model';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-clientes',
  styleUrl: './clientes.css',
  templateUrl: './clientes.html',
})
export class Clientes implements OnInit {
  readonly clientes = signal<Cliente[]>([]);
  readonly carregandoLista = signal(false);
  readonly salvando = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly mensagemErro = signal('');
  readonly mensagemSucesso = signal('');
  formulario: NovoCliente = this.novoFormulario();

  @ViewChild('formularioCliente')
  private formularioElement?: ElementRef<HTMLFormElement>;

  constructor(private readonly clienteService: ClienteService) {}

  ngOnInit(): void {
    void this.carregarClientes();
  }

  async carregarClientes(): Promise<void> {
    this.carregandoLista.set(true);
    this.mensagemErro.set('');

    try {
      this.clientes.set(await firstValueFrom(this.clienteService.listar()));
    } catch (error: unknown) {
      this.mensagemErro.set(this.mensagemDaFalha(error, 'Não foi possível consultar os clientes.'));
    } finally {
      this.carregandoLista.set(false);
    }
  }

  async salvar(): Promise<void> {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const cpf = this.digitos(this.formulario.cpf);
    if (cpf.length !== 11) {
      this.mensagemErro.set('O CPF deve conter 11 números.');
      return;
    }

    const telefone = this.digitos(this.formulario.telefone);
    if (telefone.length > 0 && telefone.length !== 11) {
      this.mensagemErro.set('O telefone deve conter 11 números.');
      return;
    }

    const editandoId = this.editandoId();
    const cliente = {
      ...this.formulario,
      cpf,
      telefone,
    };
    this.salvando.set(true);

    try {
      if (editandoId === null) {
        await firstValueFrom(this.clienteService.criar(cliente));
      } else {
        await firstValueFrom(this.clienteService.atualizar(editandoId, cliente));
      }

      this.formulario = this.novoFormulario();
      this.editandoId.set(null);
      this.mensagemSucesso.set(
        editandoId === null ? 'Cliente cadastrado com sucesso.' : 'Cliente atualizado com sucesso.',
      );
      await this.carregarClientes();
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(
          error,
          editandoId === null
            ? 'Não foi possível salvar o cliente.'
            : 'Não foi possível atualizar o cliente.',
        ),
      );
    } finally {
      this.salvando.set(false);
    }
  }

  editar(cliente: Cliente): void {
    this.editandoId.set(cliente.id);
    this.formulario = {
      cpf: this.formatarCpf(cliente.cpf),
      nome: cliente.nome,
      dataNascimento: cliente.dataNascimento.slice(0, 10),
      enderecoResidencial: cliente.enderecoResidencial,
      enderecoTrabalho: cliente.enderecoTrabalho,
      telefone: this.formatarTelefone(cliente.telefone),
      ativo: cliente.ativo,
    };
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
    this.formularioElement?.nativeElement.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }

  cancelarEdicao(): void {
    this.formulario = this.novoFormulario();
    this.editandoId.set(null);
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');
  }

  atualizarCpf(valor: string): void {
    this.formulario = {
      ...this.formulario,
      cpf: this.formatarCpf(valor),
    };
  }

  atualizarTelefone(valor: string): void {
    this.formulario = {
      ...this.formulario,
      telefone: this.formatarTelefone(valor),
    };
  }

  formatarCpf(valor: string): string {
    const cpf = this.digitos(valor).slice(0, 11);
    if (cpf.length <= 3) {
      return cpf;
    }
    if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    }
    if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    }
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
  }

  formatarTelefone(valor: string): string {
    const telefone = this.digitos(valor).slice(0, 11);
    if (telefone.length <= 2) {
      return telefone ? `(${telefone}` : '';
    }
    if (telefone.length <= 6) {
      return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
    }
    if (telefone.length <= 10) {
      return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
    }
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
  }

  formatarData(valor: string | null | undefined): string {
    const correspondencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor ?? '');
    if (!correspondencia) {
      return valor ?? '';
    }

    return `${correspondencia[3]}/${correspondencia[2]}/${correspondencia[1]}`;
  }

  private digitos(valor: string): string {
    return valor.replace(/\D/g, '');
  }

  private novoFormulario(): NovoCliente {
    return {
      cpf: '',
      nome: '',
      dataNascimento: '',
      enderecoResidencial: '',
      enderecoTrabalho: '',
      telefone: '',
      ativo: true,
    };
  }

  private mensagemDaFalha(error: unknown, padrao: string): string {
    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      if (
        typeof body === 'object' &&
        body !== null &&
        'mensagem' in body &&
        typeof body.mensagem === 'string'
      ) {
        return body.mensagem;
      }

      return `${padrao} (HTTP ${error.status}).`;
    }

    return padrao;
  }
}
