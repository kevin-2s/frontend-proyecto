import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SitioService {
  private readonly api = inject(ApiService);

  getSitios(): Observable<any> {
    return this.api.get<any>('/sitios');
  }

  crearSitio(data: { nombre: string; tipo: string; id_responsable?: number | null; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/sitios', data);
  }

  actualizarSitio(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/sitios/${id}`, data);
  }

  eliminarSitio(id: number): Observable<any> {
    return this.api.delete<any>(`/sitios/${id}`);
  }
}
