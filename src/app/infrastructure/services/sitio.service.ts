import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SitioService {
  private readonly api = inject(ApiService);

  getSitios(): Observable<any> {
    return this.api.get<any>('/sitios');
  }

  crearSitio(data: { nombreSitio: string; tipo: string; responsableId: number }): Observable<any> {
    return this.api.post<any>('/sitios', data);
  }

  actualizarSitio(id: number, data: any): Observable<any> {
    return this.api.put<any>(`/sitios/${id}`, data);
  }

  eliminarSitio(id: number): Observable<any> {
    return this.api.delete<any>(`/sitios/${id}`);
  }
}
