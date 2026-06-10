import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export interface Notificacion {
  id_notificacion: number;
  mensaje: string;
  leida: boolean;
  fecha: string;
  id_usuario: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly api = inject(ApiService);

  getNotificacionesUsuario(id_usuario: number): Observable<any> {
    return this.api.get<any>(`/notificaciones?id_usuario=${id_usuario}`);
  }

  marcarLeida(id_notificacion: number): Observable<any> {
    return this.api.patch<any>(`/notificaciones/${id_notificacion}/marcar-leida`, {});
  }

  crear(data: { mensaje: string; id_usuario: number }): Observable<any> {
    return this.api.post<any>('/notificaciones', data);
  }
}
