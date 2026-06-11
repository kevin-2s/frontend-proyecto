import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly api = inject(ApiService);

  getAreas(): Observable<any> {
    return this.api.get<any>('/areas');
  }

  getArea(id: number): Observable<any> {
    return this.api.get<any>(`/areas/${id}`);
  }

  crearArea(data: { nombre: string; id_sede: number; estado?: boolean }): Observable<any> {
    return this.api.post<any>('/areas', data);
  }

  actualizarArea(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/areas/${id}`, data);
  }

  eliminarArea(id: number): Observable<any> {
    return this.api.delete<any>(`/areas/${id}`);
  }
}
