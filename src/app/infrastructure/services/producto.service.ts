import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly api = inject(ApiService);

  getProductos(): Observable<any> {
    return this.api.get<any>('/productos');
  }

  crearProducto(data: any): Observable<any> {
    return this.api.post<any>('/productos', data);
  }

  actualizarProducto(id: number, data: any): Observable<any> {
    return this.api.put<any>(`/productos/${id}`, data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.api.delete<any>(`/productos/${id}`);
  }

  eliminarMultiples(ids: number[]): Observable<any> {
    return this.api.post<any>('/productos/bulk-delete', { ids });
  }
}
