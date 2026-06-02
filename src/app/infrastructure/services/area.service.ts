import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Area } from '../../domain/models/area.model';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly api = inject(ApiService);

  getAreas(): Observable<any> {
    return this.api.get<any>('/areas');
  }

  getAreaPorId(id: number): Observable<any> {
    return this.api.get<any>(`/areas/${id}`);
  }

  crearArea(data: { nombre: string; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/areas', data);
  }

  actualizarArea(id: number, data: Partial<Area>): Observable<any> {
    return this.api.patch<any>(`/areas/${id}`, data);
  }

  eliminarArea(id: number): Observable<any> {
    return this.api.delete<any>(`/areas/${id}`);
  }
}
