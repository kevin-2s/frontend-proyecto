import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService } from '../../infrastructure/services/rol.service';

interface Usuario {
  id?: number;
  nombreCompleto: string;
  correo: string;
  contrasena?: string;
  estado: boolean;
  rolId: number;
  rolNombre?: string;
}

interface Rol {
  id: number;
  nombre: string;
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
    InputMaskModule,
    ToggleSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    CheckboxModule,
    SelectModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            pButton
            label="Nuevo"
            icon="pi pi-plus"
            class="btn-new"
            (click)="openNew()"
          ></button>
        </div>
        <div class="toolbar-center">
          <h2 class="page-title">Gestionar Usuarios</h2>
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
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          [tableStyle]="{ 'min-width': '60rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="id" style="width: 80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="nombreCompleto">
                Nombre Completo <p-sortIcon field="nombreCompleto"></p-sortIcon>
              </th>
              <th pSortableColumn="correo">Correo <p-sortIcon field="correo"></p-sortIcon></th>
              <th pSortableColumn="rolNombre">Rol <p-sortIcon field="rolNombre"></p-sortIcon></th>
              <th pSortableColumn="estado" style="width: 100px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width: 100px; text-align: center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-usuario>
            <tr>
              <td>
                <span class="id-badge">#{{ usuario.id }}</span>
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
                  [value]="usuario.estado ? 'Activo' : 'Inactivo'"
                  [severity]="usuario.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="btn-edit p-button-sm p-button-text"
                  (click)="editar(usuario)"
                  pTooltip="Editar"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="btn-delete p-button-sm p-button-text"
                  (click)="eliminar(usuario)"
                  pTooltip="Eliminar"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-users"></i>
                <span>No se encontraron usuarios.</span>
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
      <div class="form-container">
        <div class="form-field">
          <label for="nombreCompleto">Nombre Completo *</label>
          <input
            pInputText
            id="nombreCompleto"
            [(ngModel)]="usuario.nombreCompleto"
            placeholder="Ingrese nombre completo"
            class="form-input"
          />
        </div>

        <div class="form-field">
          <label for="correo">Correo Electrónico *</label>
          <input
            pInputText
            id="correo"
            [(ngModel)]="usuario.correo"
            type="email"
            placeholder="correo@ejemplo.com"
            class="form-input"
          />
        </div>

        <div class="form-field" *ngIf="esNuevo">
          <label for="contrasena">Contraseña *</label>
          <input
            pInputText
            id="contrasena"
            [(ngModel)]="usuario.contrasena"
            type="password"
            placeholder="Ingrese contraseña"
            class="form-input"
          />
        </div>

        <div class="form-field">
          <label for="rol">Rol *</label>
          <p-select
            id="rol"
            [(ngModel)]="usuario.rolId"
            [options]="roles"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione un rol"
            [showClear]="true"
            styleClass="form-select"
            (onChange)="onRolChange($event)"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Estado</label>
          <div class="switch-container">
            <p-toggleswitch [(ngModel)]="usuario.estado"></p-toggleswitch>
            <span class="switch-label">{{ usuario.estado ? 'Activo' : 'Inactivo' }}</span>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            icon="pi pi-times"
            class="btn-cancel"
            (click)="displayDialog = false"
          ></button>
          <button
            pButton
            label="Guardar"
            icon="pi pi-check"
            class="btn-save"
            (click)="guardar()"
          ></button>
        </div>
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

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Rol[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  usuario: Usuario = this.getNuevoUsuario();

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.usuarios = data;
        this.usuariosFiltrados = data;
      },
      error: () => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
      },
    });
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res?.data || res || [];
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
        u.nombreCompleto?.toLowerCase().includes(filtroLower) ||
        u.correo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoUsuario(): Usuario {
    return {
      nombreCompleto: '',
      correo: '',
      contrasena: '',
      estado: true,
      rolId: 0,
    };
  }

  openNew() {
    this.esNuevo = true;
    this.usuario = this.getNuevoUsuario();
    this.displayDialog = true;
  }

  editar(usuario: Usuario) {
    this.esNuevo = false;
    this.usuario = { ...usuario, contrasena: '' };
    this.displayDialog = true;
  }

  onRolChange(event: any) {
    const rol = this.roles.find((r) => r.id === this.usuario.rolId);
    if (rol) {
      this.usuario.rolNombre = rol.nombre;
    }
  }

  guardar() {
    if (!this.usuario.nombreCompleto || !this.usuario.correo || !this.usuario.rolId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete los campos requeridos',
      });
      return;
    }

    if (this.esNuevo && !this.usuario.contrasena) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La contraseña es requerida',
      });
      return;
    }

    const rol = this.roles.find((r) => r.id === this.usuario.rolId);
    this.usuario.rolNombre = rol?.nombre || 'Sin rol';

    if (this.esNuevo) {
      this.usuarioService.crearUsuario(this.usuario as any).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente',
          });
          this.displayDialog = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el usuario: ' + (err?.message || 'Error desconocido'),
          });
        },
      });
    } else {
      this.usuarioService.actualizarUsuario(this.usuario.id!, this.usuario).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarUsuarios();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el usuario',
          });
        },
      });
    }
  }

  eliminar(usuario: Usuario) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el usuario ' + usuario.nombreCompleto + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.eliminarUsuario(usuario.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente',
            });
            this.cargarUsuarios();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el usuario',
            });
          },
        });
      },
    });
  }
}
