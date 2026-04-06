import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly api = inject(ApiService);
  
  getMovimientos(): Observable<any> { 
    return this.api.get<any>('/movimientos'); 
  }
  
  crearMovimiento(data: any): Observable<any> { 
    return this.api.post<any>('/movimientos', data); 
  }
}
