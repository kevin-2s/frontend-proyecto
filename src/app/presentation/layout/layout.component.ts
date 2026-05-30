import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  template: `
    <div class="flex h-screen bg-[#F1F5F9] overflow-hidden">
      <!-- Sidebar -->
      <aside 
        class="bg-white flex flex-col border-r border-gray-100 transition-all duration-300 overflow-hidden flex-shrink-0"
        [class.w-[260px]]="isSidebarVisible()"
        [class.w-0]="!isSidebarVisible()">
        
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
              <!-- Item sin sub-ítems -->
              <ng-container *ngIf="!item.children">
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
              </ng-container>

              <!-- Item con sub-ítems expandibles (Inventario) -->
              <ng-container *ngIf="item.children">
                <div (click)="toggleMenuItem(item)"
                   [routerLink]="item.path"
                   routerLinkActive="active"
                   #rla="routerLinkActive"
                   [class.bg-slate-50]="rla.isActive"
                   class="flex items-center justify-between px-4 py-3 rounded-xl text-[13.5px] text-slate-500 hover:text-gray-900 transition-all cursor-pointer font-semibold hover:bg-slate-50">
                  <div class="flex items-center">
                    <i [class]="'pi ' + item.icon + ' mr-3 text-base'"
                       [class.text-[#39A900]]="rla.isActive"
                       [class.text-slate-400]="!rla.isActive"></i>
                    <span [class.text-[#39A900]]="rla.isActive">{{ item.title }}</span>
                  </div>
                  <i class="pi transition-transform duration-200" 
                     [class.pi-chevron-down]="!item.expanded" 
                     [class.pi-chevron-up]="item.expanded"
                     class="text-xs text-slate-400"></i>
                </div>

                <!-- Sub-ítems colapsables -->
                <ul *ngIf="item.expanded" class="pl-4 mt-1 space-y-1 border-l border-slate-200 ml-6 transition-all duration-300">
                  <li *ngFor="let child of item.children">
                    <a [routerLink]="child.path"
                       routerLinkActive="active"
                       #rlac="routerLinkActive"
                       [class.bg-[#111827]]="rlac.isActive"
                       [class.text-white]="rlac.isActive"
                       [class.text-slate-500]="!rlac.isActive"
                       class="flex items-center px-4 py-2 rounded-xl text-[13px] transition-all cursor-pointer font-semibold hover:bg-slate-50">
                      <i [class]="'pi ' + child.icon + ' mr-2.5 text-sm'"
                         [class.text-white]="rlac.isActive"
                         [class.text-slate-400]="!rlac.isActive"></i>
                      {{ child.title }}
                    </a>
                  </li>
                </ul>
              </ng-container>
            </li>
          </ul>
        </nav>

        <!-- User Footer -->
        <div class="p-4 border-t border-gray-100 flex-shrink-0">
          <div class="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div class="flex items-center gap-3">
              <div class="relative">
                <div class="w-10 h-10 rounded-full bg-cover bg-center border border-gray-100" style="background-image: url('sena1.png');"></div>
                <div class="absolute bottom-0 right-0 w-3 h-3 bg-[#3b82f6] border-2 border-white rounded-full"></div>
              </div>
              <div class="flex flex-col">
                <span class="text-[13px] font-bold text-gray-900">Administrador</span>
                <span class="text-[11px] text-gray-400">admin&#64;sgm.com</span>
              </div>
            </div>
            <i class="pi pi-ellipsis-v text-gray-300"></i>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Top Header -->
        <div class="px-5 pt-5 pb-0 flex-shrink-0">
          <header class="h-16 bg-[#39A900] rounded-2xl flex items-center justify-between px-5 gap-4">
            <div class="flex items-center gap-4 flex-1 min-w-0">
               <button 
                  (click)="toggleSidebar()"
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/10 hover:bg-white/20 flex-shrink-0 transition-colors">
                  <i class="pi pi-bars text-lg"></i>
               </button>
               <!-- Global Search -->
               <div class="relative flex-1 max-w-[440px]">
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
        <div class="flex-1 overflow-y-auto p-5">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class LayoutComponent {
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
