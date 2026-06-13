import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./presentation/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: '', // Layout principal para rutas protegidas
    loadComponent: () => import('./presentation/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./presentation/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./presentation/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard(['Administrador'])]
      },
      {
        path: 'roles',
        loadComponent: () => import('./presentation/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [roleGuard(['Administrador'])]
      },
      {
        path: 'inventario',
        children: [
          {
            path: '',
            loadComponent: () => import('./presentation/inventario/inventario.component').then(m => m.InventarioComponent)
          },
          {
            path: 'productos',
            loadComponent: () => import('./presentation/productos/productos.component').then(m => m.ProductosComponent)
          },
          {
            path: 'categoria',
            loadComponent: () => import('./presentation/categoria/categoria.component').then(m => m.CategoriaComponent)
          },
          {
            path: 'bodega',
            loadComponent: () => import('./presentation/bodega/bodega.component').then(m => m.BodegaComponent)
          }
        ]
      },
      {
        path: 'centros',
        loadComponent: () => import('./presentation/centros/centros.component').then(m => m.CentrosComponent),
        canActivate: [roleGuard(['Administrador'])]
      },
      {
        path: 'areas',
        loadComponent: () => import('./presentation/areas/areas.component').then(m => m.AreasComponent),
        canActivate: [roleGuard(['Administrador', 'Instructor'])]
      },
      {
        path: 'programas',
        loadComponent: () => import('./presentation/programas/programas.component').then(m => m.ProgramasComponent),
        canActivate: [roleGuard(['Administrador', 'Instructor'])]
      },
      {
        path: 'fichas',
        loadComponent: () => import('./presentation/fichas/fichas.component').then(m => m.FichasComponent),
        canActivate: [roleGuard(['Administrador', 'Instructor'])]
      },
      {
        path: 'sitios',
        loadComponent: () => import('./presentation/sitios/sitios.component').then(m => m.SitiosComponent),
        canActivate: [roleGuard(['Administrador', 'Instructor'])]
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./presentation/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent)
      },
      {
        path: 'centros',
        loadComponent: () => import('./presentation/centros/centros.component').then(m => m.CentrosComponent)
      },
      {
        path: 'sedes',
        loadComponent: () => import('./presentation/sedes/sedes.component').then(m => m.SedesComponent)
      },
      {
        path: 'areas',
        loadComponent: () => import('./presentation/areas/areas.component').then(m => m.AreasComponent)
      },
      {
        path: 'programas',
        loadComponent: () => import('./presentation/programas/programas.component').then(m => m.ProgramasComponent)
      },

      {
        path: 'movimientos',
        loadComponent: () => import('./presentation/movimientos/movimientos.component').then(m => m.MovimientosComponent)
      },
      {
        path: 'prestamos',
        loadComponent: () => import('./presentation/prestamos/prestamos').then(m => m.PrestamosComponent)
      },
      {
        path: 'kardex',
        loadComponent: () => import('./presentation/kardex/kardex').then(m => m.Kardex)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./presentation/reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'qr',
        loadComponent: () => import('./presentation/qr-scanner/qr-scanner.component').then(m => m.QrScannerComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
