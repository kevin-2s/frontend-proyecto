import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Usuario } from '../../domain/models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/users';

  getUsuarios(): Observable<any> {
    return this.api.get<any>(this.endpoint);
  }

  crearUsuario(usuario: Omit<Usuario, 'id'>): Observable<Usuario> {
    return this.api.post<Usuario>(this.endpoint, usuario);
  }
}
