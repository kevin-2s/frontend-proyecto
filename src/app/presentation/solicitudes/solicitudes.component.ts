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
  id_solicitud?: number;
  id?: number;
  observacion?: string | null;
  justificacion?: string;
  fecha?: string;
  estado?: string;
  tipo?: string;
  id_usuario?: number;
  id_usuario_aprueba?: number | null;
  usuario?: any;
  usuario_aprueba?: any;
  ficha?: any;
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
    <p-toast position="bottom-right"></p-toast>
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
          <button
            pButton
            label="Nueva Solicitud"
            icon="pi pi-plus"
            class="btn-agregar"
            (click)="abrirDialogoCrear()"
          ></button>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Total</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-list" style="color:#3b82f6;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#111827;margin:0">{{ solicitudes.length }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Pendientes</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef9c3;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-clock" style="color:#eab308;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#eab308;margin:0">{{ contarEstado('PENDIENTE') }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Aprobadas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ecfdf5;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-check-circle" style="color:#10b981;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#10b981;margin:0">{{ contarEstado('APROBADA') }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Rechazadas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-times-circle" style="color:#ef4444;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#ef4444;margin:0">{{ contarEstado('RECHAZADA') }}</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="solicitudesFiltradas"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:90px">Folio</th>
              <th>Justificación / Motivo</th>
              <th style="width:140px">Tipo</th>
              <th style="width:150px">Fecha Solicitud</th>
              <th style="width:150px">Solicitante</th>
              <th style="width:160px">Estado Actual</th>
              <th style="width:160px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sol>
            <tr>
              <td><span class="id-badge">#{{ getId(sol) }}</span></td>
              <td>
                <span class="nombre-cell" [pTooltip]="getObservacion(sol)">
                  {{ getObservacion(sol) || '(sin descripción)' }}
                </span>
              </td>
              <td>
                <span style="font-size:12px;font-weight:600;color:#374151">{{ sol.tipo ?? 'PRESTAMO' }}</span>
              </td>
              <td><span class="fecha-cell">{{ sol.fecha | date: 'MMM dd, yyyy' }}</span></td>
              <td>
                <span style="font-size:13px;color:#374151">
                  {{ sol.usuario?.nombre ?? ('Usuario #' + sol.id_usuario) }}
                </span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(sol.estado)">
                  {{ sol.estado }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    *ngIf="sol.estado === 'PENDIENTE' && esAdmin()"
                    pButton
                    icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="aprobar(sol)"
                    pTooltip="Aprobar solicitud"
                  ></button>
                  <button
                    *ngIf="sol.estado === 'PENDIENTE' && esAdmin()"
                    pButton
                    icon="pi pi-times"
                    class="p-button-text text-red-600 hover:bg-red-50"
                    (click)="rechazar(sol)"
                    pTooltip="Rechazar solicitud"
                  ></button>
                  <button
                    *ngIf="sol.estado === 'APROBADA' && esAdmin()"
                    pButton
                    icon="pi pi-send"
                    class="p-button-text text-emerald-600 hover:bg-emerald-50"
                    (click)="entregar(sol)"
                    pTooltip="Marcar como entregada"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-eye"
                    class="p-button-text text-emerald-600 hover:bg-emerald-50"
                    (click)="ver(sol)"
                    pTooltip="Ver detalles"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">
                <i class="pi pi-inbox"></i>
                <p>No se encontraron solicitudes</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Dialog Ver Detalles -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="📋 Detalles de la Solicitud"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '550px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
    >
      <div class="detail-container mt-4" *ngIf="solicitudView">
        <div class="detail-row">
          <span class="detail-label">Número de Folio:</span>
          <span class="id-badge">#{{ getId(solicitudView) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo:</span>
          <span class="detail-value font-bold">{{ solicitudView.tipo ?? 'PRESTAMO' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Justificación:</span>
          <span class="detail-value text-slate-600 italic">"{{ getObservacion(solicitudView) || '(sin descripción)' }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Solicitante:</span>
          <span class="detail-value font-bold">{{ solicitudView.usuario?.nombre ?? ('Usuario #' + solicitudView.id_usuario) }}</span>
        </div>
        <div class="detail-row" *ngIf="solicitudView.usuario_aprueba">
          <span class="detail-label">Aprobada/Rechazada por:</span>
          <span class="detail-value font-bold">{{ solicitudView.usuario_aprueba?.nombre }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha y Hora:</span>
          <span class="detail-value font-bold">{{ solicitudView.fecha | date: 'dd/MM/yyyy HH:mm a' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado de Gestión:</span>
          <span class="status-badge" [ngClass]="getStatusClass(solicitudView.estado)">
            {{ solicitudView.estado }}
          </span>
        </div>
        <div class="detail-row" *ngIf="solicitudView.ficha">
          <span class="detail-label">Ficha:</span>
          <span class="detail-value">{{ solicitudView.ficha?.programa ?? solicitudView.ficha?.numeroFicha ?? '—' }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cerrar" class="btn-cancelar" (click)="displayDialog = false"></button>
      </div>
    </p-dialog>

    <!-- Dialog Nueva Solicitud -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="➕ Nueva Solicitud"
      [(visible)]="displayDialogCrear"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
    >
      <div class="form-container mt-4" *ngIf="displayDialogCrear">
        <div class="form-group">
          <label class="form-label">Tipo de Solicitud <span class="required">*</span></label>
          <select class="form-select-native" [(ngModel)]="nuevaSolicitud.tipo">
            <option value="PRESTAMO">Préstamo</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Justificación / Motivo</label>
          <textarea [(ngModel)]="nuevaSolicitud.observacion" rows="4"
            placeholder="Describe el motivo de la solicitud..."
            class="form-input" style="resize:vertical;font-family:inherit"></textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Enviar Solicitud" icon="pi pi-send" class="btn-guardar"
          (click)="guardarSolicitud()"></button>
      </div>
    </p-dialog>
  `
})
export class SolicitudesComponent implements OnInit {
  private solicitudService = inject(SolicitudService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  filtro = '';
  displayDialog = false;
  displayDialogCrear = false;
  solicitudView: Solicitud | null = null;
  nuevaSolicitud: { tipo: string; observacion: string } = { tipo: 'PRESTAMO', observacion: '' };

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  getId(sol: Solicitud): number {
    return sol.id_solicitud ?? sol.id ?? 0;
  }

  getObservacion(sol: Solicitud): string {
    return sol.observacion ?? sol.justificacion ?? '';
  }

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
      (s) =>
        (this.getObservacion(s)).toLowerCase().includes(f) ||
        (s.estado ?? '').toLowerCase().includes(f) ||
        (s.tipo ?? '').toLowerCase().includes(f) ||
        (s.usuario?.nombre ?? '').toLowerCase().includes(f)
    );
  }

  contarEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado === estado).length;
  }

  getStatusClass(estado: string | undefined): string {
    if (estado === 'PENDIENTE') return 'status-pendiente';
    if (estado === 'APROBADA' || estado === 'ENTREGADA') return 'status-aprobada';
    return 'status-rechazada';
  }

  ver(sol: Solicitud) {
    this.solicitudView = sol;
    this.displayDialog = true;
  }

  abrirDialogoCrear() {
    this.nuevaSolicitud = { tipo: 'PRESTAMO', observacion: '' };
    this.displayDialogCrear = true;
  }

  guardarSolicitud() {
    const userId = this.authService.getUserId() ?? 1;
    this.solicitudService.crearSolicitud({
      tipo: this.nuevaSolicitud.tipo as any,
      observacion: this.nuevaSolicitud.observacion || undefined,
      id_usuario: userId,
    }).subscribe({
      next: () => {
        this.notification.add({
          module: 'Solicitudes',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Solicitud creada correctamente',
        });
        this.displayDialogCrear = false;
        this.cargarSolicitudes();
      },
      error: () => {
        this.notification.add({
          module: 'Solicitudes',
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la solicitud',
        });
      },
    });
  }

  aprobar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: '¿Aprobar esta solicitud?',
      header: 'Confirmar',
      icon: 'pi pi-check-circle',
      accept: () => {
        const adminId = this.authService.getUserId() ?? 1;
        this.solicitudService.actualizarEstado(this.getId(sol), { estadoSol: 'APROBADA', id_usuario_aprueba: adminId }).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Éxito', detail: 'Solicitud aprobada' });
            this.cargarSolicitudes();
          },
          error: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'error', summary: 'Error', detail: 'No se pudo aprobar' });
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
        const adminId = this.authService.getUserId() ?? 1;
        this.solicitudService.actualizarEstado(this.getId(sol), { estadoSol: 'RECHAZADA', id_usuario_aprueba: adminId }).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Éxito', detail: 'Solicitud rechazada' });
            this.cargarSolicitudes();
          },
          error: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'error', summary: 'Error', detail: 'No se pudo rechazar' });
          },
        });
      },
    });
  }

  entregar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: '¿Marcar esta solicitud como entregada?',
      header: 'Confirmar Entrega',
      icon: 'pi pi-send',
      accept: () => {
        this.solicitudService.actualizarEstado(this.getId(sol), { estadoSol: 'ENTREGADA' }).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Éxito', detail: 'Solicitud marcada como entregada' });
            this.cargarSolicitudes();
          },
          error: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
          },
        });
      },
    });
  }
}
