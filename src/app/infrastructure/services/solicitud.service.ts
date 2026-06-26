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

  crearSolicitud(data: {
    tipo: string;
    id_producto: number;
    cantidad: number;
    observacion?: string;
    id_usuario: number;
    id_ficha?: number;
  }): Observable<any> {
    return this.api.post<any>('/solicitudes', data);
  }

  actualizarEstado(id: number, data: { estadoSol: string; id_usuario_aprueba?: number }): Observable<any> {
    const userId = data.id_usuario_aprueba ?? 1;
    if (data.estadoSol === 'APROBADA') {
      return this.api.patch<any>(`/solicitudes/${id}/aprobar`, { id_usuario_aprueba: userId });
    } else if (data.estadoSol === 'RECHAZADA') {
      return this.api.patch<any>(`/solicitudes/${id}/rechazar`, { id_usuario_aprueba: userId });
    } else if (data.estadoSol === 'ENTREGADA') {
      return this.api.patch<any>(`/solicitudes/${id}/entregar`, {});
    }
    return this.api.put<any>(`/solicitudes/${id}`, data);
  }

  eliminarSolicitud(id: number): Observable<any> {
    return this.api.delete<any>(`/solicitudes/${id}`);
  }
}
