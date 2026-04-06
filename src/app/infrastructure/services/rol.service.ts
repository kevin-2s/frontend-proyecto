import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly api = inject(ApiService);
  
  getRoles(): Observable<any> { 
    return this.api.get<any>('/roles'); 
  }
  
  crearRol(data: { nombreRol: string }): Observable<any> { 
    return this.api.post<any>('/roles', data); 
  }
}
