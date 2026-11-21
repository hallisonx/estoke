import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fabricante, NovoFabricante } from '../models/fabricante.model';
import { AUTH_API_BASE_URL } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FabricanteService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${AUTH_API_BASE_URL}/fabricantes`;

  listar(): Observable<Fabricante[]> {
    return this.http.get<Fabricante[]>(this.endpoint);
  }

  salvar(fabricante: NovoFabricante): Observable<void> {
    return this.http.post<void>(this.endpoint, fabricante);
  }

  atualizar(id: number, fabricante: NovoFabricante): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, fabricante);
  }
}
