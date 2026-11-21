import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AUTH_API_BASE_URL } from '../../services/auth.service';
import { Clientes } from './clientes';

describe('Clientes', () => {
  let fixture: ComponentFixture<Clientes>;
  let component: Clientes;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Clientes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Clientes);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads and saves clients with CPF and telephone digits only', async () => {
    fixture.detectChanges();
    const initialRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    expect(initialRequest.request.method).toBe('GET');
    initialRequest.flush([]);
    await fixture.whenStable();

    component.formulario = {
      cpf: '123.456.789-00',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '(83) 99999-9999',
      ativo: true,
    };

    const saving = component.salvar();
    const createRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      cpf: '12345678900',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '83999999999',
      ativo: true,
    });
    createRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush([
      {
        id: 1,
        cpf: '12345678900',
        nome: 'Maria Silva',
        dataNascimento: '1990-01-15',
        enderecoResidencial: 'Rua A',
        enderecoTrabalho: 'Rua B',
        telefone: '83999999999',
        ativo: true,
        dataCadastro: '2026-01-10T12:00:00',
      },
    ]);
    await saving;
    fixture.detectChanges();

    expect(component.mensagemSucesso()).toBe('Cliente cadastrado com sucesso.');
    expect(component.clientes()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Maria Silva');
    expect(fixture.nativeElement.textContent).toContain('123.456.789-00');
    expect(fixture.nativeElement.textContent).toContain('(83) 99999-9999');
    expect(fixture.nativeElement.textContent).toContain('15/01/1990');
    expect(fixture.nativeElement.textContent).toContain('10/01/2026');
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Editar cliente Maria Silva"]'),
    ).not.toBeNull();
  });

  it('fills the form and updates the selected client', async () => {
    fixture.detectChanges();
    const listRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    const cliente = {
      id: 42,
      cpf: '12345678900',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15T00:00:00',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '83999999999',
      ativo: true,
      dataCadastro: '2026-01-10T12:00:00',
    };
    listRequest.flush([cliente]);
    await fixture.whenStable();
    fixture.detectChanges();

    component.editar(cliente);
    expect(component.editandoId()).toBe(42);
    expect(component.formulario).toEqual({
      cpf: '123.456.789-00',
      nome: 'Maria Silva',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '(83) 99999-9999',
      ativo: true,
    });

    component.formulario.nome = 'Maria Atualizada';
    const saving = component.salvar();
    const updateRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes/42`);
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      cpf: '12345678900',
      nome: 'Maria Atualizada',
      dataNascimento: '1990-01-15',
      enderecoResidencial: 'Rua A',
      enderecoTrabalho: 'Rua B',
      telefone: '83999999999',
      ativo: true,
    });
    updateRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/clientes`);
    refreshRequest.flush([
      {
        ...cliente,
        nome: 'Maria Atualizada',
      },
    ]);
    await saving;

    expect(component.editandoId()).toBeNull();
    expect(component.mensagemSucesso()).toBe('Cliente atualizado com sucesso.');
  });

  it('formats CPF, telephone and ISO dates', () => {
    expect(component.formatarCpf('123abc45678900')).toBe('123.456.789-00');
    expect(component.formatarTelefone('83999999999')).toBe('(83) 99999-9999');
    expect(component.formatarData('1990-01-15')).toBe('15/01/1990');
    expect(component.formatarData('2026-01-10T12:00:00')).toBe('10/01/2026');
  });

  it('does not save CPF or telephone with an invalid number of digits', async () => {
    component.formulario.cpf = '123.456';
    component.formulario.telefone = '(83) 123';

    await component.salvar();

    httpTesting.expectNone(`${AUTH_API_BASE_URL}/clientes`);
    expect(component.mensagemErro()).toBe('O CPF deve conter 11 números.');
  });
});
