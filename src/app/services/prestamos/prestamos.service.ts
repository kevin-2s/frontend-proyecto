import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Prestamo {
  id_prestamo: number;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real: string | null;
  estado: 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';
  observacion: string | null;
  id_item: number;
  id_usuario_solicitante: number;
  id_usuario_responsable: number;
  item?: any;
  usuario_solicitante?: any;
  usuario_responsable?: any;
}

export interface CreatePrestamoDto {
  fecha_devolucion_esperada: string;
  observacion?: string;
  id_item: number;
  id_usuario_solicitante: number;
  id_usuario_responsable: number;
}

@Injectable({ providedIn: 'root' })
export class PrestamosService {
  private apiUrl = `${environment.apiUrl}/prestamos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<{ data: Prestamo[] }> {
    return this.http.get<{ data: Prestamo[] }>(this.apiUrl);
  }

  getActivos(): Observable<{ data: Prestamo[] }> {
    return this.http.get<{ data: Prestamo[] }>(`${this.apiUrl}/activos`);
  }

  create(dto: CreatePrestamoDto): Observable<{ data: Prestamo }> {
    return this.http.post<{ data: Prestamo }>(this.apiUrl, dto);
  }

  registrarDevolucion(id: number, observacion?: string): Observable<{ data: Prestamo }> {
    return this.http.patch<{ data: Prestamo }>(`${this.apiUrl}/${id}/devolucion`, { observacion });
  }
}
