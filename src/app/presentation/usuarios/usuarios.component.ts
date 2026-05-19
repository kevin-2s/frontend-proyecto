import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Taiga UI
import { TuiButton } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService, Rol } from '../../infrastructure/services/rol.service';
import { AuthService } from '../../infrastructure/services/auth.service';

interface Usuario {
  id_usuario?: number;
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
    PasswordModule,
    TooltipModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TuiButton,
    TuiBadge
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <!-- [StylesGlobales] .module-container: El contenedor principal blanco -->
    <div class="module-container">

      <!-- [StylesGlobales] .module-header: Encabezado estandarizado -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <!-- [Material] mat-icon: Iconografía premium -->
          
          <h3 class="page-title m-0">Usuarios</h3>
        </div>

        <div class="header-actions">
          <!-- [StylesGlobales] .search-wrapper: Buscador pill-shaped -->
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Nombre" class="search-input" />
          </div>
          
          <!-- [Taiga UI] tuiButton: El botón más moderno del ecosistema -->
          <button tuiButton type="button" size="m" appearance="primary"
            class="rounded-xl font-bold flex items-center gap-1" (click)="openNew()">
            <mat-icon class="scale-90">person_add</mat-icon>
            Crear Usuario
          </button>
        </div>
      </div>

      <!-- [PrimeNG] p-table: La potencia de manejo de datos -->
      <div class="data-table-wrapper">
        <p-table [value]="usuariosFiltrados" [paginator]="true" [rows]="10"
          styleClass="modern-table" [loading]="loading" [rowHover]="true">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width:64px">ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Contacto</th>
              <th style="width:120px">Estado</th>
              <th style="width:120px; text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-u>
            <tr>
              <td><span class="text-slate-400 text-xs font-black">#{{ u.id_usuario }}</span></td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <mat-icon class="text-slate-300 scale-75">person</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800 leading-tight">{{ u.nombre }} {{ u.apellidos }}</span>
                    <span class="text-[11px] text-slate-400 font-medium">CC: {{ u.documento || '---' }}</span>
                  </div>
                </div>
              </td>
              <td>
                <!-- [PrimeNG] p-tag: Para etiquetas de rol rápidas -->
                <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)"></p-tag>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="text-slate-600 text-sm font-medium">{{ u.correo }}</span>
                  <span class="text-slate-400 text-[11px]">{{ u.telefono || 'Sin teléfono' }}</span>
                </div>
              </td>
              <td>
                <!-- [PrimeNG] p-tag: Estado con color semántico -->
                <p-tag [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" 
                      [severity]="u.estado ? 'success' : 'danger'"
                      styleClass="font-bold px-3 py-1 text-xs rounded-lg"></p-tag>
              </td>
              <td>
                <div class="flex items-center justify-center gap-1">
                  <!-- [Material] mat-icon-button: Acciones circulares limpias -->
                  <button mat-icon-button (click)="editar(u)" class="text-blue-500 hover:bg-blue-50">
                    <mat-icon>edit_note</mat-icon>
                  </button>
                  <button mat-icon-button (click)="eliminar(u)" class="text-red-400 hover:bg-red-50">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="empty-message py-20">
              <mat-icon class="scale-[4] opacity-5 mb-10">person_off</mat-icon>
              <p class="text-slate-400 font-bold text-lg">No hay usuarios registrados</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- [PrimeNG] p-dialog: Estructura de modal -->
    <p-dialog [(visible)]="displayDialog" [modal]="true" 
      [style]="{ width: '90vw', maxWidth: '650px' }" [draggable]="false" 
      [resizable]="false" styleClass="modern-dialog" appendTo="body">
      
      <ng-template pTemplate="header">
        <div class="flex flex-col gap-1 w-full">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-[#39A900]">
              <mat-icon class="scale-110">{{ esNuevo ? 'person_add' : 'manage_accounts' }}</mat-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight">
                {{ esNuevo ? 'Registrar Usuario' : 'editar Usuario' }}
              </span>
              <span class="text-xs text-slate-400 font-medium">
              </span>
            </div>
          </div>
        </div>
      </ng-template>

      <div class="mt-2 px-1 max-h-[70vh] overflow-y-auto overflow-x-hidden">
        <div class="flex flex-col gap-6">
          
          <!-- SECCIÓN: Información Personal -->
          <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <mat-icon class="text-[#39A900] scale-90">contact_page</mat-icon>
              <span class="text-xs font-black text-slate-500 uppercase tracking-wider">Información Personal</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Nombres</mat-label>
                <input matInput [(ngModel)]="usuario.nombre" placeholder="Ej. Juan Carlos" required>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Apellidos</mat-label>
                <input matInput [(ngModel)]="usuario.apellidos" placeholder="Ej. Pérez">
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Documento Identidad</mat-label>
                <input matInput [(ngModel)]="usuario.documento" placeholder="Ej. 1098765432">
                <mat-icon matSuffix class="text-slate-400 scale-90">badge</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Teléfono</mat-label>
                <input matInput [(ngModel)]="usuario.telefono" placeholder="Ej. 3123456789">
                <mat-icon matSuffix class="text-slate-400 scale-90">phone</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- SECCIÓN: Configuración de Cuenta y Seguridad -->
          <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div class="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <mat-icon class="text-blue-500 scale-90">lock_person</mat-icon>
              <span class="text-xs font-black text-slate-500 uppercase tracking-wider">Cuenta y Seguridad</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <mat-form-field appearance="outline" class="w-full col-span-1 md:col-span-2">
                <mat-label>Correo Electrónico</mat-label>
                <input matInput [(ngModel)]="usuario.correo" type="email" placeholder="usuario@sena.edu.co" required>
                <mat-icon matSuffix class="text-slate-400 scale-90">email</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Rol</mat-label>
                <mat-select [(ngModel)]="usuario.id_rol" placeholder="Seleccione rol" required>
                  <mat-option *ngFor="let rol of roles" [value]="rol.id_rol">
                    {{ rol.nombre }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-full" *ngIf="esNuevo || usuario.password">
                <mat-label>Contraseña</mat-label>
                <input matInput [(ngModel)]="usuario.password" [type]="hidePassword ? 'password' : 'text'" placeholder="Mín. 6 caracteres">
                <button type="button" mat-icon-button matSuffix (click)="hidePassword = !hidePassword" class="text-slate-400">
                  <mat-icon class="scale-90">{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <div class="col-span-1 md:col-span-2 flex items-center justify-between p-4 rounded-2xl border transition-all duration-300"
                [ngClass]="usuario.estado ? 'bg-green-50/50 border-green-100/50' : 'bg-slate-50 border-slate-200/50'">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                    [ngClass]="usuario.estado ? 'bg-green-500/10 text-green-600' : 'bg-slate-200/50 text-slate-400'">
                    <mat-icon>{{ usuario.estado ? 'how_to_reg' : 'person_off' }}</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-black text-slate-700 text-xs uppercase tracking-tight">Estado</span>
                  </div>
                </div>
                <!-- [Material] mat-slide-toggle: Interruptor elegante -->
                <mat-slide-toggle [(ngModel)]="usuario.estado" color="primary"></mat-slide-toggle>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-end items-center gap-3 w-full border-t border-slate-100 pt-4 mt-2">
          <button mat-button (click)="displayDialog = false" class="text-slate-500 font-bold hover:bg-slate-100 rounded-xl px-5 py-2">
            Cancelar
          </button>
          <button mat-raised-button color="primary" (click)="guardar()" [disabled]="saving"
            class="bg-[#39A900] text-white font-bold hover:bg-[#2e8800] rounded-xl shadow-md shadow-green-500/10 px-6 py-2 flex items-center gap-2">
            <span class="flex items-center gap-2">
              <mat-icon class="scale-90" *ngIf="!saving">save</mat-icon>
              <span>{{ saving ? 'Guardando' : 'Guardar' }}</span>
            </span>
          </button>
        </div>
      </ng-template>
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
  hidePassword = true;

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
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los usuarios' });
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
      password: '' // Limpiar el campo de contraseña al editar por seguridad
    };
    this.displayDialog = true;
  }

  onRolChange(event: any) {
    const rol = this.roles.find((r) => r.id_rol === this.usuario.id_rol);
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
      const { id_usuario, ...updateData } = datosEnvio as any;
      
      this.usuarioService.update(id_usuario!, updateData).subscribe({
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
    const rol = this.roles.find(r => Number(r.id_rol) === Number(id_rol));
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
        this.usuarioService.delete(u.id_usuario!).subscribe({
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
    this.usuarioService.update(u.id_usuario!, { estado: u.estado }).subscribe({
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
