import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_API_BASE_URL } from './auth.service';
import { ClienteService } from './cliente.service';
import { Cliente, NovoCliente } from '../models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClienteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('consults the client list', () => {
    const cliente: Cliente = {
      id: 1,
      cpf: '12345678900',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '11999990000',
      ativo: true,
      dataCadastro: '2026-01-10T12:00:00',
    };
    let response: Cliente[] | undefined;

    service.listar().subscribe((clientes) => {
      response = clientes;
    });

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    expect(request.request.method).toBe('GET');
    request.flush([cliente]);

    expect(response).toEqual([cliente]);
  });

  it('saves a client without server-generated fields', () => {
    const novoCliente: NovoCliente = {
      cpf: '12345678900',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '11999990000',
      ativo: true,
    };
    service.criar(novoCliente).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(novoCliente);
    request.flush(null);
  });

  it('updates a client with PUT /clientes/{id}', () => {
    const cliente: NovoCliente = {
      cpf: '12345678900',
      nome: 'Maria Atualizada',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '83999999999',
      ativo: true,
    };
    service.atualizar(42, cliente).subscribe();

    const request = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes/42`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(cliente);
    request.flush(null);
  });
});
