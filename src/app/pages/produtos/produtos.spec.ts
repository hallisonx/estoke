import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Fabricante } from '../../models/fabricante.model';
import { NovoProduto, Produto } from '../../models/produto.model';
import { AUTH_API_BASE_URL } from '../../services/auth.service';
import { Produtos } from './produtos';

describe('Produtos', () => {
  let fixture: ComponentFixture<Produtos>;
  let component: Produtos;
  let httpTesting: HttpTestingController;

  const fabricante: Fabricante = {
    id: 7,
    nome: 'Fabricante A',
    cnpj: '11222333000181',
    estado: 'PB',
    cidade: 'João Pessoa',
    telefone: '83999999999',
  };

  const produto: Produto = {
    id: 1,
    nome: 'Camiseta básica',
    cor: 'Azul-marinho',
    tamanho: 'M',
    genero: 'Feminino',
    peso: 0.25,
    tipoTecido: 'Algodão',
    fabricanteId: 7,
    gramatura: 180,
    codigoBarras: '7891234567890',
    qrCode: 'produto-camiseta-001',
    detalhes: 'Camiseta básica de manga curta',
    valorCompra: 25.5,
    valorVenda: 59.9,
    valorPromocional: 49.9,
    quantidadeEstoque: 20,
    ativo: true,
  };
  const novoProduto: NovoProduto = (({ id, ...dados }) => dados)(produto);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Produtos],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Produtos);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  async function carregarDadosIniciais(produtos: Produto[]): Promise<void> {
    fixture.detectChanges();

    const produtoRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    produtoRequest.flush(produtos);

    const generoRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/generos`);
    generoRequest.flush(['Feminino', 'Masculino']);

    const tecidoRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/tipos-tecido`);
    tecidoRequest.flush(['Algodão', 'Linho']);

    const fabricanteRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    fabricanteRequest.flush([fabricante]);

    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('loads reference options and creates a product', async () => {
    await carregarDadosIniciais([]);

    expect(component.generos()).toEqual(['Feminino', 'Masculino']);
    expect(component.tiposTecido()).toEqual(['Algodão', 'Linho']);
    expect(component.fabricantes()).toEqual([fabricante]);
    expect(fixture.nativeElement.textContent).toContain('XGG');
    expect(fixture.nativeElement.querySelector('textarea[name="detalhes"]').rows).toBe(4);
    expect(fixture.nativeElement.querySelector('input[name="codigoBarras"]').maxLength).toBe(200);
    expect(fixture.nativeElement.querySelector('textarea[name="detalhes"]').maxLength).toBe(400);

    component.formulario = { ...novoProduto };
    component.atualizarValorMonetario('valorCompra', '2550');
    component.atualizarValorMonetario('valorVenda', '5990');
    component.atualizarValorMonetario('valorPromocional', '4990');

    const saving = component.salvar();
    const createRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual(novoProduto);
    createRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    refreshRequest.flush([produto]);
    await saving;

    expect(component.mensagemSucesso()).toBe('Produto cadastrado com sucesso.');
    expect(component.produtos()).toEqual([produto]);
  });

  it('fills the form and updates the selected product', async () => {
    await carregarDadosIniciais([produto]);

    component.editar(produto);
    expect(component.editandoId()).toBe(produto.id);
    expect(component.formulario.fabricanteId).toBe(fabricante.id);
    expect(component.formatarMoeda(component.formulario.valorVenda)).toContain('59,90');

    component.formulario.nome = 'Camiseta atualizada';
    const saving = component.salvar();
    const updateRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos/${produto.id}`);
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      ...novoProduto,
      nome: 'Camiseta atualizada',
    });
    updateRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    refreshRequest.flush([{ ...produto, nome: 'Camiseta atualizada' }]);
    await saving;

    expect(component.editandoId()).toBeNull();
    expect(component.mensagemSucesso()).toBe('Produto atualizado com sucesso.');
  });
});
