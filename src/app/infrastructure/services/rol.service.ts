import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Rol } from '../../domain/models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/roles';
  
  getAll(): Observable<Rol[]> { 
    return this.api.get<Rol[]>(this.endpoint); 
  }

  getById(id: number): Observable<Rol> {
    return this.api.get<Rol>(`${this.endpoint}/${id}`);
  }
  
  create(data: { nombre: string }): Observable<Rol> { 
    return this.api.post<Rol>(this.endpoint, data); 
  }

  getPermisos(idRol: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${idRol}/permisos`);
  }

  asignarPermisos(idRol: number, idPermisos: number[]): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${idRol}/permisos`, { id_permisos: idPermisos });
  }

  getTodosLosPermisos(): Observable<any> {
    return this.api.get<any>('/permisos');
  }
}
