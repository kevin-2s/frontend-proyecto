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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SolicitudService } from '../../infrastructure/services/solicitud.service';

interface Solicitud {
  id?: number;
  justificacion: string;
  fechaSol: string;
  estadoSol: string;
}

@Component({
  selector: 'app-solicitudes',
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
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="toolbar">
        <div class="toolbar-center"><h2 class="page-title">Gestionar Solicitudes</h2></div>
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box"
            ><i class="pi pi-search"></i
            ><input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar solicitudes..."
              class="search-input"
          /></span>
        </div>
      </div>
      <div class="table-card">
        <p-table
          [value]="solicitudesFiltradas"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} solicitudes"
          [tableStyle]="{ 'min-width': '60rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header"
            ><tr>
              <th pSortableColumn="id" style="width:80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="justificacion">
                Justificación <p-sortIcon field="justificacion"></p-sortIcon>
              </th>
              <th pSortableColumn="fechaSol" style="width:120px">
                Fecha <p-sortIcon field="fechaSol"></p-sortIcon>
              </th>
              <th pSortableColumn="estadoSol" style="width:120px">
                Estado <p-sortIcon field="estadoSol"></p-sortIcon>
              </th>
              <th style="width:140px;text-align:center">Acciones</th>
            </tr></ng-template
          >
          <ng-template pTemplate="body" let-sol
            ><tr>
              <td>
                <span class="id-badge">#{{ sol.id }}</span>
              </td>
              <td>
                <span class="nombre-cell">{{ sol.justificacion }}</span>
              </td>
              <td>
                <span class="fecha-cell">{{ sol.fechaSol | date: 'dd/MM/yyyy' }}</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(sol.estadoSol)">{{
                  sol.estadoSol
                }}</span>
              </td>
              <td class="action-buttons">
                <button
                  *ngIf="sol.estadoSol === 'PENDIENTE'"
                  pButton
                  icon="pi pi-check"
                  class="btn-approve p-button-sm p-button-text"
                  (click)="aprobar(sol)"
                  pTooltip="Aprobar"
                ></button
                ><button
                  *ngIf="sol.estadoSol === 'PENDIENTE'"
                  pButton
                  icon="pi pi-times"
                  class="btn-reject p-button-sm p-button-text"
                  (click)="rechazar(sol)"
                  pTooltip="Rechazar"
                ></button
                ><button
                  pButton
                  icon="pi pi-eye"
                  class="btn-view p-button-sm p-button-text"
                  (click)="ver(sol)"
                  pTooltip="Ver"
                ></button>
              </td></tr
          ></ng-template>
          <ng-template pTemplate="emptymessage"
            ><tr>
              <td colspan="5" class="empty-message">
                <i class="pi pi-file"></i><span>No se encontraron solicitudes.</span>
              </td>
            </tr></ng-template
          >
        </p-table>
      </div>
    </div>
    <p-dialog
      [header]="'Detalles de Solicitud'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '500px', width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="detail-container" *ngIf="solicitudView">
        <div class="detail-row">
          <span class="detail-label">ID:</span
          ><span class="detail-value">#{{ solicitudView.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Justificación:</span
          ><span class="detail-value">{{ solicitudView.justificacion }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span
          ><span class="detail-value">{{ solicitudView.fechaSol | date: 'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span
          ><span class="status-badge" [ngClass]="getStatusClass(solicitudView.estadoSol)">{{
            solicitudView.estadoSol
          }}</span>
        </div>
      </div>
      <ng-template pTemplate="footer"
        ><div class="dialog-footer">
          <button
            pButton
            label="Cerrar"
            icon="pi pi-times"
            class="btn-cancel"
            (click)="displayDialog = false"
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
      .fecha-cell {
        color: #6c757d;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .status-pendiente {
        background: #fef3c7;
        color: #d97706;
      }
      .status-aprobada {
        background: #d1fae5;
        color: #059669;
      }
      .status-rechazada {
        background: #fee2e2;
        color: #dc2626;
      }
      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 4px;
      }
      .btn-approve {
        color: #39a900 !important;
      }
      .btn-approve:hover {
        background-color: #d1fae5 !important;
      }
      .btn-reject {
        color: #dc3545 !important;
      }
      .btn-reject:hover {
        background-color: #fee2e2 !important;
      }
      .btn-view {
        color: #0d6efd !important;
      }
      .btn-view:hover {
        background-color: #e7f1ff !important;
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
      .detail-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .detail-row {
        display: flex;
        gap: 12px;
      }
      .detail-label {
        font-weight: 600;
        color: #495057;
        min-width: 100px;
      }
      .detail-value {
        color: #212529;
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
export class SolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  filtro = '';
  displayDialog = false;
  solicitudView: Solicitud | null = null;
  ngOnInit() {
    this.cargarSolicitudes();
  }
  cargarSolicitudes() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.solicitudes = d;
        this.solicitudesFiltradas = d;
      },
      error: () => {
        this.solicitudes = [];
        this.solicitudesFiltradas = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.solicitudesFiltradas = this.solicitudes.filter(
      (s) => s.justificacion?.toLowerCase().includes(f) || s.estadoSol?.toLowerCase().includes(f),
    );
  }
  getStatusClass(estado: string): string {
    if (estado === 'PENDIENTE') return 'status-pendiente';
    if (estado === 'APROBADA') return 'status-aprobada';
    return 'status-rechazada';
  }
  ver(sol: Solicitud) {
    this.solicitudView = sol;
    this.displayDialog = true;
  }
  aprobar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: '¿Aprobar esta solicitud?',
      header: 'Confirmar',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.solicitudService.actualizarEstado(sol.id!, { estadoSol: 'APROBADA' }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Solicitud aprobada',
            });
            this.cargarSolicitudes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo aprobar',
            });
          },
        });
      },
    });
  }
  rechazar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: '¿Rechazar esta solicitud?',
      header: 'Confirmar',
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.solicitudService.actualizarEstado(sol.id!, { estadoSol: 'RECHAZADA' }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Solicitud rechazada',
            });
            this.cargarSolicitudes();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo rechazar',
            });
          },
        });
      },
    });
  }
}
