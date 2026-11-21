import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Fabricante, NovoFabricante } from '../models/fabricante.model';
import { AUTH_API_BASE_URL } from './auth.service';
import { FabricanteService } from './fabricante.service';

describe('FabricanteService', () => {
  let service: FabricanteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FabricanteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('lists manufacturers from GET /fabricantes', () => {
    const fabricante: Fabricante = {
      id: 1,
      nome: 'Fabricante A',
      cnpj: '11222333000181',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '83999999999',
    };
    let response: Fabricante[] | undefined;

    service.listar().subscribe((fabricantes) => {
      response = fabricantes;
    });

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(request.request.method).toBe('GET');
    request.flush([fabricante]);

    expect(response).toEqual([fabricante]);
  });

  it('saves a manufacturer with POST /fabricantes', () => {
    const fabricante: NovoFabricante = {
      nome: 'Fabricante A',
      cnpj: '11222333000181',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '83999999999',
    };
    service.salvar(fabricante).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(fabricante);
    request.flush(null);
  });

  it('updates a manufacturer with PUT /fabricantes/{id}', () => {
    const fabricante: NovoFabricante = {
      nome: 'Fabricante A',
      cnpj: '11222333000181',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '83999999999',
    };
    service.atualizar(1, fabricante).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes/1`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(fabricante);
    request.flush(null);
  });
});
