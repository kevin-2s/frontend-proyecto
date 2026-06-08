import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CentroService {
  private readonly api = inject(ApiService);

  getCentros(): Observable<any> {
    return this.api.get<any>('/centros');
  }

  getCentro(id: number): Observable<any> {
    return this.api.get<any>(`/centros/${id}`);
  }

  crearCentro(data: { nombre: string; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/centros', data);
  }

  actualizarCentro(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/centros/${id}`, data);
  }

  eliminarCentro(id: number): Observable<any> {
    return this.api.delete<any>(`/centros/${id}`);
  }
}
