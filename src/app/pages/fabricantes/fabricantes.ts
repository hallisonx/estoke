import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Fabricante, NovoFabricante } from '../../models/fabricante.model';
import { FabricanteService } from '../../services/fabricante.service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-fabricantes',
  styleUrl: './fabricantes.css',
  templateUrl: './fabricantes.html',
})
export class Fabricantes implements OnInit {
  readonly estados = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
  ];
  readonly fabricantes = signal<Fabricante[]>([]);
  readonly carregandoLista = signal(false);
  readonly salvando = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly mensagemErro = signal('');
  readonly mensagemSucesso = signal('');
  formulario: NovoFabricante = this.novoFormulario();

  @ViewChild('formularioFabricante')
  private formularioElement?: ElementRef<HTMLFormElement>;

  constructor(private readonly fabricanteService: FabricanteService) {}

  ngOnInit(): void {
    void this.carregarFabricantes();
  }

  async carregarFabricantes(): Promise<void> {
    this.carregandoLista.set(true);
    this.mensagemErro.set('');

    try {
      this.fabricantes.set(await firstValueFrom(this.fabricanteService.listar()));
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(error, 'Não foi possível consultar os fabricantes.'),
      );
    } finally {
      this.carregandoLista.set(false);
    }
  }

  async salvar(): Promise<void> {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const cnpj = this.normalizarCnpj(this.formulario.cnpj);
    if (!this.validarCnpj(cnpj)) {
      this.mensagemErro.set('Informe um CNPJ válido.');
      return;
    }

    const telefone = this.digitos(this.formulario.telefone);
    if (telefone.length !== 11) {
      this.mensagemErro.set('O telefone deve conter 11 números.');
      return;
    }

    const editandoId = this.editandoId();
    const fabricante = { ...this.formulario, cnpj, telefone };
    this.salvando.set(true);

    try {
      if (editandoId === null) {
        await firstValueFrom(this.fabricanteService.salvar(fabricante));
      } else {
        await firstValueFrom(this.fabricanteService.atualizar(editandoId, fabricante));
      }

      this.formulario = this.novoFormulario();
      this.editandoId.set(null);
      this.mensagemSucesso.set(
        editandoId === null
          ? 'Fabricante cadastrado com sucesso.'
          : 'Fabricante atualizado com sucesso.',
      );
      await this.carregarFabricantes();
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(
          error,
          editandoId === null
            ? 'Não foi possível salvar o fabricante.'
            : 'Não foi possível atualizar o fabricante.',
        ),
      );
    } finally {
      this.salvando.set(false);
    }
  }

  editar(fabricante: Fabricante): void {
    this.editandoId.set(fabricante.id);
    this.formulario = {
      nome: fabricante.nome,
      cnpj: this.formatarCnpj(fabricante.cnpj),
      estado: fabricante.estado,
      cidade: fabricante.cidade,
      telefone: this.formatarTelefone(fabricante.telefone),
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

  private novoFormulario(): NovoFabricante {
    return {
      nome: '',
      cnpj: '',
      estado: '',
      cidade: '',
      telefone: '',
    };
  }

  atualizarCnpj(valor: string): void {
    this.formulario = {
      ...this.formulario,
      cnpj: this.formatarCnpj(valor),
    };
  }

  atualizarTelefone(valor: string): void {
    this.formulario = {
      ...this.formulario,
      telefone: this.formatarTelefone(valor),
    };
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

  formatarCnpj(valor: string): string {
    const cnpj = this.normalizarCnpj(valor).slice(0, 14);
    if (cnpj.length <= 2) {
      return cnpj;
    }
    if (cnpj.length <= 5) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    }
    if (cnpj.length <= 8) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    }
    if (cnpj.length <= 12) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    }

    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
  }

  validarCnpj(valor: string): boolean {
    const cnpj = this.normalizarCnpj(valor);
    if (!/^[A-Z0-9]{12}\d{2}$/.test(cnpj)) {
      return false;
    }
    if (/^([A-Z0-9])\1{11}$/.test(cnpj.slice(0, 12))) {
      return false;
    }

    const calcularDigito = (base: string, pesos: number[]): number => {
      const soma = [...base].reduce(
        (total, caractere, indice) => total + (caractere.charCodeAt(0) - 48) * pesos[indice],
        0,
      );
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base = cnpj.slice(0, 12);
    const primeiroDigito = calcularDigito(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const segundoDigito = calcularDigito(
      `${base}${primeiroDigito}`,
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    );

    return cnpj.endsWith(`${primeiroDigito}${segundoDigito}`);
  }

  private normalizarCnpj(valor: string): string {
    return valor.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  private digitos(valor: string): string {
    return valor.replace(/\D/g, '');
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
