import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TrasladoService {
  private readonly api = inject(ApiService);

  getTraslados(): Observable<any> {
    return this.api.get<any>('/traslados');
  }

  crearTraslado(data: {
    id_item: number;
    id_sitio_destino: number;
    justificacion?: string;
    id_usuario_solicita: number;
  }): Observable<any> {
    return this.api.post<any>('/traslados', data);
  }

  aprobar(id: number, id_usuario_aprueba: number): Observable<any> {
    return this.api.patch<any>(`/traslados/${id}/aprobar`, { id_usuario_aprueba });
  }

  rechazar(id: number, id_usuario_aprueba: number, observacion_resolucion?: string): Observable<any> {
    return this.api.patch<any>(`/traslados/${id}/rechazar`, { id_usuario_aprueba, observacion_resolucion });
  }
}
