import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SolicitudService {
  private readonly api = inject(ApiService);

  getSolicitudes(): Observable<any> {
    return this.api.get<any>('/solicitudes');
  }

  crearSolicitud(data: { justificacion: string; usuarioId: number }): Observable<any> {
    return this.api.post<any>('/solicitudes', data);
  }

  actualizarEstado(id: number, data: { estadoSol: string }): Observable<any> {
    return this.api.put<any>(`/solicitudes/${id}`, data);
  }

  eliminarSolicitud(id: number): Observable<any> {
    return this.api.delete<any>(`/solicitudes/${id}`);
  }
}
