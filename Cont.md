# Contexto y Conexión Backend - Frontend (Angular)

Este documento contiene toda la información, estructura de endpoints y modelos de datos (Interfaces de TypeScript) expuestos por el backend NestJS (SGM Backend API) para su correcta conexión y consumo desde el frontend en Angular.

## 1. Configuración Global

*   **URL Base (Producción/VPS):** `http://187.124.69.191:3000` (Según `environment.ts`)
*   **URL Base (Local):** `http://localhost:3000`
*   **Prefijo Global API:** Ninguno. Las rutas van directamente después del puerto (ej: `/auth/login`, `/users`). *(Nota: Anteriormente había un prefijo `/api` que fue removido).*
*   **CORS:** Habilitado para todos los orígenes y métodos (`GET,HEAD,PUT,PATCH,POST,DELETE`), incluyendo credenciales verdaderas.

## 2. Autenticación y Autorización

*   **Mecanismo:** JWT (JSON Web Token).
*   **Envío del Token:** Cabecera HTTP `Authorization: Bearer <TU_TOKEN_JWT>`.
*   **Interceptor en Angular:** Asegúrate de que tu `AuthInterceptor` (`src/app/core/interceptors/auth.interceptor.ts`) adjunte el token JWT a todas las peticiones salientes (excepto a `/auth/login`).

## 3. Endpoints Disponibles

La mayoría de los recursos cuentan con un estándar REST (ej. `GET /recurso` paginado, `GET /recurso/:id`, `POST /recurso`).

| Módulo | Endpoint Base | Métodos Documentados | Descripción |
| :--- | :--- | :--- | :--- |
| **Auth** | `/auth/login` | `POST` | Autenticación. Recibe `correo` y `contrasena`. Devuelve JWT. |
| **Roles** | `/roles` | `GET`, `POST`, `GET /:id` | Gestión de roles del sistema. |
| **Usuarios** | `/users` | `GET`, `POST`, `GET /:id` | Gestión de usuarios. |
| **Categorías**| `/categoria` | `GET`, `POST`, `GET /:id` | Categorías de productos. |
| **Fichas** | `/fichas` | `GET`, `POST`, `GET /:id` | Fichas de formación. |
| **Sitios** | `/sitios` | `GET`, `POST`, `GET /:id` | BODEGA, AMBIENTE, LABORATORIO. |
| **Productos** | `/productos` | `GET`, `POST`, `GET /:id` | Catálogo de productos. |
| **Inventario**| `/inventario` | `GET`, `POST`, `GET /:id` | Control de stock actual y mínimo. |
| **Movimientos**| `/movimientos`| `GET`, `POST`, `GET /:id` | ENTRADA, SALIDA, PRESTAMO, etc. |
| **Solicitudes**| `/solicitudes`| `GET`, `POST`, `GET /:id` | Solicitudes de materiales. |
| **Asignaciones**|`/asignaciones`| `GET`, `POST`, `GET /:id` | Asignación de productos a usuarios. |
| **Devoluciones**|`/devoluciones`| `GET`, `POST`, `GET /:id` | Retorno de los préstamos/asignaciones. |
| **Chequeos** | `/chequeo` | `GET`, `POST`, `GET /:id` | Control de estado de las devoluciones. |
| **Actas** | `/actas` | `GET`, `POST`, `GET /:id` | Actas generadas de asignaciones/devoluciones. |
| **Necesidades**| `/necesidades`| `GET`, `POST`, `GET /:id` | Reporte de necesidades de productos. |
| **Notificaciones**|`/notificaciones`|`GET`, `POST`, `GET /:id` | Alertas del sistema para usuarios. |
| **Reportes** | `/reportes` | `GET`, `POST`, `GET /:id` | Informes generados por el sistema. |

> **Nota sobre Paginación:** Todos los endpoints `GET` de listar incluyen los query params opcionales `?page=<number>&limit=<number>`.

## 4. Modelos e Interfaces (TypeScript)

A continuación, las interfaces necesarias para declarar en Angular, extraídas directamente de los esquemas del Backend (`swagger.json`). Se recomienda crearlas en la carpeta `src/app/core/models/` o similar.

### Autenticación
```typescript
export interface LoginDto {
  correo: string;
  contrasena: string;
}

export interface AuthResponse {
  // Según tu backend, normalmente retorna un token
  access_token: string;
}
```

### Usuarios y Roles
```typescript
export interface CreateRoleDto {
  nombreRol: string;
}

export interface CreateUsuarioDto {
  nombreCompleto: string;
  correo: string;
  contrasena: string;
  estado?: boolean; // default: true
  rolId: number;
}
```

### Productos, Categorías e Inventario
```typescript
export interface CreateCategoriaDto {
  nombreCat: string;
}

export interface CrearProductoDto {
  nombre: string;
  descripcion?: string;
  codigoUNSPSC?: string;
  SKU: string;
  imagenUrl?: string;
  categoriaId: number;
}

export interface CreateInventarioDto {
  cantidadActual: number;
  stockMinimo: number;
  productoId: number;
  sitioId: number;
}
```

