import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { Select } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService, Rol } from '../../infrastructure/services/rol.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { TooltipModule } from 'primeng/tooltip';

interface Usuario {
  id?: number;
  nombre?: string;
  apellidos?: string;
  correo: string;
  telefono?: string;
  documento?: string;
  password?: string;
  estado: boolean;
  id_rol: number;
  rolNombre?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    Select,
    PasswordModule,
    TooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">

      <!-- Header -->
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-users"></i> Usuarios
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar usuario..."
              class="search-input"
            />
          </div>
          <button
            pButton
            label="Agregar"
            icon="pi pi-plus"
            (click)="openNew()"
            class="btn-add"
          ></button>
        </div>
      </div>

      <!-- Table -->
      <div class="data-table-wrapper">
        <p-table
          [value]="usuariosFiltrados"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [loading]="loading"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:64px">ID</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Correo</th>
              <th>Estado</th>
              <th style="text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-u>
            <tr>
              <td><span class="text-slate-400 text-xs font-bold">#{{ u.id }}</span></td>
              <td><span class="font-semibold text-slate-800">{{ u.nombre }} {{ u.apellidos }}</span></td>
              <td><span class="text-slate-500 text-sm">{{ getRolNombre(u.id_rol) }}</span></td>
              <td><span class="text-slate-500 text-sm">{{ u.correo }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="u.estado ? 'status-active' : 'status-inactive'">
                  {{ u.estado ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button pButton icon="pi pi-pencil" pTooltip="Editar" tooltipPosition="top"
                    (click)="editar(u)" class="btn-table-action btn-editor"></button>
                  <button pButton icon="pi pi-trash" pTooltip="Eliminar" tooltipPosition="top"
                    (click)="eliminar(u)" class="btn-table-action btn-eliminar"></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="empty-message">
              <i class="pi pi-users"></i><p>No se encontraron usuarios</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Form Dialog - Matching reference image -->
    <p-dialog
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
      [closable]="true"
    >
      <ng-template pTemplate="header">
        <div class="w-full text-center py-4">
           <h2 class="text-3xl font-black text-slate-800 uppercase tracking-tight">
            {{ esNuevo ? 'AÑADIR USUARIO' : 'EDITAR USUARIO' }}
           </h2>
        </div>
      </ng-template>

      <div class="form-grid-3 mt-4">
        <div class="form-field">
          <label>Nombres</label>
          <input pInputText [(ngModel)]="usuario.nombre" placeholder="Nombres" />
        </div>
        <div class="form-field">
          <label>Apellidos</label>
          <input pInputText [(ngModel)]="usuario.apellidos" placeholder="Apellidos" />
        </div>
        <div class="form-field">
          <label>Rol</label>
          <p-select 
            [options]="roles" 
            [(ngModel)]="usuario.id_rol" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Usuario"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Teléfono</label>
          <input pInputText [(ngModel)]="usuario.telefono" placeholder="Teléfono" />
        </div>
        <div class="form-field">
          <label>Número Documento</label>
          <input pInputText [(ngModel)]="usuario.documento" placeholder="Documento" />
        </div>
        <div class="form-field">
          <label>Gmail</label>
          <input pInputText [(ngModel)]="usuario.correo" placeholder="Correo" type="email" />
        </div>

        <div class="form-field">
          <label>Contraseña</label>
          <p-password 
            [(ngModel)]="usuario.password"
            [feedback]="false"
            styleClass="w-full"
            [inputStyle]="{'width':'100%'}"
            placeholder="Contraseña"
            [toggleMask]="true"
            appendTo="body"
          ></p-password>
        </div>

        <div class="flex items-end col-span-2 pb-[2px]">
          <button
            pButton
            label="Aceptar"
            (click)="guardar()"
            class="btn-primary"
            [loading]="saving"
          ></button>
        </div>
      </div>
    </p-dialog>
  `
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Rol[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  loading = false;
  saving = false;
  isAdmin = false;
  stats = { total: 0, activos: 0, inactivos: 0, admins: 0 };

  usuario: Usuario = this.getNuevoUsuario();

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarRoles();
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        // Asume que el backend devuelve un array o { data: [] }
        const data = Array.isArray(res) ? res : (res.data || []);
        this.usuarios = data;
        this.usuariosFiltrados = data;
        this.calcularEstadisticas();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
      },
    });
  }

  cargarRoles() {
    this.rolService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.roles = data;
        this.calcularEstadisticas();
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
      },
    });
  }

  calcularEstadisticas() {
    this.stats = {
      total: this.usuarios.length,
      activos: this.usuarios.filter(u => u.estado).length,
      inactivos: this.usuarios.filter(u => !u.estado).length,
      admins: this.usuarios.filter(u => {
        const rol = this.getRolNombre(u.id_rol).toUpperCase();
        return rol.includes('ADMIN');
      }).length
    };
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(filtroLower) ||
        u.apellidos?.toLowerCase().includes(filtroLower) ||
        u.correo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoUsuario(): Usuario {
    return {
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      documento: '',
      password: '',
      estado: true,
      id_rol: 0,
    };
  }

  openNew() {
    this.esNuevo = true;
    this.usuario = this.getNuevoUsuario();
    this.displayDialog = true;
  }

  editar(u: Usuario) {
    this.esNuevo = false;
    this.usuario = { 
      ...u, 
      nombre: u.nombre,
      apellidos: u.apellidos,
      password: '' // Clear password field on edit for security
    };
    this.displayDialog = true;
  }

  onRolChange(event: any) {
    const rol = this.roles.find((r) => r.id === this.usuario.id_rol);
    if (rol) {
      this.usuario.rolNombre = rol.nombre;
    }
  }

  guardar() {
    // Validaciones basicas
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.id_rol) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevo && !this.usuario.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    this.saving = true;

    // Clonamos para no modificar el objeto de la vista y limpiamos campos
    const datosEnvio = { ...this.usuario };
    if (!this.esNuevo && !datosEnvio.password) {
      delete datosEnvio.password; // No enviar password si está vacío en edición
    }

    if (this.esNuevo) {
      this.usuarioService.create(datosEnvio).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el usuario' });
        },
      });
    } else {
      const { id, ...updateData } = datosEnvio as any;
      
      this.usuarioService.update(id!, updateData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el usuario' });
        }
      });
    }
  }

  getRolNombre(id_rol: any): string {
    const rol = this.roles.find(r => Number(r.id) === Number(id_rol));
    return rol ? rol.nombre : 'Desconocido';
  }

  getRolSeverity(id_rol: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }

  eliminar(u: Usuario) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar a ${u.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.delete(u.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado' });
            this.cargarUsuarios();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario' });
          }
        });
      }
    });
  }

  actualizarEstado(u: Usuario) {
    this.usuarioService.update(u.id!, { estado: u.estado }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado' });
        this.calcularEstadisticas();
      },
      error: () => {
        u.estado = !u.estado; // Revertir en caso de error
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
      }
    });
  }
}
