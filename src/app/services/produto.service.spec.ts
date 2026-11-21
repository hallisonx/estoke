import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NovoProduto, Produto } from '../models/produto.model';
import { AUTH_API_BASE_URL } from './auth.service';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProdutoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('lists products and their selection options', () => {
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
    let response: Produto[] | undefined;

    service.listar().subscribe((produtos) => {
      response = produtos;
    });
    service.listarGeneros().subscribe();
    service.listarTiposTecido().subscribe();

    const productRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    expect(productRequest.request.method).toBe('GET');
    productRequest.flush([produto]);

    const genderRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/generos`);
    expect(genderRequest.request.method).toBe('GET');
    genderRequest.flush(['Feminino', 'Masculino']);

    const fabricRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/tipos-tecido`);
    expect(fabricRequest.request.method).toBe('GET');
    fabricRequest.flush(['Algodão', 'Linho']);

    expect(response).toEqual([produto]);
  });

  it('creates products with POST /produtos', () => {
    const produto: NovoProduto = {
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
    service.salvar(produto).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(produto);
    request.flush(null);
  });

  it('updates products with PUT /produtos/{id}', () => {
    const produto: NovoProduto = {
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
    service.atualizar(1, produto).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/produtos/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(produto);
    request.flush(null);
  });
});
