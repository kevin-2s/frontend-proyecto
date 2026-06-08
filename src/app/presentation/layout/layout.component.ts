import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
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
         [class.w-[260px]]="isSidebarVisible() && !sidebarCollapsed()"
         [class.w-16]="isSidebarVisible() && sidebarCollapsed()"
         [class.w-0]="!isSidebarVisible() && !sidebarCollapsed()"
         [class.shadow-2xl]="isSidebarVisible()">
        
        <!-- Logo -->
        <div class="flex flex-col items-center justify-center border-b border-gray-100 flex-shrink-0 transition-all duration-300"
             [class.py-6]="!sidebarCollapsed()"
             [class.h-20]="sidebarCollapsed()"
             [class.px-6]="!sidebarCollapsed()"
             [class.px-2]="sidebarCollapsed()">
          <div class="flex items-center justify-center">
            <img src="LogoLogitmat_sin_fondo.png" 
                 alt="Logitma" 
                 [class.w-36]="!sidebarCollapsed()"
                 [class.h-auto]="!sidebarCollapsed()"
                 [class.w-10]="sidebarCollapsed()"
                 [class.h-10]="sidebarCollapsed()"
                 class="object-contain transition-all duration-300">
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-3 px-4">
          <ul class="space-y-1">
            <!-- Dashboard Link -->
            <li>
              <a [routerLink]="dashboardItem.path"
                 routerLinkActive="active"
                 #rlaDash="routerLinkActive"
                 [class.bg-[#111827]]="rlaDash.isActive"
                 [class.text-white]="rlaDash.isActive"
                 [class.bg-transparent]="!rlaDash.isActive"
                 [class.text-slate-500]="!rlaDash.isActive"
                 [class.hover:bg-slate-50]="!rlaDash.isActive"
                 [attr.title]="dashboardItem.title"
                 [class.justify-center]="sidebarCollapsed()"
                 [class.px-4]="!sidebarCollapsed()"
                 [class.px-2]="sidebarCollapsed()"
                 class="flex items-center py-3 rounded-xl text-[13.5px] transition-all cursor-pointer font-semibold">
                <i [class]="'pi ' + dashboardItem.icon + ' text-base'"
                   [class.mr-3]="!sidebarCollapsed()"
                   [class.mr-0]="sidebarCollapsed()"
                   [class.text-lg]="sidebarCollapsed()"
                   [class.text-white]="rlaDash.isActive"
                   [class.text-slate-400]="!rlaDash.isActive"></i>
                <span *ngIf="!sidebarCollapsed()">{{ dashboardItem.title }}</span>
              </a>
            </li>

            <!-- Loop over sections -->
            <ng-container *ngFor="let section of menuSections">
              <ng-container *ngIf="hasSectionAccess(section)">
                <!-- Section Header -->
                <li *ngIf="!sidebarCollapsed()" class="mt-4 mb-2">
                  <div (click)="section.expanded = !section.expanded" 
                       class="flex items-center justify-between px-4 py-1 text-[11px] font-bold text-slate-400 tracking-wider cursor-pointer hover:text-slate-600 select-none">
                    <span>{{ section.title }}</span>
                    <i class="pi pi-chevron-down text-[8px] transition-transform duration-200"
                       [class.rotate-180]="!section.expanded"></i>
                  </div>
                </li>

                <!-- Section Items -->
                <ng-container *ngIf="section.expanded || sidebarCollapsed()">
                  <ng-container *ngFor="let item of section.items">
                    <li *ngIf="hasAccess(item.path)">
                      <a [routerLink]="item.path"
                         routerLinkActive="active"
                         #rla="routerLinkActive"
                         [class.bg-[#111827]]="rla.isActive"
                         [class.text-white]="rla.isActive"
                         [class.bg-transparent]="!rla.isActive"
                         [class.text-slate-500]="!rla.isActive"
                         [class.hover:bg-slate-50]="!rla.isActive"
                         [attr.title]="item.title"
                         [class.justify-center]="sidebarCollapsed()"
                         [class.px-4]="!sidebarCollapsed()"
                         [class.px-2]="sidebarCollapsed()"
                         class="flex items-center py-3 rounded-xl text-[13.5px] transition-all cursor-pointer font-semibold">
                        <i [class]="'pi ' + item.icon + ' text-base'"
                           [class.mr-3]="!sidebarCollapsed()"
                           [class.mr-0]="sidebarCollapsed()"
                           [class.text-lg]="sidebarCollapsed()"
                           [class.text-white]="rla.isActive"
                           [class.text-slate-400]="!rla.isActive"></i>
                        <span *ngIf="!sidebarCollapsed()">{{ item.title }}</span>
                      </a>
                    </li>
                  </ng-container>
                </ng-container>
              </ng-container>
            </ng-container>
          </ul>
        </nav>

        <!-- User Footer -->
        <div class="p-4 border-t border-gray-100 flex-shrink-0 relative">
          <!-- Dropdown Menu (Opens Upward or to the Right depending on collapse state) -->
          <div *ngIf="isProfileMenuOpen()" 
               [class.w-48]="sidebarCollapsed()"
               [class.left-16]="sidebarCollapsed()"
               [class.bottom-0]="sidebarCollapsed()"
               [class.absolute]="true"
               [class.bottom-full]="!sidebarCollapsed()"
               [class.left-4]="!sidebarCollapsed()"
               [class.right-4]="!sidebarCollapsed()"
               class="mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] transition-all">
            <!-- Profile Summary Header -->
            <div class="px-4 py-2 border-b border-gray-50 flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-emerald-100 text-[#39A900] flex items-center justify-center font-bold text-xs">
                {{ getUserInitials() }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-800">{{ getUserRoleName() }}</span>
                <span class="text-[10px] text-slate-400 truncate">Sesión activa</span>
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
               [attr.title]="getUserRoleName()"
               class="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <div class="flex items-center gap-3 min-w-0" [class.justify-center]="sidebarCollapsed()">
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                {{ getUserInitials() }}
              </div>
              <div *ngIf="!sidebarCollapsed()" class="flex flex-col min-w-0">
                <span class="text-[12px] font-bold text-gray-900 truncate">{{ getUserRoleName() }}</span>
                <span class="text-[10px] text-gray-400 truncate">Sesión activa</span>
              </div>
            </div>
            <i *ngIf="!sidebarCollapsed()" class="pi pi-chevron-up text-slate-400 text-xs transition-transform duration-200" [class.rotate-180]="isProfileMenuOpen()"></i>
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
export class LayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarVisible = signal(true);
  sidebarCollapsed = signal(false);
  isProfileMenuOpen = signal(false);
  globalSearch = '';
  private routerEventsSub?: Subscription;

  dashboardItem = { title: 'Dashboard', path: 'home', icon: 'pi-home' };

  menuSections = [
    {
      title: 'ESTRUCTURA',
      expanded: true,
      items: [
        { title: 'Centros', path: 'centros', icon: 'pi-briefcase' },
        { title: 'Sedes', path: 'sitios', icon: 'pi-map-marker' },
        { title: 'Áreas', path: 'areas', icon: 'pi-clone' },
        { title: 'Programas', path: 'programas', icon: 'pi-bookmark' },
        { title: 'Fichas', path: 'fichas', icon: 'pi-id-card' }
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      expanded: true,
      items: [
        { title: 'Usuarios', path: 'usuarios', icon: 'pi-users' },
        { title: 'Roles', path: 'roles', icon: 'pi-shield' }
      ]
    },
    {
      title: 'INVENTARIO',
      expanded: true,
      items: [
        { title: 'Productos', path: 'inventario/productos', icon: 'pi-box' },
        { title: 'Categorías', path: 'inventario/categoria', icon: 'pi-tag' },
        { title: 'Proveedores', path: 'proveedores', icon: 'pi-building' }
      ]
    },
    {
      title: 'MOVIMIENTOS',
      expanded: true,
      items: [
        { title: 'Solicitudes', path: 'solicitudes', icon: 'pi-inbox' },
        { title: 'Movimientos', path: 'movimientos', icon: 'pi-arrows-h' },
        { title: 'Préstamos', path: 'prestamos', icon: 'pi-sync' }
      ]
    }
  ];

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('[Layout] ngOnInit currentUrl=', currentUrl);
    if (currentUrl === '/' || currentUrl.includes('/home')) {
      this.sidebarCollapsed.set(false);
    } else {
      try {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) this.sidebarCollapsed.set(saved === 'true');
      } catch (e) {
        // ignore
      }
    }
    
    this.menuSections.forEach(section => {
      const hasActiveChild = section.items.some(item => currentUrl.includes(item.path));
      if (hasActiveChild) {
        section.expanded = true;
      }
    });

    this.routerEventsSub = this.router.events.subscribe((ev: any) => {
      if (ev instanceof NavigationEnd) {
        const urlDest = ev.urlAfterRedirects || ev.url || '';
        if (urlDest === '/' || urlDest.includes('/home')) {
          this.sidebarCollapsed.set(false);
          this.isSidebarVisible.set(true);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.routerEventsSub) this.routerEventsSub.unsubscribe();
  }

  onGlobalSearch(term: string) {
    const lower = term.toLowerCase().trim();
    if (!lower) return;
    if (this.dashboardItem.title.toLowerCase().includes(lower)) {
      this.router.navigate([this.dashboardItem.path]);
      return;
    }
    for (const section of this.menuSections) {
      const match = section.items.find(i => i.title.toLowerCase().includes(lower));
      if (match) {
        this.router.navigate([match.path]);
        return;
      }
    }
  }

  toggleSidebar(): void {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    if (isDesktop) {
      this.sidebarCollapsed.update(v => {
        const next = !v;
        try { localStorage.setItem('sidebarCollapsed', String(next)); } catch(e) {}
        return next;
      });
    } else {
      this.isSidebarVisible.update(v => !v);
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }

  hasAccess(path: string): boolean {
    const role = this.authService.getUserRole()?.toUpperCase() || '';
    if (role === 'ADMINISTRADOR') {
      return true;
    }
    
    if (role === 'INSTRUCTOR') {
      const instructorPaths = [
        'sitios', 'areas', 'programas', 'fichas', 
        'inventario/productos', 'inventario/categoria', 
        'solicitudes', 'movimientos', 'home', 'proveedores', 'prestamos'
      ];
      return instructorPaths.includes(path);
    }
    
    if (role === 'APRENDIZ') {
      const aprendizPaths = [
        'inventario/productos', 'inventario/categoria', 
        'solicitudes', 'home'
      ];
      return aprendizPaths.includes(path);
    }
    
    return false;
  }

  hasSectionAccess(section: any): boolean {
    return section.items.some((item: any) => this.hasAccess(item.path));
  }

  getUserInitials(): string {
    const role = this.authService.getUserRole() || '';
    if (!role) return 'US';
    return role.substring(0, 2).toUpperCase();
  }
  
  getUserRoleName(): string {
    const role = this.authService.getUserRole() || 'Usuario';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}
