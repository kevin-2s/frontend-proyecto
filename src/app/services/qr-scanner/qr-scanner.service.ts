import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/qr`;

  validateCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate`, { code });
  }
}