### Gestión de Movimientos y Solicitudes
```typescript
export interface CreateMovimientoDto {
  tipo: 'ENTRADA' | 'SALIDA' | 'PRESTAMO' | 'DEVOLUCION' | 'TRANSFERENCIA';
  cantidad: number;
  observaciones?: string;
  productoId: number;
  usuarioId: number;
  sitioId: number;
}

export interface CreateSolicitudDto {
  justificacion: string;
  usuarioId: number;
}

export interface CreateAsignaDto {
  estadoFisico: string;
  estadoEntrega: string;
  fechaEnt: string; // ISO String Date
  fechaDevolucionEst?: string; // ISO String Date
  observaciones?: string;
  productoId: number;
  usuarioId: number;
  fichaId?: number;
}

export interface CreateDevolucionDto {
  estadoFisico: string;
  fechaReal: string; // ISO String Date
  observaciones?: string;
  asignaId: number;
  productoId: number;
  movimientoId: number;
}
```

### Chequeos e Items de Chequeo
```typescript
export interface CreateItemChequeoDto {
  descripcion: string;
  estadoItem: boolean;
  observacion?: string;
}

export interface CreateChequeoDto {
  fechaChequeo: string; // ISO String Date
  confirmado: boolean;
  asignaId?: number;
  devolucionId?: number;
  usuarioId: number;
  items: CreateItemChequeoDto[];
}
```

### Actas, Necesidades, Notificaciones y Reportes
```typescript
export interface CreateActaDto {
  urlPdf?: string;
  asignaId?: number;
  devolucionId?: number;
}

export interface CreateNecesidadDto {
  cantidadN: number;
  fechaLimite: string; // ISO String Date
  usuarioId: number;
  productoId: number;
  fichaId: number;
}

export interface CreateNotificacionDto {
  mensaje: string;
  leida?: boolean;
  tipoEvento: string;
  usuarioId: number;
}

export interface CreateReporteDto {
  tipoReporte: string;
  parametros: string;
  urlGenerado: string;
}
```

### Sitios y Fichas
```typescript
export interface CreateSitioDto {
  nombreSitio: string;
  tipo: 'BODEGA' | 'AMBIENTE' | 'LABORATORIO';
  responsableId: number;
}

export interface CreateFichaDto {
  numeroFicha: string;
  programa: string;
}
```

## 5. Recomendaciones y Seguridad para Angular

1. **Protección Estricta de Endpoints (¡IMPORTANTE!):**
   Todos los endpoints del sistema (excepto `/auth/login`) están **estrictamente protegidos** mediante un Guardián global (`JwtAuthGuard`). 
   - Si intentas hacer una petición a cualquier recurso sin enviar el token, el backend rechazará la solicitud y te devolverá un error **401 Unauthorized**.
   - El endpoint `/auth/login` es la única ruta pública (`@Public()`) a la que se puede acceder sin token para obtener tus credenciales.

2. **Manejo de Errores 401 en el Interceptor:**
   Además de adjuntar el token, tu `AuthInterceptor` (`src/app/core/interceptors/auth.interceptor.ts`) debería estar preparado para atrapar errores 401. Si el token expira (dura 15 minutos) o es inválido, deberías redirigir al usuario automáticamente a la pantalla de login:
   ```typescript
   import { catchError } from 'rxjs/operators';
   import { throwError } from 'rxjs';
   import { HttpErrorResponse } from '@angular/common/http';
   
   // Dentro de la cadena del interceptor...
   return next.handle(request).pipe(
     catchError((error: HttpErrorResponse) => {
       if (error.status === 401) {
         // Redirigir a /login y limpiar el localStorage
         this.authService.logout(); 
         this.router.navigate(['/login']);
       }
       return throwError(() => error);
     })
   );
   ```

3. **Configurar la inyección del Token (`AuthInterceptor`):**
   Asegúrate de que adjunte el token, algo como:
   ```typescript
   if (token) {
     request = request.clone({
       setHeaders: { Authorization: `Bearer ${token}` }
     });
   }
   ```

4. **Servicio Central (`ApiService` o los servicios de tu módulo):**
   Utiliza `environment.apiUrl` al construir las URLs para asegurar un paso fluido a producción. No incluyas `/api` ya que el backend lo maneja en la raíz. 
   - *Ejemplo Correcto:* ``this.http.get(`${environment.apiUrl}/productos`)``
   - *Ejemplo Incorrecto:* ``this.http.get(`${environment.apiUrl}/api/productos`)``

5. **Paginación Global:**
   Implementa un modelo general de respuesta paginada según lo que te retorna el backend (Generalmente `{ data: T[], total: number, page: number }`), ya que los `GET` findAll utilizan los query parameters `?page` y `?limit`.
