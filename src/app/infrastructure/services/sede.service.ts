import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Sede } from '../../domain/models/sede.model';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly api = inject(ApiService);

  getSedes(): Observable<any> {
    return this.api.get<any>('/sedes');
  }

  getSedePorId(id: number): Observable<any> {
    return this.api.get<any>(`/sedes/${id}`);
  }

  crearSede(data: { nombre: string; direccion: string; id_centro: number; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/sedes', data);
  }

  actualizarSede(id: number, data: Partial<Sede>): Observable<any> {
    return this.api.patch<any>(`/sedes/${id}`, data);
  }

  eliminarSede(id: number): Observable<any> {
    return this.api.delete<any>(`/sedes/${id}`);
  }
}
