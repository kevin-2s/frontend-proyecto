import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F8F9FA] overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 bg-[#39A900] text-white flex flex-col shadow-xl">
        <div class="h-16 flex items-center justify-center border-b border-[#2D8600]">
          <h1 class="text-3xl font-extrabold tracking-wider">SGM</h1>
        </div>
        <nav class="flex-1 overflow-y-auto py-4">
          <ul class="space-y-1 px-3">
            <li *ngFor="let item of menuItems">
              <a [routerLink]="item.path" 
                 routerLinkActive="bg-[#2D8600] border-l-4 border-white font-semibold"
                 class="flex items-center px-4 py-3 rounded text-sm transition-colors hover:bg-[#2D8600]">
                <i [class]="'pi ' + item.icon + ' mr-3 text-lg'"></i>
                {{ item.title }}
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col w-full">
        <!-- Header -->
        <header class="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <div class="font-medium text-gray-700 flex items-center">
            <i class="pi pi-user mr-2 text-[#39A900]"></i> Administrador
          </div>
          <button (click)="logout()" 
                  class="bg-[#DC3545] hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center">
            <i class="pi pi-sign-out mr-2"></i> Cerrar sesión
          </button>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  private authService = inject(AuthService);

  menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: 'pi-home' },
    { title: 'Usuarios', path: '/usuarios', icon: 'pi-users' },
    { title: 'Roles', path: '/roles', icon: 'pi-shield' },
    { title: 'Productos', path: '/productos', icon: 'pi-box' },
    { title: 'Categorías', path: '/categoria', icon: 'pi-tag' },
    { title: 'Fichas', path: '/fichas', icon: 'pi-id-card' },
    { title: 'Sitios', path: '/sitios', icon: 'pi-map-marker' },
    { title: 'Inventario', path: '/inventario', icon: 'pi-warehouse' },
    { title: 'Solicitudes', path: '/solicitudes', icon: 'pi-list' },
    { title: 'Movimientos', path: '/movimientos', icon: 'pi-arrows-h' }
  ];

  logout(): void {
    this.authService.logout();
  }
}
