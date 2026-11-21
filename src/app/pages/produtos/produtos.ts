import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Fabricante } from '../../models/fabricante.model';
import { NovoProduto, Produto, ProdutoFormulario } from '../../models/produto.model';
import { FabricanteService } from '../../services/fabricante.service';
import { ProdutoService } from '../../services/produto.service';

type CampoMonetario = 'valorCompra' | 'valorVenda' | 'valorPromocional';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-produtos',
  styleUrl: './produtos.css',
  templateUrl: './produtos.html',
})
export class Produtos implements OnInit {
  readonly cores = [
    'Açaí',
    'Amarelo',
    'Azul-royal',
    'Azul-marinho',
    'Azul-bebê',
    'Azul-petróleo',
    'Bege',
    'Branco',
    'Cinza',
    'Laranja',
    'Marrom',
    'Marrom-capuccino',
    'Marrom-ganache',
    'Preto',
    'Rosa-bebê',
    'Rosa-pink',
    'Rosa-fucsia',
    'Roxo',
    'Verde Militar',
    'Verde Musgo',
    'Verde Oliva',
    'Vermelho',
    'Multicolorido',
    'Terracota',
    'Outra',
  ];
  readonly tamanhos = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
  readonly produtos = signal<Produto[]>([]);
  readonly generos = signal<string[]>([]);
  readonly tiposTecido = signal<string[]>([]);
  readonly fabricantes = signal<Fabricante[]>([]);
  readonly carregandoLista = signal(false);
  readonly salvando = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly mensagemErro = signal('');
  readonly mensagemSucesso = signal('');
  formulario: ProdutoFormulario = this.novoFormulario();

  @ViewChild('formularioProduto')
  private formularioElement?: ElementRef<HTMLFormElement>;

  private readonly formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  constructor(
    private readonly produtoService: ProdutoService,
    private readonly fabricanteService: FabricanteService,
  ) {}

  ngOnInit(): void {
    void this.carregarProdutos();
    void this.carregarOpcoes();
  }

  async carregarProdutos(): Promise<void> {
    this.carregandoLista.set(true);
    this.mensagemErro.set('');

    try {
      this.produtos.set(await firstValueFrom(this.produtoService.listar()));
    } catch (error: unknown) {
      this.mensagemErro.set(this.mensagemDaFalha(error, 'Não foi possível consultar os produtos.'));
    } finally {
      this.carregandoLista.set(false);
    }
  }

  async salvar(): Promise<void> {
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    const fabricanteId = this.formulario.fabricanteId;
    if (fabricanteId === null) {
      this.mensagemErro.set('Selecione um fabricante.');
      return;
    }

    const valoresNumericos = [
      this.formulario.peso,
      this.formulario.gramatura,
      this.formulario.valorCompra,
      this.formulario.valorVenda,
      this.formulario.valorPromocional,
      this.formulario.quantidadeEstoque,
    ];
    if (valoresNumericos.some((valor) => !Number.isFinite(valor) || valor < 0)) {
      this.mensagemErro.set('Os valores numéricos devem ser zero ou positivos.');
      return;
    }
    if (!Number.isInteger(this.formulario.quantidadeEstoque)) {
      this.mensagemErro.set('A quantidade em estoque deve ser um número inteiro.');
      return;
    }

    const editandoId = this.editandoId();
    const produto: NovoProduto = {
      ...this.formulario,
      fabricanteId,
      valorCompra: this.arredondarMoeda(this.formulario.valorCompra),
      valorVenda: this.arredondarMoeda(this.formulario.valorVenda),
      valorPromocional: this.arredondarMoeda(this.formulario.valorPromocional),
    };
    this.salvando.set(true);

    try {
      if (editandoId === null) {
        await firstValueFrom(this.produtoService.salvar(produto));
      } else {
        await firstValueFrom(this.produtoService.atualizar(editandoId, produto));
      }

      this.formulario = this.novoFormulario();
      this.editandoId.set(null);
      this.mensagemSucesso.set(
        editandoId === null ? 'Produto cadastrado com sucesso.' : 'Produto atualizado com sucesso.',
      );
      await this.carregarProdutos();
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(
          error,
          editandoId === null
            ? 'Não foi possível salvar o produto.'
            : 'Não foi possível atualizar o produto.',
        ),
      );
    } finally {
      this.salvando.set(false);
    }
  }

  editar(produto: Produto): void {
    this.editandoId.set(produto.id);
    this.formulario = {
      nome: produto.nome,
      cor: produto.cor,
      tamanho: produto.tamanho,
      genero: produto.genero,
      peso: produto.peso,
      tipoTecido: produto.tipoTecido,
      fabricanteId: produto.fabricanteId,
      gramatura: produto.gramatura,
      codigoBarras: produto.codigoBarras,
      qrCode: produto.qrCode,
      detalhes: produto.detalhes,
      valorCompra: this.arredondarMoeda(produto.valorCompra),
      valorVenda: this.arredondarMoeda(produto.valorVenda),
      valorPromocional: this.arredondarMoeda(produto.valorPromocional),
      quantidadeEstoque: produto.quantidadeEstoque,
      ativo: produto.ativo,
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

  atualizarValorMonetario(campo: CampoMonetario, valor: string): void {
    const digitos = this.digitos(valor);
    const valorNumerico = digitos ? Number(digitos) / 100 : 0;
    if (!Number.isFinite(valorNumerico)) {
      this.mensagemErro.set('O valor monetário informado é inválido.');
      return;
    }

    this.formulario = {
      ...this.formulario,
      [campo]: this.arredondarMoeda(valorNumerico),
    };
  }

  formatarMoeda(valor: number): string {
    return Number.isFinite(valor) ? this.formatadorMoeda.format(valor) : '';
  }

  nomeFabricante(fabricanteId: number): string {
    return (
      this.fabricantes().find((fabricante) => fabricante.id === fabricanteId)?.nome ??
      `ID ${fabricanteId}`
    );
  }

  private async carregarOpcoes(): Promise<void> {
    await Promise.all([
      this.carregarGeneros(),
      this.carregarTiposTecido(),
      this.carregarFabricantes(),
    ]);
  }

  private async carregarGeneros(): Promise<void> {
    try {
      this.generos.set(await firstValueFrom(this.produtoService.listarGeneros()));
    } catch (error: unknown) {
      this.mensagemErro.set(this.mensagemDaFalha(error, 'Não foi possível carregar os gêneros.'));
    }
  }

  private async carregarTiposTecido(): Promise<void> {
    try {
      this.tiposTecido.set(await firstValueFrom(this.produtoService.listarTiposTecido()));
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(error, 'Não foi possível carregar os tipos de tecido.'),
      );
    }
  }

  private async carregarFabricantes(): Promise<void> {
    try {
      this.fabricantes.set(await firstValueFrom(this.fabricanteService.listar()));
    } catch (error: unknown) {
      this.mensagemErro.set(
        this.mensagemDaFalha(error, 'Não foi possível carregar os fabricantes.'),
      );
    }
  }

  private novoFormulario(): ProdutoFormulario {
    return {
      nome: '',
      cor: '',
      tamanho: '',
      genero: '',
      peso: 0,
      tipoTecido: '',
      fabricanteId: null,
      gramatura: 0,
      codigoBarras: '',
      qrCode: '',
      detalhes: '',
      valorCompra: 0,
      valorVenda: 0,
      valorPromocional: 0,
      quantidadeEstoque: 0,
      ativo: true,
    };
  }

  private arredondarMoeda(valor: number): number {
    return Number(valor.toFixed(2));
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
