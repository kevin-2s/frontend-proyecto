import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly api = inject(ApiService);

  getCategorias(): Observable<any> {
    return this.api.get<any>('/categorias');
  }

  crearCategoria(data: { nombre: string }): Observable<any> {
    return this.api.post<any>('/categorias', data);
  }

  actualizarCategoria(id: number, data: any): Observable<any> {
    return this.api.patch<any>(`/categorias/${id}`, data);
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.api.delete<any>(`/categorias/${id}`);
  }
}
