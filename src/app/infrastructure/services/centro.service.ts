import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Centro } from '../../domain/models/centro.model';

@Injectable({ providedIn: 'root' })
export class CentroService {
  private readonly api = inject(ApiService);

  getCentros(): Observable<any> {
    return this.api.get<any>('/centros');
  }

  getCentroPorId(id: number): Observable<any> {
    return this.api.get<any>(`/centros/${id}`);
  }

  crearCentro(data: { nombre: string; codigo: string; regional: string; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/centros', data);
  }

  actualizarCentro(id: number, data: Partial<Centro>): Observable<any> {
    return this.api.patch<any>(`/centros/${id}`, data);
  }

  eliminarCentro(id: number): Observable<any> {
    return this.api.delete<any>(`/centros/${id}`);
  }
}
