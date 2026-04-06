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
}
