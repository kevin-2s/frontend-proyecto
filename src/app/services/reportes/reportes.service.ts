import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reportes`;

  getInventarioPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario`, {
      responseType: 'blob',
      headers: new HttpHeaders({ Accept: 'application/pdf' })
    });
  }

  getInventarioExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/inventario/excel`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        Accept:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
    });
  }
}
