import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

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
        canActivate: [permissionGuard('ver_usuarios')]
      },
      {
        path: 'roles',
        loadComponent: () => import('./presentation/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [permissionGuard('ver_roles')]
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
            loadComponent: () => import('./presentation/productos/productos.component').then(m => m.ProductosComponent),
            canActivate: [permissionGuard('ver_productos')]
          },
          {
            path: 'categoria',
            loadComponent: () => import('./presentation/categoria/categoria.component').then(m => m.CategoriaComponent),
            canActivate: [permissionGuard('ver_productos')]
          },
          {
            path: 'bodega',
            loadComponent: () => import('./presentation/bodega/bodega.component').then(m => m.BodegaComponent),
            canActivate: [permissionGuard('ver_inventario')]
          },
          {
            path: 'solicitudes',
            loadComponent: () => import('./presentation/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent),
            canActivate: [permissionGuard('ver_solicitudes')]
          },
          {
            path: 'asignar',
            loadComponent: () => import('./presentation/asignar/asignar.component').then(m => m.AsignarComponent),
            canActivate: [permissionGuard('ver_solicitudes')]
          },
          {
            path: 'novedades',
            loadComponent: () => import('./presentation/novedades/novedades.component').then(m => m.NovedadesComponent),
            canActivate: [permissionGuard('ver_inventario')]
          },
          {
            path: 'traslados',
            loadComponent: () => import('./presentation/traslados/traslados.component').then(m => m.TrasladosComponent),
            canActivate: [permissionGuard('ver_traslados')]
          }
        ]
      },
      {
        path: 'centros',
        loadComponent: () => import('./presentation/centros/centros.component').then(m => m.CentrosComponent),
        canActivate: [permissionGuard('ver_centros')]
      },
      {
        path: 'sedes',
        loadComponent: () => import('./presentation/sedes/sedes.component').then(m => m.SedesComponent),
        canActivate: [permissionGuard('ver_sedes')]
      },
      {
        path: 'areas',
        loadComponent: () => import('./presentation/areas/areas.component').then(m => m.AreasComponent),
        canActivate: [permissionGuard('ver_areas')]
      },
      {
        path: 'programas',
        loadComponent: () => import('./presentation/programas/programas.component').then(m => m.ProgramasComponent),
        canActivate: [permissionGuard('ver_fichas')]
      },
      {
        path: 'fichas',
        loadComponent: () => import('./presentation/fichas/fichas.component').then(m => m.FichasComponent),
        canActivate: [permissionGuard('ver_fichas')]
      },
      {
        path: 'sitios',
        loadComponent: () => import('./presentation/sitios/sitios.component').then(m => m.SitiosComponent),
        canActivate: [permissionGuard('ver_sedes')]
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
      },
      {
        path: 'perfil',
        loadComponent: () => import('./presentation/perfil/perfil.component').then(m => m.PerfilComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
