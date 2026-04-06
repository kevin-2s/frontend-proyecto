import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class FichaService {
  private readonly api = inject(ApiService);

  getFichas(): Observable<any> {
    return this.api.get<any>('/fichas');
  }

  crearFiscal(data: { numeroFiscal: string; programa: string }): Observable<any> {
    return this.api.post<any>('/fichas', data);
  }

  actualizarFiscal(id: number, data: any): Observable<any> {
    return this.api.put<any>(`/fichas/${id}`, data);
  }

  eliminarFiscal(id: number): Observable<any> {
    return this.api.delete<any>(`/fichas/${id}`);
  }
}
