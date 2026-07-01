import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly api = inject(ApiService);

  getSolicitudes(): Observable<any> {
    return this.api.get<any>('/solicitudes');
  }

  getSolicitudPorId(id: number): Observable<any> {
    return this.api.get<any>(`/solicitudes/${id}`);
  }

  // id_usuario lo inyecta el backend desde el JWT — no se envía en el body
  crearSolicitud(data: {
    tipo: string;
    id_producto: number;
    cantidad: number;
    observacion?: string;
    id_ficha?: number;
  }): Observable<any> {
    return this.api.post<any>('/solicitudes', data);
  }

  aprobar(id: number): Observable<any> {
    return this.api.patch<any>(`/solicitudes/${id}/aprobar`, {});
  }

  rechazar(id: number): Observable<any> {
    return this.api.patch<any>(`/solicitudes/${id}/rechazar`, {});
  }

  entregar(id: number): Observable<any> {
    return this.api.patch<any>(`/solicitudes/${id}/entregar`, {});
  }

  eliminarSolicitud(id: number): Observable<any> {
    return this.api.delete<any>(`/solicitudes/${id}`);
  }
}
