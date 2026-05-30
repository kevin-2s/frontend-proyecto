import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { RolService, Rol } from '../../infrastructure/services/rol.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    TagModule,
    MatIconModule,
    MatSlideToggleModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="module-container">

      <!-- Header -->
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-shield"></i> Roles y Usuarios
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar..."
              class="search-input"
            />
          </div>
          <!-- Nav buttons -->
          <button pButton label="Usuarios" icon="pi pi-users"
            [class.btn-add]="currentView === 'usuarios'"
            class="p-button-outlined p-button-sm rounded-xl"
            (click)="setView('usuarios')"></button>
          <button pButton label="Permisos" icon="pi pi-lock"
            [class.btn-add]="currentView === 'permisos'"
            class="p-button-outlined p-button-sm rounded-xl"
            (click)="setView('permisos')"></button>
        </div>
      </div>

      <!-- ROLES VIEW -->
      <div *ngIf="currentView === 'roles'" class="view-content">
        <!-- Integrated Form - Matching Image 2 Style -->
        <div class="integrated-form-card mb-10" *ngIf="isAdmin">
          <div class="w-full text-center py-6">
            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">AÑADIR USUARIO</h3>
          </div>
          
          <div class="form-grid-3">
            <div class="form-field">
              <label>Nombres</label>
              <input pInputText placeholder="Nombres" />
            </div>
            <div class="form-field">
              <label>Apellidos</label>
              <input pInputText placeholder="Apellidos" />
            </div>
            <div class="form-field">
              <label>Rol</label>
              <input pInputText placeholder="Instructor" />
            </div>

            <div class="form-field">
              <label>Teléfono</label>
              <input pInputText placeholder="Teléfono" />
            </div>
            <div class="form-field">
              <label>Número Documento</label>
              <input pInputText placeholder="Documento" />
            </div>
            <div class="form-field">
              <label>Gmail</label>
              <input pInputText placeholder="Correo" />
            </div>

            <div class="form-field">
              <label>Contraseña</label>
              <input pInputText type="password" placeholder="Contraseña" />
            </div>

            <div class="flex items-end col-span-2 pb-[2px]">
              <button
                pButton
                label="Aceptar"
                class="btn-primary"
              ></button>
            </div>
          </div>
        </div>

        <!-- Roles Table -->
        <div class="data-table-wrapper">
          <p-table
            [value]="rolesFiltrados"
            [paginator]="true"
            [rows]="10"
            styleClass="modern-table"
            [loading]="loading"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width:56px">#</th>
                <th>Nombre del Rol</th>
                <th>Descripción</th>
                <th style="text-align:center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-r let-i="rowIndex">
              <tr>
                <td><span class="text-slate-400 text-xs font-bold">{{ i + 1 }}</span></td>
                <td><span class="font-semibold text-slate-800">{{ r.nombre }}</span></td>
                <td><span class="text-slate-400 text-sm italic">Sin descripción</span></td>
                <td>
                  <div class="action-buttons justify-center">
                    <button pButton icon="pi pi-pencil" pTooltip="Editar" tooltipPosition="top"
                      class="btn-table-action btn-editor"></button>
                    <button pButton icon="pi pi-trash" pTooltip="Eliminar" tooltipPosition="top"
                      class="btn-table-action btn-eliminar"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- USUARIOS VIEW (Synced with Roles) -->
      <div *ngIf="currentView === 'usuarios'" class="view-content">
        <div class="table-card">
          <div class="table-header">
            <div class="search-container">
              <i class="pi pi-search search-icon"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="filtroUser"
                (input)="filtrarUsuarios()"
                placeholder="Buscar usuarios vinculados..."
                class="search-input"
              />
            </div>
          </div>
          
          <p-table
            [value]="usuariosFiltrados"
            [paginator]="true"
            [rows]="10"
            styleClass="modern-table"
            [loading]="loading"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 100px">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-u>
              <tr>
                <td><span class="id-badge">#{{ u.id }}</span></td>
                <td class="font-bold">{{ u.nombre || u.nombreCompleto }}</td>
                <td class="text-slate-500">{{ u.correo }}</td>
                <td>
                   <p-tag 
                    [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" 
                    [severity]="u.estado ? 'success' : 'danger'"
                    styleClass="px-3 py-1 rounded-lg"
                  ></p-tag>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="empty-message">
                  <i class="pi pi-users"></i>
                  <p>No hay usuarios registrados para mostrar</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- PERMISOS VIEW (Real-time granular management) -->
      <div *ngIf="currentView === 'permisos'" class="view-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Columna izquierda: Lista de Usuarios -->
          <div class="lg:col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex flex-col h-[650px]">
            <div class="mb-4">
              <span class="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Directorio de Usuarios</span>
              <div class="relative w-full">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input pInputText type="text" [(ngModel)]="filtroUser" (input)="filtrarUsuarios()"
                  placeholder="Buscar usuario por nombre..." class="w-full pl-9 py-2 border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <div *ngFor="let u of usuariosFiltrados" 
                   (click)="seleccionarUsuario(u)"
                   [class.bg-[#39A900]/10]="usuarioSeleccionado?.id === u.id"
                   [class.border-[#39A900]/30]="usuarioSeleccionado?.id === u.id"
                   [class.border-slate-100]="usuarioSeleccionado?.id !== u.id"
                   class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                
                <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <mat-icon class="text-slate-400">person</mat-icon>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="font-bold text-slate-800 text-sm truncate leading-tight">{{ u.nombre || u.nombreCompleto }}</span>
                  <span class="text-slate-400 text-[10.5px] truncate">{{ u.correo }}</span>
                </div>
                <!-- Tag de Rol -->
                <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)" styleClass="text-[9px] px-2 py-0.5 rounded-md"></p-tag>
              </div>
              
              <div *ngIf="usuariosFiltrados.length === 0" class="text-center py-12 text-slate-400">
                <i class="pi pi-users text-4xl opacity-20 block mb-2"></i>
                <p class="text-xs">No hay usuarios vinculados</p>
              </div>
            </div>
          </div>

          <!-- Columna derecha: Gestión de Permisos del Usuario Seleccionado -->
          <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col h-[650px] overflow-hidden">
            
            <div *ngIf="!usuarioSeleccionado" class="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div class="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <mat-icon class="text-slate-300 scale-150">fingerprint</mat-icon>
              </div>
              <h4 class="text-slate-800 font-extrabold text-lg uppercase tracking-tight">Gestión de Accesos Granulares</h4>
              <p class="text-slate-400 max-w-sm text-sm mt-1">
                Seleccione un usuario de la lista de la izquierda para ver, activar o desactivar sus permisos de acceso en tiempo real.
              </p>
            </div>

            <div *ngIf="usuarioSeleccionado" class="flex flex-col h-full overflow-hidden">
              <!-- Datos del Usuario Seleccionado -->
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-[#39A900]/10 flex items-center justify-center border border-[#39A900]/20">
                    <mat-icon class="text-[#39A900] scale-125">verified_user</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <span class="font-black text-slate-800 text-base leading-tight">{{ usuarioSeleccionado.nombre || usuarioSeleccionado.nombreCompleto }}</span>
                      <p-tag [value]="getRolNombre(usuarioSeleccionado.id_rol)" [severity]="getRolSeverity(usuarioSeleccionado.id_rol)"></p-tag>
                    </div>
                    <span class="text-slate-400 text-xs mt-0.5">{{ usuarioSeleccionado.correo }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider">
                    CC: {{ usuarioSeleccionado.documento || 'No Registrado' }}
                  </span>
                </div>
              </div>

              <!-- Lista de Permisos Agrupados -->
              <div class="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar">
                
                <div *ngIf="loadingPermisos" class="flex flex-col items-center justify-center py-24">
                  <i class="pi pi-spin pi-spinner text-3xl text-[#39A900]"></i>
                  <span class="text-xs text-slate-400 mt-2 font-semibold">Cargando mapa de accesos...</span>
                </div>

                <div *ngIf="!loadingPermisos">
                  <!-- Iteramos por cada módulo / categoría de permisos -->
                  <div *ngFor="let key of getKeys(permisosAgrupados)" class="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
                    <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200/50">
                      <mat-icon class="text-slate-400 scale-90">folder_open</mat-icon>
                      <span class="text-xs font-black text-slate-700 uppercase tracking-widest">{{ key }}</span>
                    </div>

                    <!-- Lista de permisos en este módulo -->
                    <div class="space-y-3">
                      <div *ngFor="let p of permisosAgrupados[key]" class="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-2xs hover:border-[#39A900]/20 transition-all">
                        <div class="flex flex-col min-w-0 pr-4">
                          <span class="font-bold text-slate-800 text-sm leading-tight">{{ p.descripcion || formatPermisoName(p.nombre) }}</span>
                          <span class="text-[11px] text-slate-400 mt-0.5">{{ p.nombre }}</span>
                        </div>
                        
                        <div class="flex items-center gap-3">
                          <span *ngIf="p.heredado_de_rol" class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                            Heredado
                          </span>
                          <!-- Material slide toggle para activación en tiempo real -->
                          <mat-slide-toggle [checked]="p.tiene_permiso" 
                                            (change)="togglePermiso(p, $event.checked)" 
                                            color="primary">
                          </mat-slide-toggle>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  currentView: 'roles' | 'usuarios' | 'permisos' = 'usuarios';
  
  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];
  filtro = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtroUser = '';
  
  loading = false;
  saving = false;
  isAdmin = false;

  rol: Partial<Rol> = { nombre: '' };

  // Permisos Granulares State
  usuarioSeleccionado: any = null;
  permisosAgrupados: any = {};
  loadingPermisos = false;

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarRoles();
    this.cargarUsuarios();
  }

  setView(view: 'roles' | 'usuarios' | 'permisos') {
    this.currentView = view;
    if ((view === 'usuarios' || view === 'permisos') && this.usuarios.length === 0) {
      this.cargarUsuarios();
    }
  }

  cargarRoles() {
    this.loading = true;
    this.rolService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.roles = data;
        this.rolesFiltrados = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
        this.rolesFiltrados = [];
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles' });
      },
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.usuarios = data;
        this.usuariosFiltrados = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
      }
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.rolesFiltrados = this.roles.filter((r) =>
      r.nombre?.toLowerCase().includes(filtroLower),
    );
  }

  filtrarUsuarios() {
    const filtroLower = this.filtroUser.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter((u) =>
      (u.nombre || u.nombreCompleto || '').toLowerCase().includes(filtroLower) ||
      (u.correo || '').toLowerCase().includes(filtroLower)
    );
  }

  guardar() {
    if (!this.rol.nombre || this.rol.nombre.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre del rol es requerido' });
      return;
    }

    this.saving = true;
    this.rolService.create({ nombre: this.rol.nombre }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente' });
        this.rol = { nombre: '' };
        this.saving = false;
        this.cargarRoles();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el rol' });
      },
    });
  }

  seleccionarUsuario(u: any) {
    this.usuarioSeleccionado = u;
    this.cargarPermisos(u.id_usuario);
  }

  cargarPermisos(idUsuario: number) {
    this.loadingPermisos = true;
    this.usuarioService.getPermisos(idUsuario).subscribe({
      next: (res: any) => {
        this.permisosAgrupados = res.data || res || {};
        this.loadingPermisos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPermisos = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del usuario' });
      }
    });
  }

  togglePermiso(p: any, active: boolean) {
    if (!this.usuarioSeleccionado) return;
    this.usuarioService.asignarPermiso(this.usuarioSeleccionado.id_usuario, p.id_permiso, active).subscribe({
      next: () => {
        p.tiene_permiso = active;
        p.heredado_de_rol = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Permiso actualizado correctamente' });
        this.cdr.detectChanges();
      },
      error: () => {
        p.tiene_permiso = !active;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el permiso' });
        this.cdr.detectChanges();
      }
    });
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatPermisoName(name: string): string {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  getRolNombre(id_rol: any): string {
    const rol = this.roles.find((r) => Number(r.id_rol) === Number(id_rol));
    return rol ? rol.nombre : 'Desconocido';
  }

  getRolSeverity(id_rol: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }
}
