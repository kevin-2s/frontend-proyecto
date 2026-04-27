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
import { CategoriaService } from '../../infrastructure/services/categoria.service';

interface Categoria {
  id?: number;
  nombreCat: string;
  estado?: boolean;
}

@Component({
  selector: 'app-categoria',
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
        <div class="toolbar-center"><h2 class="page-title">Gestionar Categorías</h2></div>
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box"
            ><i class="pi pi-search"></i
            ><input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar categorías..."
              class="search-input"
          /></span>
        </div>
      </div>
      <div class="table-card">
        <p-table
          [value]="categoriasFiltradas"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
          [tableStyle]="{ 'min-width': '40rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header"
            ><tr>
              <th pSortableColumn="id" style="width:80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="nombreCat">
                Nombre de Categoría <p-sortIcon field="nombreCat"></p-sortIcon>
              </th>
              <th pSortableColumn="estado" style="width:100px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width:100px;text-align:center">Acciones</th>
            </tr></ng-template
          >
          <ng-template pTemplate="body" let-cat
            ><tr>
              <td>
                <span class="id-badge">#{{ cat.id }}</span>
              </td>
              <td>
                <span class="nombre-cell">{{ cat.nombreCat }}</span>
              </td>
              <td>
                <p-tag
                  [value]="cat.estado ? 'Activa' : 'Inactiva'"
                  [severity]="cat.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="btn-edit p-button-sm p-button-text"
                  (click)="editar(cat)"
                  pTooltip="Editar"
                ></button
                ><button
                  pButton
                  icon="pi pi-trash"
                  class="btn-delete p-button-sm p-button-text"
                  (click)="eliminar(cat)"
                  pTooltip="Eliminar"
                ></button>
              </td></tr
          ></ng-template>
          <ng-template pTemplate="emptymessage"
            ><tr>
              <td colspan="4" class="empty-message">
                <i class="pi pi-tag"></i><span>No se encontraron categorías.</span>
              </td>
            </tr></ng-template
          >
        </p-table>
      </div>
    </div>
    <p-dialog
      [header]="esNuevo ? 'Nueva Categoría' : 'Editar Categoría'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '400px', width: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label for="nombreCat">Nombre de Categoría *</label
          ><input
            pInputText
            id="nombreCat"
            [(ngModel)]="categoria.nombreCat"
            placeholder="Ej: Herramientas"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label>Estado</label>
          <div class="switch-container">
            <p-toggleswitch [(ngModel)]="categoria.estado"></p-toggleswitch
            ><span class="switch-label">{{ categoria.estado ? 'Activa' : 'Inactiva' }}</span>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer"
        ><div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            icon="pi pi-times"
            class="btn-cancel"
            (click)="displayDialog = false"
          ></button
          ><button
            pButton
            label="Guardar"
            icon="pi pi-check"
            class="btn-save"
            (click)="guardar()"
          ></button></div
      ></ng-template>
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
export class CategoriaComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  categoria: Categoria = this.getNuevaCategoria();
  ngOnInit() {
    this.cargarCategorias();
  }
  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.categorias = d;
        this.categoriasFiltradas = d;
      },
      error: () => {
        this.categorias = [];
        this.categoriasFiltradas = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter((c) =>
      c.nombreCat?.toLowerCase().includes(f),
    );
  }
  getNuevaCategoria(): Categoria {
    return { nombreCat: '', estado: true };
  }
  openNew() {
    this.esNuevo = true;
    this.categoria = this.getNuevaCategoria();
    this.displayDialog = true;
  }
  editar(cat: Categoria) {
    this.esNuevo = false;
    this.categoria = { ...cat };
    this.displayDialog = true;
  }
  guardar() {
    if (!this.categoria.nombreCat) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre de la categoría es requerido',
      });
      return;
    }
    if (this.esNuevo) {
      this.categoriaService.crearCategoria({ nombreCat: this.categoria.nombreCat }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría creada correctamente',
          });
          this.displayDialog = false;
          this.cargarCategorias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la categoría',
          });
        },
      });
    } else {
      this.categoriaService.actualizarCategoria(this.categoria.id!, this.categoria).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría actualizada correctamente',
          });
          this.displayDialog = false;
          this.cargarCategorias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la categoría',
          });
        },
      });
    }
  }
  eliminar(cat: Categoria) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la categoría ' + cat.nombreCat + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.eliminarCategoria(cat.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría eliminada correctamente',
            });
            this.cargarCategorias();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la categoría',
            });
          },
        });
      },
    });
  }
}
