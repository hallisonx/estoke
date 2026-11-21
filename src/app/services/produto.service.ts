import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NovoProduto, Produto } from '../models/produto.model';
import { AUTH_API_BASE_URL } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${AUTH_API_BASE_URL}/produtos`;

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.endpoint);
  }

  listarGeneros(): Observable<string[]> {
    return this.http.get<string[]>(`${AUTH_API_BASE_URL}/generos`);
  }

  listarTiposTecido(): Observable<string[]> {
    return this.http.get<string[]>(`${AUTH_API_BASE_URL}/tipos-tecido`);
  }

  salvar(produto: NovoProduto): Observable<void> {
    return this.http.post<void>(this.endpoint, produto);
  }

  atualizar(id: number, produto: NovoProduto): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, produto);
  }
}
