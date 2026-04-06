import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class FichaService {
  private readonly api = inject(ApiService);
  
  getFichas(): Observable<any> { 
    return this.api.get<any>('/fichas'); 
  }
  
  crearFicha(data: { numeroFicha: string, programa: string }): Observable<any> { 
    return this.api.post<any>('/fichas', data); 
  }
}
