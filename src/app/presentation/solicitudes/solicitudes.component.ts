import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
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
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { SolicitudService } from '../../infrastructure/services/solicitud.service';
import { AuthService } from '../../infrastructure/services/auth.service';

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
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-inbox"></i> Solicitudes de Materiales
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar solicitud..." class="search-input" />
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="solicitudesFiltradas"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:100px">Folio</th>
              <th>Justificación / Motivo</th>
              <th style="width:150px">Fecha Solicitud</th>
              <th style="width:180px">Estado Actual</th>
              <th style="width:180px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sol>
            <tr>
              <td><span class="id-badge">#{{ sol.id }}</span></td>
              <td><span class="nombre-cell" [pTooltip]="sol.justificacion">{{ sol.justificacion }}</span></td>
              <td><span class="fecha-cell">{{ sol.fechaSol | date: 'MMM dd, yyyy' }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(sol.estadoSol)">
                  {{ sol.estadoSol }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    *ngIf="sol.estadoSol === 'PENDIENTE' && esAdmin()"
                    pButton
                    icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="aprobar(sol)"
                    pTooltip="Aprobar solicitud"
                  ></button>
                  <button
                    *ngIf="sol.estadoSol === 'PENDIENTE' && esAdmin()"
                    pButton
                    icon="pi pi-times"
                    class="p-button-text text-red-600 hover:bg-red-50"
                    (click)="rechazar(sol)"
                    pTooltip="Rechazar solicitud"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-eye"
                    class="p-button-text text-blue-600 hover:bg-blue-50"
                    (click)="ver(sol)"
                    pTooltip="Ver detalles"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="empty-message">
                <i class="pi pi-file"></i>
                <p>No se encontraron solicitudes pendientes</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="📋 Detalles de la Solicitud"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '550px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="detail-container mt-4" *ngIf="solicitudView">
        <div class="detail-row">
          <span class="detail-label">Número de Folio:</span>
          <span class="id-badge">#{{ solicitudView.id }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Justificación:</span>
          <span class="detail-value text-slate-600 italic">"{{ solicitudView.justificacion }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha y Hora:</span>
          <span class="detail-value font-bold">{{ solicitudView.fechaSol | date: 'dd/MM/yyyy HH:mm a' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado de Gestión:</span>
          <span class="status-badge" [ngClass]="getStatusClass(solicitudView.estadoSol)">
            {{ solicitudView.estadoSol }}
          </span>
        </div>
      </div>
      <div class="dialog-footer">
        <button
          pButton
          label="Entendido"
          class="btn-cancelar"
          (click)="displayDialog = false"
        ></button>
      </div>
    </p-dialog>
  `
})
export class SolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }
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
            this.notification.add({ module: 'Solicitudes',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Solicitud aprobada',
            });
            this.cargarSolicitudes();
          },
          error: () => {
            this.notification.add({ module: 'Solicitudes',
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
            this.notification.add({ module: 'Solicitudes',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Solicitud rechazada',
            });
            this.cargarSolicitudes();
          },
          error: () => {
            this.notification.add({ module: 'Solicitudes',
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
