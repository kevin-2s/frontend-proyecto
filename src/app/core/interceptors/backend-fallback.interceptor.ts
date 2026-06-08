import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import { environment } from '../../../environments/environment';

const backends = [
  environment.apiUrl,             // Local (Principal) configurable
  'http://187.124.69.191:3000'   // VPS (Respaldo)
];

// Recuperamos el backend que estaba funcionando la última vez (Forzado a 0 por ahora para asegurar Local)
const storedIndex = localStorage.getItem('activeBackendIndex');
let activeBackendIndex = 0; // Forzamos a local

export const backendFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedUrl = req.url;
  
  backends.forEach(url => {
    if (modifiedUrl.startsWith(url)) {
      modifiedUrl = modifiedUrl.replace(url, backends[activeBackendIndex]);
    }
  });

  const clonedReq = req.clone({ url: modifiedUrl });

  // Agregamos un timeout de 4 segundos. Si el servidor está apagado, fallará rápido en lugar de esperar 20+ segundos.
  return next(clonedReq).pipe(
    timeout(4000),
    catchError((error: any) => {
      // Si el error es de red (status 0) o si fue por Timeout
      if (error instanceof TimeoutError || (error instanceof HttpErrorResponse && error.status === 0)) {
        console.warn(`[Backend Fallback] Falló la conexión con ${backends[activeBackendIndex]} (Timeout/Desconectado).`);
        
        // Cambiamos al siguiente backend
        activeBackendIndex = (activeBackendIndex + 1) % backends.length;
        localStorage.setItem('activeBackendIndex', activeBackendIndex.toString());
        
        console.info(`[Backend Fallback] Reintentando rápido con: ${backends[activeBackendIndex]}...`);
        
        let retryUrl = req.url;
        backends.forEach(url => {
          if (retryUrl.startsWith(url)) {
            retryUrl = retryUrl.replace(url, backends[activeBackendIndex]);
          }
        });

        // Este segundo intento no tiene timeout forzado para permitir cargas pesadas si el server responde
        const retryReq = req.clone({ url: retryUrl });
        return next(retryReq);
      }
      
      return throwError(() => error);
    })
  );
};
