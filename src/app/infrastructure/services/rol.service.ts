import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly api = inject(ApiService);

  getRoles(): Observable<any> {
    return this.api.get<any>('/roles');
  }

  crearRol(data: { nombreRol: string }): Observable<any> {
    return this.api.post<any>('/roles', data);
  }

  actualizarRol(id: number, data: any): Observable<any> {
    return this.api.put<any>(`/roles/${id}`, data);
  }

  eliminarRol(id: number): Observable<any> {
    return this.api.delete<any>(`/roles/${id}`);
  }
}
