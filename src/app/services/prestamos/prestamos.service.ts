import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Prestamo {
  id_prestamo?: number;
  id_item: number;
  id_usuario: number;
  id_ficha?: number;
  fecha_prestamo?: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real?: string;
  estado?: string;
  estado_devolucion?: string;
  observacion?: string;
  observacion_devolucion?: string;
  item?: any;
  usuario?: any;
}

export interface RegistrarDevolucionDto {
  estado_devolucion: string;
  observacion_devolucion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prestamos`;

  getAll(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(this.apiUrl);
  }

  getActivos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.apiUrl}/activos`);
  }

  getById(id: number): Observable<Prestamo> {
    return this.http.get<Prestamo>(`${this.apiUrl}/${id}`);
  }

  create(prestamo: Partial<Prestamo>): Observable<Prestamo> {
    return this.http.post<Prestamo>(this.apiUrl, prestamo);
  }

  registrarDevolucion(id: number, dto: RegistrarDevolucionDto): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.apiUrl}/${id}/devolver`, dto);
  }
}
