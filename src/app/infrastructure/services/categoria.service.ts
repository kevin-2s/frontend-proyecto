import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly api = inject(ApiService);
  
  getCategorias(): Observable<any> { 
    return this.api.get<any>('/categoria'); 
  }
  
  crearCategoria(data: { nombreCat: string }): Observable<any> { 
    return this.api.post<any>('/categoria', data); 
  }
}
