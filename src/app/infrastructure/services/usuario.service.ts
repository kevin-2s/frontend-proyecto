import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Usuario } from '../../domain/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/usuarios';

  getAll(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.endpoint);
  }

  getById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.endpoint}/${id}`);
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, usuario);
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.api.patch<Usuario>(`${this.endpoint}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getPermisos(idUsuario: number): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/${idUsuario}/permisos`);
  }

  asignarPermiso(idUsuario: number, idPermiso: number, activo: boolean): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/${idUsuario}/permisos`, { id_permiso: idPermiso, activo });
  }
}
