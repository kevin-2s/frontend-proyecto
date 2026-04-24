import { Component, OnInit, inject } from '@angular/core';
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

interface Usuario {
  id?: number;
  nombre?: string;
  nombreCompleto?: string;
  correo: string;
  contrasena?: string;
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
    PasswordModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="animate-fade-in p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-surface-800">Gestión de Usuarios</h2>
        <button
          *ngIf="isAdmin"
          pButton
          label="Nuevo Usuario"
          icon="pi pi-plus"
          (click)="openNew()"
          styleClass="p-button-success"
          [style]="{'background-color': '#39A900', 'border-color': '#39A900'}"
        ></button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-surface-200">
        <div class="p-4 border-b border-surface-200">
          <div class="flex gap-4">
            <span class="p-input-icon-left w-full sm:w-auto">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="filtro"
                (input)="filtrar()"
                placeholder="Buscar usuario..."
                class="w-full sm:w-64"
              />
            </span>
          </div>
        </div>

        <p-table
          [value]="usuariosFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
          [loading]="loading"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-surface-50 !text-surface-700">ID</th>
              <th class="!bg-surface-50 !text-surface-700">Nombre Completo</th>
              <th class="!bg-surface-50 !text-surface-700">Correo</th>
              <th class="!bg-surface-50 !text-surface-700">Rol</th>
              <th class="!bg-surface-50 !text-surface-700">Estado</th>
              <th *ngIf="isAdmin" class="!bg-surface-50 !text-surface-700 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-u>
            <tr>
              <td class="font-medium text-surface-900">#{{ u.id }}</td>
              <td class="font-medium text-surface-900">{{ u.nombre || u.nombreCompleto }}</td>
              <td>{{ u.correo }}</td>
              <td>
                <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)"></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="u.estado ? 'Activo' : 'Inactivo'"
                  [severity]="u.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td *ngIf="isAdmin" class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(u)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="isAdmin ? 6 : 5" class="text-center py-8 text-surface-500">
                No se encontraron usuarios.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nuevo Usuario' : 'Editar Usuario' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="nombreCompleto" class="font-medium text-surface-700">Nombre Completo</label>
          <input
            pInputText
            id="nombreCompleto"
            [(ngModel)]="usuario.nombre"
            class="w-full"
            placeholder="Ingrese nombre completo"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <label for="correo" class="font-medium text-surface-700">Correo Electrónico</label>
          <input
            pInputText
            id="correo"
            [(ngModel)]="usuario.correo"
            type="email"
            class="w-full"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div class="flex flex-col gap-2" *ngIf="esNuevo">
          <label for="contrasena" class="font-medium text-surface-700">Contraseña</label>
          <p-password 
            id="contrasena" 
            [(ngModel)]="usuario.contrasena"
            [feedback]="false"
            styleClass="w-full"
            [inputStyle]="{'width':'100%'}"
            placeholder="••••••••"
            [toggleMask]="true"
          ></p-password>
        </div>

        <div class="flex flex-col gap-2">
          <label for="rol" class="font-medium text-surface-700">Rol</label>
          <p-select 
            [options]="roles" 
            [(ngModel)]="usuario.id_rol" 
            optionLabel="nombre" 
            optionValue="id"
            placeholder="Seleccione un rol"
            [style]="{'width':'100%'}"
            appendTo="body"
          ></p-select>
        </div>

        <div class="flex flex-col gap-2" *ngIf="!esNuevo">
          <label class="font-medium text-surface-700">Estado</label>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="usuario.estado" class="w-4 h-4 text-[#39A900] focus:ring-[#39A900]" />
              <span class="text-surface-700">Usuario Activo</span>
            </label>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          (click)="displayDialog = false"
          class="p-button-text p-button-secondary"
        ></button>
        <button
          pButton
          label="Guardar"
          (click)="guardar()"
          styleClass="p-button-success"
          [style]="{'background-color': '#39A900', 'border-color': '#39A900'}"
          [loading]="saving"
        ></button>
      </ng-template>
    </p-dialog>
  `,
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Rol[] = [];
  filtro = '';

  displayDialog = false;
  esNuevo = true;
  loading = false;
  saving = false;
  isAdmin = false;

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
        this.loading = false;
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
      },
      error: () => {
        this.roles = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(filtroLower) ||
        u.nombreCompleto?.toLowerCase().includes(filtroLower) ||
        u.correo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoUsuario(): Usuario {
    return {
      nombre: '',
      correo: '',
      contrasena: '',
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
    this.usuario = { ...u, nombre: u.nombre || u.nombreCompleto };
    this.displayDialog = true;
  }

  guardar() {
    // Validaciones basicas
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.id_rol) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevo && !this.usuario.contrasena) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    this.saving = true;

    if (this.esNuevo) {
      this.usuarioService.create(this.usuario).subscribe({
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
      const { id, contrasena, ...updateData } = this.usuario as any;
      
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

  getRolNombre(id_rol: number): string {
    const rol = this.roles.find(r => r.id === id_rol);
    return rol ? rol.nombre : 'Desconocido';
  }

  getRolSeverity(id_rol: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }
}
