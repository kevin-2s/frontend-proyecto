import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RolService } from '../../infrastructure/services/rol.service';

interface Rol {
  id?: number;
  nombreRol: string;
  estado?: boolean;
}

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
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
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
          <h2 class="page-title">Gestionar Roles</h2>
        </div>
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar roles..."
              class="search-input"
            />
          </span>
        </div>
      </div>

      <div class="table-card">
        <p-table
          [value]="rolesFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
          [tableStyle]="{ 'min-width': '40rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="id" style="width: 80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="nombreRol">
                Nombre del Rol <p-sortIcon field="nombreRol"></p-sortIcon>
              </th>
              <th pSortableColumn="estado" style="width: 100px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width: 100px; text-align: center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-rol>
            <tr>
              <td>
                <span class="id-badge">#{{ rol.id }}</span>
              </td>
              <td>
                <span class="nombre-cell">{{ rol.nombreRol }}</span>
              </td>
              <td>
                <p-tag
                  [value]="rol.estado ? 'Activo' : 'Inactivo'"
                  [severity]="rol.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="btn-edit p-button-sm p-button-text"
                  (click)="editar(rol)"
                  pTooltip="Editar"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="btn-delete p-button-sm p-button-text"
                  (click)="eliminar(rol)"
                  pTooltip="Eliminar"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-message">
                <i class="pi pi-tag"></i><span>No se encontraron roles.</span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="esNuevo ? 'Nuevo Rol' : 'Editar Rol'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '400px', width: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label for="nombreRol">Nombre del Rol *</label>
          <input
            pInputText
            id="nombreRol"
            [(ngModel)]="rol.nombreRol"
            placeholder="Ej: Administrador"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label>Estado</label>
          <div class="switch-container">
            <p-toggleswitch [(ngModel)]="rol.estado"></p-toggleswitch>
            <span class="switch-label">{{ rol.estado ? 'Activo' : 'Inactivo' }}</span>
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
      .switch-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .switch-label {
        font-weight: 400;
        color: #495057;
      }
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
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  rol: Rol = this.getNuevoRol();

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.roles = data;
        this.rolesFiltrados = data;
      },
      error: () => {
        this.roles = [];
        this.rolesFiltrados = [];
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.rolesFiltrados = this.roles.filter((r) => r.nombreRol?.toLowerCase().includes(f));
  }

  getNuevoRol(): Rol {
    return { nombreRol: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.rol = this.getNuevoRol();
    this.displayDialog = true;
  }

  editar(rol: Rol) {
    this.esNuevo = false;
    this.rol = { ...rol };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.rol.nombreRol) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre del rol es requerido',
      });
      return;
    }
    if (this.esNuevo) {
      this.rolService.crearRol({ nombreRol: this.rol.nombreRol }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol creado correctamente',
          });
          this.displayDialog = false;
          this.cargarRoles();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el rol',
          });
        },
      });
    } else {
      this.rolService.actualizarRol(this.rol.id!, this.rol).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarRoles();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el rol',
          });
        },
      });
    }
  }

  eliminar(rol: Rol) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el rol ' + rol.nombreRol + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.rolService.eliminarRol(rol.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Rol eliminado correctamente',
            });
            this.cargarRoles();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el rol',
            });
          },
        });
      },
    });
  }
}
