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
    <p-toast position="top-right"></p-toast>
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
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar usuarios..."
              class="search-input"
            />
          </span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
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
                <span class="nombre-cell">{{ usuario.nombreCompleto }}</span>
              </td>
              <td>
                <span class="correo-cell">{{ usuario.correo }}</span>
              </td>
              <td><p-tag [value]="usuario.rolNombre || 'Sin rol'" severity="info"></p-tag></td>
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

    <!-- Dialog Create/Edit -->
    <p-dialog
      [header]="esNuevo ? 'Nuevo Usuario' : 'Editar Usuario'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '500px', width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
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
            class="form-input"
          />
        </div>
        
        <div class="flex flex-col gap-2">
          <label for="correo" class="font-medium text-surface-700">Correo Electrónico</label>
          <input
            pInputText
            id="correo"
            [(ngModel)]="usuario.correo"
            type="email"
            placeholder="correo@ejemplo.com"
            class="form-input"
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
  styles: [
    `
      .module-container {
        padding: 24px;
        background-color: #f8f9fa;
        min-height: calc(100vh - 60px);
      }

      /* Toolbar */
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
      }

      .toolbar-left {
        display: flex;
        gap: 10px;
      }

      .btn-new {
        background-color: #39a900 !important;
        border-color: #39a900 !important;
        border-radius: 8px !important;
        padding: 8px 16px !important;
      }

      .btn-new:hover {
        background-color: #2d8600 !important;
        border-color: #2d8600 !important;
      }

      .toolbar-center {
        flex: 1;
        text-align: center;
      }

      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #212529;
        margin: 0;
      }

      .toolbar-right {
        min-width: 280px;
      }

      .search-box {
        width: 100%;
      }

      .search-input {
        width: 100%;
        border-radius: 8px;
        border: 1px solid #dee2e6;
      }

      .search-input:focus {
        border-color: #39a900;
        box-shadow: 0 0 0 2px rgba(57, 169, 0, 0.2);
      }

      /* Table Card */
      .table-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .id-badge {
        font-weight: 600;
        color: #495057;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .nombre-cell {
        font-weight: 500;
        color: #212529;
      }

      .correo-cell {
        color: #6c757d;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 4px;
      }

      .btn-edit {
        color: #fd7e14 !important;
      }

      .btn-edit:hover {
        background-color: #fff3e0 !important;
      }

      .btn-delete {
        color: #dc3545 !important;
      }

      .btn-delete:hover {
        background-color: #ffe8e8 !important;
      }

      .empty-message {
        text-align: center;
        padding: 40px !important;
        color: #6c757d;
      }

      .empty-message i {
        display: block;
        font-size: 48px;
        margin-bottom: 10px;
        color: #adb5bd;
      }

      /* Form Styles */
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-field label {
        font-weight: 500;
        color: #495057;
        font-size: 14px;
      }

      .form-input {
        width: 100%;
        border-radius: 8px;
        border: 1px solid #dee2e6;
        padding: 10px 12px;
      }

      .form-input:focus {
        border-color: #39a900;
        box-shadow: 0 0 0 2px rgba(57, 169, 0, 0.2);
      }

      .form-select {
        width: 100%;
        border-radius: 8px;
      }

      .switch-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .switch-label {
        font-weight: 400;
        color: #495057;
      }

      /* Dialog Footer Buttons */
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        width: 100%;
      }

      .btn-cancel {
        background-color: #6c757d !important;
        border-color: #6c757d !important;
        border-radius: 8px !important;
      }

      .btn-cancel:hover {
        background-color: #5a6268 !important;
      }

      .btn-save {
        background-color: #39a900 !important;
        border-color: #39a900 !important;
        border-radius: 8px !important;
      }

      .btn-save:hover {
        background-color: #2d8600 !important;
      }

      /* PrimeNG Table Styles */
      :host ::ng-deep .p-datatable .p-datatable-header {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #212529;
        font-weight: 600;
        border-bottom: 2px solid #39a900;
        padding: 14px;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        padding: 14px;
        border-bottom: 1px solid #e9ecef;
      }

      :host ::ng-deep .p-paginator {
        padding: 12px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
      }

      /* Dialog Styles */
      :host ::ng-deep .form-dialog .p-dialog-header {
        background: #39a900;
        color: white;
        padding: 16px 24px;
      }

      :host ::ng-deep .form-dialog .p-dialog-title {
        color: white;
        font-weight: 600;
      }

      :host ::ng-deep .form-dialog .p-dialog-header .p-dialog-header-icon {
        color: white;
      }

      :host ::ng-deep .form-dialog .p-dialog-body {
        padding: 24px;
      }

      :host ::ng-deep .form-dialog .p-dialog-footer {
        padding: 16px 24px;
        border-top: 1px solid #dee2e6;
      }
    `,
  ],
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

  onRolChange(event: any) {
    const rol = this.roles.find((r) => r.id === this.usuario.rolId);
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
