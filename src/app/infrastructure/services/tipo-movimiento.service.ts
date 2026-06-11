import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TipoMovimientoService {
  private readonly api = inject(ApiService);

  getAll(): Observable<any> {
    return this.api.get<any>('/tipo-movimiento');
  }

  create(data: { nombre: string }): Observable<any> {
    return this.api.post<any>('/tipo-movimiento', data);
  }
}
