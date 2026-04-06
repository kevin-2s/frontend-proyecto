import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly api = inject(ApiService);
  
  getInventarios(): Observable<any> { 
    return this.api.get<any>('/inventario'); 
  }
  
  crearInventario(data: any): Observable<any> { 
    return this.api.post<any>('/inventario', data); 
  }
}
