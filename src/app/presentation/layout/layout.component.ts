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
      <aside class="w-[280px] bg-white flex flex-col border-r border-gray-200 shadow-sm transition-all duration-300">
        
        <!-- Header: Logo -->
        <div class="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <img src="LogoLogitmat_sin_fondo.png" alt="Logitma" class="w-9 h-9 object-contain drop-shadow-sm">
            <span class="text-[22px] font-extrabold text-gray-900 tracking-tight">Logitma</span>
          </div>
          <button class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="pi pi-angle-down text-sm font-bold"></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <ul class="space-y-1.5">
            <li *ngFor="let item of menuItems">
              <a [routerLink]="item.path" 
                 routerLinkActive="active"
                 #rla="routerLinkActive"
                 [class.bg-gray-900]="rla.isActive"
                 [class.text-white]="rla.isActive"
                 [class.shadow-md]="rla.isActive"
                 [class.font-semibold]="rla.isActive"
                 [class.text-gray-600]="!rla.isActive"
                 [class.hover:bg-gray-100]="!rla.isActive"
                 [class.hover:text-gray-900]="!rla.isActive"
                 [class.font-medium]="!rla.isActive"
                 class="flex items-center px-4 py-3 rounded-xl text-[15px] transition-all group cursor-pointer">
                
                <i [class]="'pi ' + item.icon + ' mr-3 text-lg transition-colors'"
                   [class.text-white]="rla.isActive"
                   [class.text-gray-400]="!rla.isActive"
                   [class.group-hover:text-gray-600]="!rla.isActive"></i>
                
                {{ item.title }}
                
                <!-- Badge for Solicitudes to mimic the design -->
                <span *ngIf="item.title === 'Solicitudes'" 
                      [class.bg-blue-600]="!rla.isActive"
                      [class.bg-white]="rla.isActive"
                      [class.text-white]="!rla.isActive"
                      [class.text-gray-900]="rla.isActive"
                      class="ml-auto flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-bold shadow-sm">
                  3
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User Profile Footer with Popover Menu -->
        <div class="p-4 border-t border-gray-100 relative">
          
          <!-- The Popover Menu (Dark Theme like YouTube) -->
          <div *ngIf="isProfileMenuOpen()" 
               class="absolute bottom-[calc(100%-10px)] left-4 right-4 mb-2 bg-[#282828] text-gray-200 rounded-xl shadow-2xl border border-gray-700 overflow-hidden z-50 animate-fade-in-up">
            
            <!-- Header in dropdown -->
            <div class="p-4 border-b border-gray-700 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-cover bg-center border border-gray-600" style="background-image: url('sena1.png');"></div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-white leading-none">Administrador</span>
                <span class="text-xs text-gray-400 mt-1">admin&#64;sgm.com</span>
              </div>
            </div>

            <!-- Menu Options -->
            <ul class="py-2">
              <li>
                <a href="#" (click)="$event.preventDefault(); toggleProfileMenu()" class="flex items-center px-4 py-2.5 text-sm hover:bg-white/10 transition-colors">
                  <i class="pi pi-user mr-3 text-gray-400 text-lg"></i>
                  Mi Perfil
                </a>
              </li>
              <li>
                <a href="#" (click)="$event.preventDefault(); toggleProfileMenu()" class="flex items-center px-4 py-2.5 text-sm hover:bg-white/10 transition-colors">
                  <i class="pi pi-cog mr-3 text-gray-400 text-lg"></i>
                  Configuración
                </a>
              </li>
              <div class="h-px bg-gray-700 my-2"></div>
              <li>
                <a href="#" (click)="$event.preventDefault(); toggleProfileMenu()" class="flex items-center px-4 py-2.5 text-sm hover:bg-white/10 transition-colors">
                  <i class="pi pi-question-circle mr-3 text-gray-400 text-lg"></i>
                  Ayuda y Soporte
                </a>
              </li>
              <div class="h-px bg-gray-700 my-2"></div>
              <li>
                <button (click)="logout()" class="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-white/10 transition-colors text-left">
                  <i class="pi pi-sign-out mr-3 text-lg"></i>
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>

          <!-- The Clickable Profile Button -->
          <div (click)="toggleProfileMenu()" 
               class="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer select-none"
               [ngClass]="{'bg-gray-100': isProfileMenuOpen()}">
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 shadow-sm" style="background-image: url('sena1.png');"></div>
                <!-- Status dot -->
                <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 border-2 border-white rounded-full"></div>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900 leading-none">Administrador</span>
                <span class="text-xs text-gray-500 mt-1">admin&#64;sgm.com</span>
              </div>
            </div>
            <i class="pi pi-ellipsis-v text-gray-400"></i>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col w-full relative">
        <!-- Top Header Minimal -->
        <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 z-10">
          <div class="flex items-center gap-4">
             <div class="relative">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" placeholder="Buscar..." class="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:bg-white transition-all w-64 text-gray-700">
             </div>
          </div>
          <div class="flex items-center gap-4">
             <button class="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
               <i class="pi pi-bell text-xl"></i>
               <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
             </button>
          </div>
        </header>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <router-outlet></router-outlet>
        </div>
        
        <!-- Overlay for closing the menu by clicking outside -->
        <div *ngIf="isProfileMenuOpen()" (click)="toggleProfileMenu()" class="fixed inset-0 z-40 bg-transparent"></div>
      </main>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e5e7eb;
      border-radius: 10px;
    }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb {
      background: #d1d5db;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.2s ease-out forwards;
      transform-origin: bottom center;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);

  isProfileMenuOpen = signal(false);

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

  logout(): void {
    this.authService.logout();
  }
}
