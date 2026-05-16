import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="bg-white flex flex-col border-r border-gray-100 transition-all duration-300 overflow-hidden"
        [class.w-[280px]]="isSidebarVisible()"
        [class.w-0]="!isSidebarVisible()">
        
        <!-- Header: Logo Area from Image -->
        <div class="h-24 flex items-center justify-between px-8">
          <div class="flex items-center gap-3">
            <img src="LogoLogitmat_sin_fondo.png" alt="Logitma" class="w-10 h-10 object-contain">
            <span class="text-[22px] font-bold text-[#1e293b] tracking-tight">Logitma</span>
            <i class="pi pi-chevron-down text-gray-400 text-[10px] ml-1 mt-1"></i>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto py-2 px-6 custom-scrollbar">
          <ul class="space-y-2">
            <li *ngFor="let item of menuItems">
              <a [routerLink]="item.path" 
                 routerLinkActive="active"
                 #rla="routerLinkActive"
                 [class.bg-[#111827]]="rla.isActive"
                 [class.text-white]="rla.isActive"
                 [class.text-slate-500]="!rla.isActive"
                 [class.hover:bg-slate-50]="!rla.isActive"
                 class="flex items-center px-5 py-4 rounded-xl text-[15px] transition-all group cursor-pointer font-bold">
                
                <i [class]="'pi ' + item.icon + ' mr-4 text-lg'"
                   [class.text-white]="rla.isActive"
                   [class.text-slate-400]="!rla.isActive"></i>
                
                {{ item.title }}
                
                <span *ngIf="item.title === 'Solicitudes'" 
                      [class.bg-[#3b82f6]]="!rla.isActive"
                      [class.bg-white]="rla.isActive"
                      [class.text-white]="!rla.isActive"
                      [class.text-[#111827]]="rla.isActive"
                      class="ml-auto flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-bold shadow-sm">
                  3
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User Profile Footer - Matching Image -->
        <div class="p-6 border-t border-gray-100 mt-auto">
          <div class="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer select-none">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-11 h-11 rounded-full bg-cover bg-center border border-gray-100 shadow-sm" style="background-image: url('sena1.png');"></div>
                <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#3b82f6] border-2 border-white rounded-full"></div>
              </div>
              <div class="flex flex-col">
                <span class="text-[14px] font-bold text-gray-900 leading-none">Administrador</span>
                <span class="text-[12px] text-gray-400 mt-1">admin&#64;sgm.com</span>
              </div>
            </div>
            <i class="pi pi-ellipsis-v text-gray-300"></i>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col w-full relative">
        <!-- Top Header - Keeping the green bar but cleaner -->
        <div class="p-4">
          <header class="h-20 bg-[#39A900] shadow-sm rounded-[20px] flex items-center justify-between px-8">
            <div class="flex items-center gap-6 w-full">
               <button 
                  (click)="toggleSidebar()"
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20">
                  <i class="pi pi-bars text-xl"></i>
               </button>
               
               <div class="relative w-full max-w-[400px]">
                  <input type="text" placeholder="Buscar..." class="w-full px-6 py-2.5 bg-white border-none rounded-full text-sm focus:outline-none text-slate-700">
                  <i class="pi pi-search absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
               </div>
            </div>

            <div class="flex items-center gap-5">
               <!-- Notifications Only -->
               <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 relative cursor-pointer">
                  <i class="pi pi-bell text-xl"></i>
                  <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
               </div>
            </div>
          </header>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto px-10 py-6 bg-white">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
  private authService = inject(AuthService);

  isProfileMenuOpen = signal(false);
  isSidebarVisible = signal(true);

  menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: 'pi-home' },
    { title: 'Usuarios', path: '/usuarios', icon: 'pi-users' },
    { title: 'Roles', path: '/roles', icon: 'pi-shield' },
    { title: 'Productos', path: '/productos', icon: 'pi-box' },
    { title: 'Categorías', path: '/categoria', icon: 'pi-tag' },
    { title: 'Fichas', path: '/fichas', icon: 'pi-id-card' },
    { title: 'Sitios', path: '/sitios', icon: 'pi-map-marker' },
    { title: 'Inventario', path: '/inventario', icon: 'pi-warehouse' },
    { title: 'Solicitudes', path: '/solicitudes', icon: 'pi-inbox' },
    { title: 'Movimientos', path: '/movimientos', icon: 'pi-arrows-h' }
  ];

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(val => !val);
  }

  toggleSidebar(): void {
    this.isSidebarVisible.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
  }
}
