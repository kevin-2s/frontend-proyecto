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
    return this.api.patch<any>(`/productos/${id}`, data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.api.delete<any>(`/productos/${id}`);
  }

  eliminarMultiples(ids: number[]): Observable<any> {
    return this.api.post<any>('/productos/bulk-delete', { ids });
  }

  getItemsByProducto(id_producto: number): Observable<any> {
    return this.api.get<any>(`/items?id_producto=${id_producto}`);
  }

  getAllItems(): Observable<any> {
    return this.api.get<any>('/items');
  }

  crearItem(data: any): Observable<any> {
    return this.api.post<any>('/items', data);
  }

  agregarItemAProducto(id_producto: number, placa_sena?: string): Observable<any> {
    return this.api.post<any>(`/productos/${id_producto}/items`, placa_sena ? { placa_sena } : {});
  }

  actualizarItem(id_item: number, data: { placa_sena?: string | null }): Observable<any> {
    return this.api.patch<any>(`/items/${id_item}`, data);
  }

  buscarItemPorPlaca(placa: string): Observable<any> {
    return this.api.get<any>(`/items/buscar/${encodeURIComponent(placa)}`);
  }
}
