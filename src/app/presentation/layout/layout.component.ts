import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <div class="flex h-screen bg-[#F1F5F9] overflow-hidden relative">
      <!-- Backdrop para móvil (Solo visible cuando el sidebar está abierto en pantallas pequeñas) -->
      <div *ngIf="isSidebarVisible()" 
           (click)="toggleSidebar()"
           class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[40] lg:hidden transition-opacity">
      </div>

      <!-- Sidebar Responsivo -->
      <aside 
        class="bg-white flex flex-col border-r border-gray-100 transition-all duration-300 overflow-hidden flex-shrink-0 
               fixed lg:static h-full z-[50]"
        [class.w-[260px]]="isSidebarVisible()"
        [class.w-0]="!isSidebarVisible()"
        [class.shadow-2xl]="isSidebarVisible()">
        
        <!-- Logo -->
        <div class="h-20 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <img src="LogoLogitmat_sin_fondo.png" alt="Logitma" class="w-9 h-9 object-contain">
            <span class="text-[20px] font-black text-[#1e293b] tracking-tight">Logitma</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-3 px-4">
          <ul class="space-y-1">
            <li *ngFor="let item of menuItems">
              <!-- Item con Submódulos -->
              <div *ngIf="item.children; else simpleLink">
                <a 
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  #rlaParent="routerLinkActive"
                  (click)="toggleMenuItem(item)"
                  [class.bg-[#111827]]="rlaParent.isActive"
                  [class.text-white]="rlaParent.isActive"
                  [class.text-slate-500]="!rlaParent.isActive && !item.expanded"
                  [class.text-slate-800]="!rlaParent.isActive && item.expanded"
                  [class.bg-slate-50]="!rlaParent.isActive && item.expanded"
                  class="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] transition-all cursor-pointer font-semibold hover:bg-slate-50">
                  <div class="flex items-center">
                    <i [class]="'pi ' + item.icon + ' mr-3 text-base'"
                       [class.text-white]="rlaParent.isActive"
                       [class.text-[#39A900]]="!rlaParent.isActive && item.expanded"
                       [class.text-slate-400]="!rlaParent.isActive && !item.expanded"></i>
                    {{ item.title }}
                  </div>
                  <i class="pi pi-chevron-down text-[10px] transition-transform duration-200" 
                     [class.rotate-180]="item.expanded"
                     [class.text-white]="rlaParent.isActive"
                     [class.text-slate-400]="!rlaParent.isActive"></i>
                </a>
                
                <!-- Submenú -->
                <ul *ngIf="item.expanded" class="pl-6 mt-1 space-y-1">
                  <li *ngFor="let child of item.children">
                    <a [routerLink]="child.path"
                       routerLinkActive="active-sub"
                       #rlaSub="routerLinkActive"
                       [class.bg-[#39A900]/10]="rlaSub.isActive"
                       [class.text-[#39A900]]="rlaSub.isActive"
                       [class.text-slate-500]="!rlaSub.isActive"
                       class="flex items-center px-4 py-2.5 rounded-xl text-[12.5px] transition-all cursor-pointer font-medium hover:bg-slate-50">
                      <i [class]="'pi ' + child.icon + ' mr-3 text-sm'"
                         [class.text-[#39A900]]="rlaSub.isActive"
                         [class.text-slate-400]="!rlaSub.isActive"></i>
                      {{ child.title }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Item simple sin hijos -->
              <ng-template #simpleLink>
                <a [routerLink]="item.path" 
                   routerLinkActive="active"
                   #rla="routerLinkActive"
                   [class.bg-[#111827]]="rla.isActive"
                   [class.text-white]="rla.isActive"
                   [class.text-slate-500]="!rla.isActive"
                   class="flex items-center px-4 py-3 rounded-xl text-[13.5px] transition-all cursor-pointer font-semibold hover:bg-slate-50">
                 <i [class]="'pi ' + item.icon + ' mr-3 text-base'"
                    [class.text-white]="rla.isActive"
                    [class.text-slate-400]="!rla.isActive"></i>
                 {{ item.title }}
                 <span *ngIf="item.title === 'Solicitudes'" 
                       class="ml-auto flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                       [class.bg-[#3b82f6]]="!rla.isActive"
                       [class.bg-white]="rla.isActive"
                       [class.text-white]="!rla.isActive"
                       [class.text-[#111827]]="rla.isActive">
                   3
                 </span>
                </a>
              </ng-template>
            </li>
          </ul>
        </nav>

        <!-- User Footer -->
        <div class="p-4 border-t border-gray-100 flex-shrink-0 relative">
          <!-- Dropdown Menu (Opens Upward) -->
          <div *ngIf="isProfileMenuOpen()" 
               class="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] transition-all">
            <!-- Profile Summary Header -->
            <div class="px-4 py-2 border-b border-gray-50 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-emerald-100 text-[#39A900] flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-800">Administrador</span>
                <span class="text-[10px] text-slate-400 truncate">admin&#64;sena.edu.co</span>
              </div>
            </div>
            
            <!-- Menu Items for Admin Profile -->
            <div class="px-1.5 py-1">
              <a href="javascript:void(0)" class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#39A900] transition-colors">
                <i class="pi pi-user text-slate-400"></i>
                Mi Perfil
              </a>
              <a href="javascript:void(0)" class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#39A900] transition-colors">
                <i class="pi pi-cog text-slate-400"></i>
                Configuración
              </a>
              <a href="javascript:void(0)" class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#39A900] transition-colors">
                <i class="pi pi-shield text-slate-400"></i>
                Seguridad
              </a>
            </div>
            
            <div class="border-t border-gray-50 my-1"></div>
            
            <div class="px-1.5">
              <button 
                (click)="logout()" 
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors focus:outline-none">
                <i class="pi pi-power-off text-red-500"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Clickable Profile Block -->
          <div (click)="toggleProfileMenu()" 
               class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                AD
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[12px] font-bold text-gray-900 truncate">Administrador</span>
                <span class="text-[10px] text-gray-400 truncate">admin&#64;sena.edu.co</span>
              </div>
            </div>
            <i class="pi pi-chevron-up text-slate-400 text-xs transition-transform duration-200" [class.rotate-180]="isProfileMenuOpen()"></i>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <!-- Top Header -->
        <div class="px-3 md:px-5 pt-3 md:pt-5 pb-0 flex-shrink-0">
          <header class="h-16 bg-[#39A900] rounded-2xl flex items-center justify-between px-4 md:px-5 gap-3">
            <div class="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
               <button 
                  (click)="toggleSidebar()"
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 flex-shrink-0 transition-colors">
                  <i class="pi pi-bars text-lg"></i>
               </button>
               <!-- Global Search - Oculto en móviles muy pequeños para dar espacio -->
               <div class="relative flex-1 max-w-[440px] hidden sm:block">
                  <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                  <input 
                    type="text" 
                    [(ngModel)]="globalSearch"
                    (ngModelChange)="onGlobalSearch($event)"
                    placeholder="Buscar módulo..." 
                    class="w-full pl-9 pr-4 py-2 bg-white/90 backdrop-blur border-none rounded-xl text-sm focus:outline-none focus:bg-white text-slate-700 placeholder-slate-400 transition-all">
               </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
               <div class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white relative cursor-pointer hover:bg-white/20 transition-colors">
                  <i class="pi pi-bell text-base"></i>
                  <span class="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border border-white/50"></span>
               </div>
            </div>
          </header>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-3 md:p-5">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarVisible = signal(true);
  isProfileMenuOpen = signal(false);
  globalSearch = '';

  menuItems: any[] = [
    { title: 'Dashboard',   path: '/dashboard',   icon: 'pi-home' },
    { title: 'Usuarios',    path: '/usuarios',    icon: 'pi-users' },
    { title: 'Roles',       path: '/roles',       icon: 'pi-shield' },
    { 
      title: 'Inventario',  
      path: '/inventario',  
      icon: 'pi-warehouse',
      expanded: false,
      children: [
        { title: 'Productos',   path: '/inventario/productos',   icon: 'pi-box' },
        { title: 'Categorías',  path: '/inventario/categoria',   icon: 'pi-tag' }
      ]
    },
    { title: 'Fichas',      path: '/fichas',      icon: 'pi-id-card' },
    { title: 'Sitios',      path: '/sitios',      icon: 'pi-map-marker' },
    { title: 'Solicitudes', path: '/solicitudes', icon: 'pi-inbox' },
    { title: 'Movimientos', path: '/movimientos', icon: 'pi-arrows-h' }
  ];

  ngOnInit() {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some((child: any) => currentUrl.includes(child.path));
        if (hasActiveChild) {
          item.expanded = true;
        }
      }
    });
  }

  toggleMenuItem(item: any): void {
    item.expanded = !item.expanded;
  }

  onGlobalSearch(term: string) {
    const lower = term.toLowerCase().trim();
    if (!lower) return;
    const match = this.menuItems.find(i => i.title.toLowerCase().includes(lower));
    if (match) this.router.navigate([match.path]);
  }

  toggleSidebar(): void {
    this.isSidebarVisible.update(v => !v);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
