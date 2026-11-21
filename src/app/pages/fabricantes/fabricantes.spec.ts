import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AUTH_API_BASE_URL } from '../../services/auth.service';
import { Fabricantes } from './fabricantes';

describe('Fabricantes', () => {
  let fixture: ComponentFixture<Fabricantes>;
  let component: Fabricantes;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fabricantes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Fabricantes);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads and saves manufacturers', async () => {
    fixture.detectChanges();
    const initialRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(initialRequest.request.method).toBe('GET');
    initialRequest.flush([]);
    await fixture.whenStable();

    component.formulario = {
      nome: 'Fabricante A',
      cnpj: '11.222.333/0001-81',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '(83) 99999-9999',
    };

    const saving = component.salvar();
    const createRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body).toEqual({
      ...component.formulario,
      cnpj: '11222333000181',
      telefone: '83999999999',
    });
    createRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush([
      {
        id: 1,
        nome: 'Fabricante A',
        cnpj: '11222333000181',
        estado: 'PB',
        cidade: 'João Pessoa',
        telefone: '83999999999',
      },
    ]);
    await saving;
    fixture.detectChanges();

    expect(component.mensagemSucesso()).toBe('Fabricante cadastrado com sucesso.');
    expect(component.fabricantes()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Fabricante A');
    expect(fixture.nativeElement.textContent).toContain('11.222.333/0001-81');
    expect(fixture.nativeElement.textContent).toContain('(83) 99999-9999');
    expect(fixture.nativeElement.querySelector('select[name="estado"]')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Paraíba (PB)');
    expect(
      fixture.nativeElement.querySelector('button[aria-label="Editar fabricante Fabricante A"]'),
    ).not.toBeNull();
  });

  it('fills the form and updates the selected manufacturer', async () => {
    fixture.detectChanges();
    const listRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    listRequest.flush([
      {
        id: 42,
        nome: 'Fabricante A',
        cnpj: '11222333000181',
        estado: 'PB',
        cidade: 'João Pessoa',
        telefone: '83999999999',
      },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();

    component.editar(component.fabricantes()[0]);
    expect(component.editandoId()).toBe(42);
    expect(component.formulario).toEqual({
      nome: 'Fabricante A',
      cnpj: '11.222.333/0001-81',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '(83) 99999-9999',
    });

    component.formulario.nome = 'Fabricante Atualizado';
    const saving = component.salvar();
    const updateRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes/42`);
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual({
      nome: 'Fabricante Atualizado',
      cnpj: '11222333000181',
      estado: 'PB',
      cidade: 'João Pessoa',
      telefone: '83999999999',
    });
    updateRequest.flush(null);
    await Promise.resolve();

    const refreshRequest = httpTesting.expectOne(`${AUTH_API_BASE_URL}/fabricantes`);
    refreshRequest.flush([
      {
        id: 42,
        nome: 'Fabricante Atualizado',
        cnpj: '11222333000181',
        estado: 'PB',
        cidade: 'João Pessoa',
        telefone: '83999999999',
      },
    ]);
    await saving;

    expect(component.editandoId()).toBeNull();
    expect(component.mensagemSucesso()).toBe('Fabricante atualizado com sucesso.');
  });

  it('formats and validates numeric and alphanumeric CNPJs', () => {
    expect(component.formatarCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(component.formatarCnpj('12abc34501de35')).toBe('12.ABC.345/01DE-35');
    expect(component.formatarTelefone('83999999999')).toBe('(83) 99999-9999');
    expect(component.formatarTelefone('ab83999999999cd')).toBe('(83) 99999-9999');
    expect(component.validarCnpj('11.222.333/0001-81')).toBe(true);
    expect(component.validarCnpj('12.ABC.345/01DE-35')).toBe(true);
    expect(component.validarCnpj('11.222.333/0001-82')).toBe(false);
  });

  it('does not send an invalid CNPJ to the API', async () => {
    component.formulario.cnpj = '11.222.333/0001-82';
    component.formulario.telefone = '(83) 99999-9999';

    await component.salvar();

    httpTesting.expectNone(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(component.mensagemErro()).toBe('Informe um CNPJ válido.');
  });

  it('does not save a phone number with an invalid number of digits', async () => {
    component.formulario.cnpj = '11.222.333/0001-81';
    component.formulario.telefone = '(83) 9999';

    await component.salvar();

    httpTesting.expectNone(`${AUTH_API_BASE_URL}/fabricantes`);
    expect(component.mensagemErro()).toBe('O telefone deve conter 11 números.');
  });
});
