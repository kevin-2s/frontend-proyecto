import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./presentation/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '', // Layout principal para rutas protegidas
    loadComponent: () => import('./presentation/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./presentation/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./presentation/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./presentation/roles/roles.component').then(m => m.RolesComponent)
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
        path: 'fichas',
        loadComponent: () => import('./presentation/fichas/fichas.component').then(m => m.FichasComponent)
      },
      {
        path: 'sitios',
        loadComponent: () => import('./presentation/sitios/sitios.component').then(m => m.SitiosComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./presentation/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./presentation/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
