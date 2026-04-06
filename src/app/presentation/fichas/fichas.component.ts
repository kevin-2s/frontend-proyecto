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
import { FichaService } from '../../infrastructure/services/ficha.service';

interface Ficha {
  id?: number;
  numeroFiscal: string;
  programa: string;
  estado?: boolean;
}

@Component({
  selector: 'app-fichas',
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
        <div class="toolbar-center"><h2 class="page-title">Gestionar Fichas</h2></div>
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box"
            ><i class="pi pi-search"></i
            ><input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar fichas..."
              class="search-input"
          /></span>
        </div>
      </div>
      <div class="table-card">
        <p-table
          [value]="fichasFiltradas"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} fichas"
          [tableStyle]="{ 'min-width': '50rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header"
            ><tr>
              <th pSortableColumn="id" style="width:80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="numeroFiscal">
                Número de Ficha <p-sortIcon field="numeroFiscal"></p-sortIcon>
              </th>
              <th pSortableColumn="programa">
                Programa de Formación <p-sortIcon field="programa"></p-sortIcon>
              </th>
              <th pSortableColumn="estado" style="width:100px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width:100px;text-align:center">Acciones</th>
            </tr></ng-template
          >
          <ng-template pTemplate="body" let-ficha
            ><tr>
              <td>
                <span class="id-badge">#{{ ficha.id }}</span>
              </td>
              <td>
                <span class="nombre-cell">{{ ficha.numeroFiscal }}</span>
              </td>
              <td>
                <span class="correo-cell">{{ ficha.programa }}</span>
              </td>
              <td>
                <p-tag
                  [value]="ficha.estado ? 'Activa' : 'Inactiva'"
                  [severity]="ficha.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="btn-edit p-button-sm p-button-text"
                  (click)="editar(ficha)"
                  pTooltip="Editar"
                ></button
                ><button
                  pButton
                  icon="pi pi-trash"
                  class="btn-delete p-button-sm p-button-text"
                  (click)="eliminar(ficha)"
                  pTooltip="Eliminar"
                ></button>
              </td></tr
          ></ng-template>
          <ng-template pTemplate="emptymessage"
            ><tr>
              <td colspan="5" class="empty-message">
                <i class="pi pi-book"></i><span>No se encontraron fichas.</span>
              </td>
            </tr></ng-template
          >
        </p-table>
      </div>
    </div>
    <p-dialog
      [header]="esNuevo ? 'Nueva Ficha' : 'Editar Ficha'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '450px', width: '450px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label for="numeroFiscal">Número de Ficha *</label
          ><input
            pInputText
            id="numeroFiscal"
            [(ngModel)]="ficha.numeroFiscal"
            placeholder="Ej: 1234567"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label for="programa">Programa de Formación *</label
          ><input
            pInputText
            id="programa"
            [(ngModel)]="ficha.programa"
            placeholder="Ej: Análisis y Desarrollo de Software"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label>Estado</label>
          <div class="switch-container">
            <p-toggleswitch [(ngModel)]="ficha.estado"></p-toggleswitch
            ><span class="switch-label">{{ ficha.estado ? 'Activa' : 'Inactiva' }}</span>
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
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  fichas: Ficha[] = [];
  fichasFiltradas: Ficha[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  ficha: Ficha = this.getNuevaFiscal();
  ngOnInit() {
    this.cargarFichas();
  }
  cargarFichas() {
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.fichas = d;
        this.fichasFiltradas = d;
      },
      error: () => {
        this.fichas = [];
        this.fichasFiltradas = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (fi) => fi.numeroFiscal?.toLowerCase().includes(f) || fi.programa?.toLowerCase().includes(f),
    );
  }
  getNuevaFiscal(): Ficha {
    return { numeroFiscal: '', programa: '', estado: true };
  }
  openNew() {
    this.esNuevo = true;
    this.ficha = this.getNuevaFiscal();
    this.displayDialog = true;
  }
  editar(fi: Ficha) {
    this.esNuevo = false;
    this.ficha = { ...fi };
    this.displayDialog = true;
  }
  guardar() {
    if (!this.ficha.numeroFiscal || !this.ficha.programa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.esNuevo) {
      this.fichaService.crearFiscal(this.ficha).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Fiscal creada correctamente',
          });
          this.displayDialog = false;
          this.cargarFichas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la ficha',
          });
        },
      });
    } else {
      this.fichaService.actualizarFiscal(this.ficha.id!, this.ficha).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Fiscal actualizada correctamente',
          });
          this.displayDialog = false;
          this.cargarFichas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la ficha',
          });
        },
      });
    }
  }
  eliminar(fi: Ficha) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la ficha ' + fi.numeroFiscal + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fichaService.eliminarFiscal(fi.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Fiscal eliminada correctamente',
            });
            this.cargarFichas();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la ficha',
            });
          },
        });
      },
    });
  }
}
