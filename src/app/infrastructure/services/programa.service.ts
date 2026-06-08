import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ProgramaService {
  private readonly api = inject(ApiService);

  getProgramas(): Observable<any> {
    return this.api.get<any>('/programas');
  }

  getPrograma(id: number): Observable<any> {
    return this.api.get<any>(`/programas/${id}`);
  }

  crearPrograma(data: { codigo: string; nombre: string; id_area: number; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/programas', data);
  }

  actualizarPrograma(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/programas/${id}`, data);
  }

  eliminarPrograma(id: number): Observable<any> {
    return this.api.delete<any>(`/programas/${id}`);
  }
}
