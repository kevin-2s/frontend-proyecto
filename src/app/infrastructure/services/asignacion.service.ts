import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AsignacionService {
  private readonly api = inject(ApiService);

  getAsignaciones(): Observable<any> {
    return this.api.get<any>('/asignaciones');
  }

  crearAsignacion(data: {
    id_ficha: number;
    id_producto: number;
    cantidad: number;
    id_usuario_asigna: number;
    observacion?: string;
    id_items?: number[];
  }): Observable<any> {
    return this.api.post<any>('/asignaciones', data);
  }

  anular(id: number): Observable<any> {
    return this.api.patch<any>(`/asignaciones/${id}/anular`, {});
  }

  agregarItemAAsignacion(id_asignacion: number, id_item: number): Observable<any> {
    return this.api.post<any>(`/asignaciones/${id_asignacion}/items`, { id_item });
  }

  eliminar(id: number): Observable<any> {
    return this.api.delete<any>(`/asignaciones/${id}`);
  }
}
