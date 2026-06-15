import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class NovedadService {
  private readonly api = inject(ApiService);

  getNovedades(): Observable<any> {
    return this.api.get<any>('/novedades');
  }

  getNovedadesPorItem(id_item: number): Observable<any> {
    return this.api.get<any>(`/novedades/item/${id_item}`);
  }

  crearNovedad(data: any): Observable<any> {
    return this.api.post<any>('/novedades', data);
  }

  actualizarEstado(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/novedades/${id}`, data);
  }

  eliminar(id: number): Observable<any> {
    return this.api.delete<any>(`/novedades/${id}`);
  }
}
