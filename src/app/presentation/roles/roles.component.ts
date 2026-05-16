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
    TagModule
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
          <button pButton label="Roles" icon="pi pi-shield"
            [class.btn-add]="currentView === 'roles'"
            class="p-button-outlined p-button-sm rounded-xl"
            (click)="setView('roles')"></button>
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

      <!-- PERMISOS VIEW (Placeholder) -->
      <div *ngIf="currentView === 'permisos'" class="view-content">
         <div class="table-card">
            <div class="p-8 text-center">
               <i class="pi pi-lock text-6xl text-slate-200 mb-4"></i>
               <h3 class="text-xl font-bold text-slate-700">Gestión de Permisos Detallada</h3>
               <p class="text-slate-500 max-w-md mx-auto mt-2">
                  Esta sección permite configurar los accesos granulares por cada rol del sistema.
               </p>
               <div class="mt-6 flex justify-center gap-4">
                  <button pButton label="Configurar Accesos" icon="pi pi-cog" class="p-button-outlined"></button>
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

  currentView: 'roles' | 'usuarios' | 'permisos' = 'roles';
  
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

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarRoles();
  }

  setView(view: 'roles' | 'usuarios' | 'permisos') {
    this.currentView = view;
    if (view === 'usuarios' && this.usuarios.length === 0) {
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
}
