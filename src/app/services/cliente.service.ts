import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AUTH_API_BASE_URL } from './auth.service';
import { Cliente, NovoCliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${AUTH_API_BASE_URL}/clientes`;

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.endpoint);
  }

  criar(cliente: NovoCliente): Observable<void> {
    return this.http.post<void>(this.endpoint, cliente);
  }

  atualizar(id: number, cliente: NovoCliente): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, cliente);
  }
}
