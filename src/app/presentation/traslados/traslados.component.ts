import { Component, OnInit, OnDestroy, inject, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { TrasladoService } from '../../infrastructure/services/traslado.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { ApiService } from '../../core/services/api.service';

interface Traslado {
  id_traslado?: number;
  id_item?: number;
  estado?: string;
  fecha_solicitud?: string;
  justificacion?: string | null;
  observacion_resolucion?: string | null;
  id_usuario_solicita?: number;
  item?: any;
  sitio_origen?: any;
  sitio_destino?: any;
  usuario_solicita?: any;
  usuario_aprueba?: any;
}

@Component({
  selector: 'app-traslados',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule,
    TagModule, ToastModule, ConfirmDialogModule, TooltipModule,
    SelectModule, TextareaModule,
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-arrows-h"></i> Traslados de Ítems
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar por ítem, origen, destino, solicitante..." class="search-input" />
          </div>
          <button pButton label="Nuevo Traslado" icon="pi pi-plus"
            class="btn-agregar" (click)="abrirDialogoCrear()"></button>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Total</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#eef2ff;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-arrows-h" style="color:#4f46e5;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#111827;margin:0">{{ traslados.length }}</p>
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
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Aprobados</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ecfdf5;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-check-circle" style="color:#10b981;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#10b981;margin:0">{{ contarEstado('APROBADO') }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Rechazados</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-times-circle" style="color:#ef4444;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#ef4444;margin:0">{{ contarEstado('RECHAZADO') }}</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="trasladosFiltrados" [paginator]="true" [rows]="15"
          styleClass="modern-table" [rowHover]="true" dataKey="id_traslado">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">Folio</th>
              <th style="min-width:180px">Ítem</th>
              <th style="min-width:150px">Origen</th>
              <th style="min-width:150px">Destino</th>
              <th style="min-width:160px">Justificación</th>
              <th style="min-width:130px">Solicitante</th>
              <th style="min-width:110px">Fecha</th>
              <th style="min-width:120px">Estado</th>
              <th style="min-width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-t>
            <tr>
              <td><span class="id-badge">#{{ t.id_traslado }}</span></td>
              <td>
                <div>
                  <span style="font-size:13px;font-weight:600;color:#1e293b">
                    {{ t.item?.producto?.nombre ?? ('Ítem #' + t.id_item) }}
                  </span>
                  <div *ngIf="t.item?.placa_sena || t.item?.codigo_sku" style="font-size:11px;color:#94a3b8;font-family:monospace">
                    {{ t.item?.placa_sena || t.item?.codigo_sku }}
                  </div>
                </div>
              </td>
              <td>
                <span style="font-size:13px;color:#374151;display:block">{{ t.sitio_origen?.nombre ?? '—' }}</span>
                <span *ngIf="getTipoLabel(t.sitio_origen)" style="font-size:11px;color:#94a3b8">{{ getTipoLabel(t.sitio_origen) }}</span>
              </td>
              <td>
                <span style="font-size:13px;color:#374151;display:block">{{ t.sitio_destino?.nombre ?? '—' }}</span>
                <span *ngIf="getTipoLabel(t.sitio_destino)" style="font-size:11px;color:#94a3b8">{{ getTipoLabel(t.sitio_destino) }}</span>
              </td>
              <td>
                <span class="nombre-cell" [pTooltip]="t.justificacion" tooltipPosition="top">
                  {{ t.justificacion || '(sin justificación)' }}
                </span>
              </td>
              <td>
                <span style="font-size:13px;color:#374151">
                  {{ t.usuario_solicita?.nombre ?? ('Usuario #' + t.id_usuario_solicita) }}
                </span>
              </td>
              <td><span class="fecha-cell">{{ t.fecha_solicitud | date:'dd/MM/yyyy' }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(t.estado)">{{ t.estado }}</span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button *ngIf="t.estado === 'PENDIENTE' && puedeAprobarTraslado(t)"
                    pButton icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="aprobar(t)" pTooltip="Aprobar traslado" tooltipPosition="top"></button>
                  <button *ngIf="t.estado === 'PENDIENTE' && puedeAprobarTraslado(t)"
                    pButton icon="pi pi-times"
                    class="p-button-text text-red-600 hover:bg-red-50"
                    (click)="rechazar(t)" pTooltip="Rechazar traslado" tooltipPosition="top"></button>
                  <button pButton icon="pi pi-eye"
                    class="p-button-text text-slate-500 hover:bg-slate-50"
                    (click)="ver(t)" pTooltip="Ver detalles" tooltipPosition="top"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="empty-message">
                <i class="pi pi-arrows-h"></i>
                <p>No se encontraron traslados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Dialog Ver Detalles -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="📋 Detalles del Traslado"
      [(visible)]="displayDialog" [modal]="true" [style]="{ width: '560px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="detail-container mt-4" *ngIf="trasladoView">
        <div class="detail-row">
          <span class="detail-label">Folio:</span>
          <span class="id-badge">#{{ trasladoView.id_traslado }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ítem:</span>
          <span class="detail-value font-bold">
            {{ trasladoView.item?.producto?.nombre ?? ('Ítem #' + trasladoView.id_item) }}
          </span>
        </div>
        <div class="detail-row" *ngIf="trasladoView.item?.placa_sena || trasladoView.item?.codigo_sku">
          <span class="detail-label">Placa SENA / SKU:</span>
          <span class="detail-value" style="font-family:monospace">{{ trasladoView.item?.placa_sena || trasladoView.item?.codigo_sku }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Origen:</span>
          <span class="detail-value">{{ trasladoView.sitio_origen?.nombre ?? '—' }}<span *ngIf="getTipoLabel(trasladoView.sitio_origen)" class="text-slate-400"> ({{ getTipoLabel(trasladoView.sitio_origen) }})</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Destino:</span>
          <span class="detail-value">{{ trasladoView.sitio_destino?.nombre ?? '—' }}<span *ngIf="getTipoLabel(trasladoView.sitio_destino)" class="text-slate-400"> ({{ getTipoLabel(trasladoView.sitio_destino) }})</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Justificación:</span>
          <span class="detail-value text-slate-600 italic">"{{ trasladoView.justificacion || '(sin justificación)' }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Solicitante:</span>
          <span class="detail-value font-bold">{{ trasladoView.usuario_solicita?.nombre ?? ('Usuario #' + trasladoView.id_usuario_solicita) }}</span>
        </div>
        <div class="detail-row" *ngIf="trasladoView.usuario_aprueba">
          <span class="detail-label">Gestionado por:</span>
          <span class="detail-value font-bold">{{ trasladoView.usuario_aprueba?.nombre }}</span>
        </div>
        <div class="detail-row" *ngIf="trasladoView.observacion_resolucion">
          <span class="detail-label">Observación:</span>
          <span class="detail-value text-slate-600 italic">"{{ trasladoView.observacion_resolucion }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ trasladoView.fecha_solicitud | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge" [ngClass]="getStatusClass(trasladoView.estado)">{{ trasladoView.estado }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cerrar" class="btn-cancelar" (click)="displayDialog = false"></button>
      </div>
    </p-dialog>

    <!-- Dialog Nuevo Traslado -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="🚚 Solicitar Traslado por Placa SENA"
      [(visible)]="displayDialogCrear" [modal]="true" [style]="{ width: '90vw', maxWidth: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="form-container mt-4" *ngIf="displayDialogCrear">

        <!-- Paso 1: Buscar por Placa SENA -->
        <div class="form-field">
          <label>Placa SENA del ítem <span style="color:red">*</span></label>
          <div style="display:flex;gap:8px;align-items:center">
            <input pInputText
              [(ngModel)]="placaSenaTraslado"
              placeholder="Ej: PS-2024-001"
              style="flex:1;text-transform:uppercase"
              (keyup.enter)="buscarPorPlaca()"
              [disabled]="buscandoPlaca" />
            <button pButton icon="pi pi-search" label="Buscar"
              class="btn-guardar" style="white-space:nowrap;min-width:90px"
              [loading]="buscandoPlaca"
              [disabled]="!placaSenaTraslado.trim()"
              (click)="buscarPorPlaca()">
            </button>
          </div>
          <small *ngIf="errorBusquedaPlaca" style="color:#ef4444;font-size:12px;margin-top:6px;display:block">
            <i class="pi pi-times-circle mr-1"></i>{{ errorBusquedaPlaca }}
          </small>
        </div>

        <!-- Datos del ítem encontrado -->
        <div *ngIf="itemEncontradoTraslado" style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:12px;padding:14px 16px;margin-bottom:1.25rem">
          <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">
            <i class="pi pi-check-circle mr-1"></i>Ítem encontrado
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">
            <div>
              <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase">Producto</div>
              <div style="font-size:13px;font-weight:700;color:#1e293b">{{ itemEncontradoTraslado.producto?.nombre || '—' }}</div>
            </div>
            <div>
              <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase">SKU / Placa</div>
              <div style="font-size:13px;font-weight:700;color:#1e293b;font-family:monospace">
                {{ itemEncontradoTraslado.placa_sena || itemEncontradoTraslado.codigo_sku || '—' }}
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase">Estado</div>
              <div style="font-size:13px;font-weight:700"
                [style.color]="itemEncontradoTraslado.estado === 'DISPONIBLE' ? '#16a34a' : '#dc2626'">
                {{ itemEncontradoTraslado.estado }}
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase">Ubicación actual (origen)</div>
              <div style="font-size:13px;font-weight:700;color:#1e293b">{{ ubicacionActualCrear || 'Sin ubicación' }}</div>
            </div>
            <div *ngIf="responsableOrigenNombre" style="grid-column:1/-1">
              <div style="font-size:10px;color:#94a3b8;font-weight:600;text-transform:uppercase">Responsable (recibirá notificación)</div>
              <div style="font-size:13px;font-weight:700;color:#0f172a">
                <i class="pi pi-user mr-1" style="color:#6366f1"></i>{{ responsableOrigenNombre }}
              </div>
            </div>
          </div>
          <div *ngIf="itemEncontradoTraslado.prestamo_activo"
            style="margin-top:10px;background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;font-size:12px;color:#92400e">
            <i class="pi pi-info-circle mr-1"></i>
            Tiene préstamo activo — el traslado quedará pendiente de aprobación.
          </div>
        </div>

        <!-- Destino (siempre que haya ítem encontrado) -->
        <ng-container *ngIf="itemEncontradoTraslado">

          <!-- Separador de destino -->
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem;padding-bottom:4px;border-bottom:1px solid #f1f5f9">
            <i class="pi pi-map-marker mr-1" style="color:#6366f1"></i>Destino del traslado <span style="color:red">*</span>
          </div>

          <!-- Bodega -->
          <div class="form-field" *ngIf="destinosBodegaOpciones.length > 0">
            <label style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:#eef2ff;color:#4f46e5;font-size:11px;font-weight:700">B</span>
              Bodega
            </label>
            <p-select
              [options]="destinosBodegaOpciones"
              [ngModel]="destinoBodega"
              (ngModelChange)="onDestinoChange('bodega', $event)"
              optionLabel="label" optionValue="value"
              placeholder="Seleccionar bodega..."
              [filter]="true" filterPlaceholder="Buscar bodega..."
              [showClear]="true" appendTo="body" style="width:100%">
            </p-select>
          </div>

          <!-- Ambiente -->
          <div class="form-field" *ngIf="destinosAmbienteOpciones.length > 0">
            <label style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:#ecfdf5;color:#059669;font-size:11px;font-weight:700">A</span>
              Ambiente
            </label>
            <p-select
              [options]="destinosAmbienteOpciones"
              [ngModel]="destinoAmbiente"
              (ngModelChange)="onDestinoChange('ambiente', $event)"
              optionLabel="label" optionValue="value"
              placeholder="Seleccionar ambiente..."
              [filter]="true" filterPlaceholder="Buscar ambiente..."
              [showClear]="true" appendTo="body" style="width:100%">
            </p-select>
          </div>

          <!-- Laboratorio -->
          <div class="form-field" *ngIf="destinosLaboratorioOpciones.length > 0">
            <label style="display:flex;align-items:center;gap:6px">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:#fef3c7;color:#d97706;font-size:11px;font-weight:700">L</span>
              Laboratorio
            </label>
            <p-select
              [options]="destinosLaboratorioOpciones"
              [ngModel]="destinoLaboratorio"
              (ngModelChange)="onDestinoChange('laboratorio', $event)"
              optionLabel="label" optionValue="value"
              placeholder="Seleccionar laboratorio..."
              [filter]="true" filterPlaceholder="Buscar laboratorio..."
              [showClear]="true" appendTo="body" style="width:100%">
            </p-select>
          </div>

          <!-- Resumen destino seleccionado -->
          <div *ngIf="nuevoTraslado.id_sitio_destino"
            style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:8px 12px;margin-bottom:1rem;font-size:13px;font-weight:600;color:#166534">
            <i class="pi pi-check-circle mr-1"></i>Destino: {{ getDestinoLabel() }}
          </div>

          <div class="form-field">
            <label>Justificación / Motivo</label>
            <textarea pTextarea [(ngModel)]="nuevoTraslado.justificacion" rows="3"
              placeholder="Describe el motivo del traslado..."
              style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit">
            </textarea>
          </div>

          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px">
            <div style="display:flex;align-items:center;gap:8px">
              <i class="pi pi-info-circle" style="color:#3b82f6;font-size:14px"></i>
              <span style="font-size:12px;color:#1d4ed8">
                <b>{{ responsableOrigenNombre || 'El responsable del lugar' }}</b> recibirá una notificación y debe aprobar el traslado.
              </span>
            </div>
          </div>
        </ng-container>
      </div>

      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Solicitar Traslado" icon="pi pi-truck" class="btn-guardar"
          [disabled]="!itemEncontradoTraslado || !nuevoTraslado.id_sitio_destino"
          [loading]="creandoTraslado"
          (click)="guardarTraslado()">
        </button>
      </div>
    </p-dialog>
  `
})
export class TrasladosComponent implements OnInit, OnDestroy {
  private trasladoService = inject(TrasladoService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private productoService = inject(ProductoService);
  private sitioService = inject(SitioService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private changesSub!: Subscription;

  traslados: Traslado[] = [];
  trasladosFiltrados: Traslado[] = [];
  filtro = '';
  displayDialog = false;
  trasladoView: Traslado | null = null;

  displayDialogCrear = false;
  creandoTraslado = false;
  sitios: any[] = [];
  destinosOpcionesCrear: { label: string; value: number }[] = [];
  destinosBodegaOpciones: { label: string; value: number }[] = [];
  destinosAmbienteOpciones: { label: string; value: number }[] = [];
  destinosLaboratorioOpciones: { label: string; value: number }[] = [];

  // Selección de destino por tipo
  destinoBodega: number | null = null;
  destinoAmbiente: number | null = null;
  destinoLaboratorio: number | null = null;

  // Flujo por placa SENA
  placaSenaTraslado = '';
  buscandoPlaca = false;
  itemEncontradoTraslado: any = null;
  errorBusquedaPlaca: string | null = null;
  ubicacionActualCrear = '';
  responsableOrigenNombre = '';

  nuevoTraslado: { id_item: number | null; id_sitio_destino: number | null; justificacion: string } =
    { id_item: null, id_sitio_destino: null, justificacion: '' };

  private readonly TIPOS_LUGAR_VALIDOS = ['BODEGA', 'AMBIENTE', 'LABORATORIO', 'OTRO'];
  private readonly TIPOS_LUGAR_LABELS: Record<string, string> = {
    BODEGA: 'Bodega', AMBIENTE: 'Ambiente', LABORATORIO: 'Laboratorio', OTRO: 'Otro',
  };

  private get currentUserId(): number {
    return Number(this.authService.getUserId()) || 0;
  }

  private get currentRole(): string {
    return this.authService.getUserRole()?.toUpperCase() ?? '';
  }

  esAdmin(): boolean {
    return this.currentRole === 'ADMINISTRADOR' || this.currentRole === 'RESPONSABLE DE BODEGA';
  }

  puedeAprobarTraslado(t: Traslado): boolean {
    const userId = this.currentUserId;
    if (t.id_usuario_solicita === userId) return false;

    const idResponsable: number | null = t.sitio_origen?.id_responsable ?? t.sitio_origen?.responsable?.id_usuario ?? null;

    if (this.currentRole === 'ADMINISTRADOR') {
      return !idResponsable || idResponsable === userId;
    }
    // Cualquier usuario asignado como responsable del sitio origen puede aprobar
    // (sin importar si su rol es Responsable de Bodega, Instructor, etc.)
    return idResponsable === userId;
  }

  ngOnInit() {
    this.cargarTraslados();
    this.cargarSitios();
    this.changesSub = this.apiService.changes.subscribe(() => this.cargarTraslados());
  }

  ngOnDestroy() {
    this.changesSub.unsubscribe();
  }

  cargarTraslados() {
    this.trasladoService.getTraslados().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data ?? res ?? [];
        let resultado = all;
        if (!this.authService.isAdmin()) {
          const userId = this.currentUserId;
          resultado = all.filter((t: Traslado) => {
            if (t.id_usuario_solicita === userId) return true;
            const origenResp = t.sitio_origen?.id_responsable ?? t.sitio_origen?.responsable?.id_usuario ?? null;
            if (origenResp === userId) return true;
            const destinoResp = t.sitio_destino?.id_responsable ?? t.sitio_destino?.responsable?.id_usuario ?? null;
            if (destinoResp === userId) return true;
            return false;
          });
        }
        this.traslados = resultado;
        this.trasladosFiltrados = resultado;
        this.cdr.markForCheck();
      },
      error: () => { this.traslados = []; this.trasladosFiltrados = []; this.cdr.markForCheck(); },
    });
  }

  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const all = res?.data ?? res ?? [];
        this.sitios = all.filter((s: any) => this.TIPOS_LUGAR_VALIDOS.includes(s.tipo) && s.estado !== false);
        this.cdr.markForCheck();
      },
      error: () => { this.sitios = []; this.cdr.markForCheck(); },
    });
  }

  abrirDialogoCrear() {
    this.placaSenaTraslado = '';
    this.buscandoPlaca = false;
    this.itemEncontradoTraslado = null;
    this.errorBusquedaPlaca = null;
    this.ubicacionActualCrear = '';
    this.responsableOrigenNombre = '';
    this.nuevoTraslado = { id_item: null, id_sitio_destino: null, justificacion: '' };
    this.destinosOpcionesCrear = [];
    this.destinosBodegaOpciones = [];
    this.destinosAmbienteOpciones = [];
    this.destinosLaboratorioOpciones = [];
    this.destinoBodega = null;
    this.destinoAmbiente = null;
    this.destinoLaboratorio = null;
    this.displayDialogCrear = true;
  }

  buscarPorPlaca() {
    const placa = this.placaSenaTraslado.trim().toUpperCase();
    if (!placa) return;
    this.buscandoPlaca = true;
    this.itemEncontradoTraslado = null;
    this.errorBusquedaPlaca = null;
    this.ubicacionActualCrear = '';
    this.responsableOrigenNombre = '';
    this.nuevoTraslado.id_item = null;
    this.nuevoTraslado.id_sitio_destino = null;
    this.cdr.markForCheck();

    this.productoService.buscarItemPorPlaca(placa).subscribe({
      next: (res: any) => {
        this.buscandoPlaca = false;
        // El backend retorna { item, prestamo_activo, asignacion_activa, novedad_activa }
        const detalle = res?.data ?? res ?? null;
        const item = detalle?.item ?? detalle ?? null;

        if (!item || !item.id_item) {
          this.errorBusquedaPlaca = `No se encontró ningún ítem con la placa "${placa}".`;
          this.cdr.markForCheck();
          return;
        }

        // Enriquecer con datos de relaciones del detalle
        const itemEnriquecido = {
          ...item,
          prestamo_activo: detalle.prestamo_activo ?? null,
          asignacion_activa: detalle.asignacion_activa ?? null,
          novedad_activa: detalle.novedad_activa ?? null,
        };
        this.itemEncontradoTraslado = itemEnriquecido;
        this.nuevoTraslado.id_item = item.id_item;

        // Ubicación actual — viene en item.sitio (backend ahora lo carga con la relación)
        const sitioDelItem = item.sitio ?? null;
        const idSitio = item.id_sitio ?? sitioDelItem?.id_sitio ?? null;

        // Nombre y tipo del lugar actual
        const sitioLocal = this.sitios.find(s => s.id_sitio === idSitio);
        const sitioParaMostrar = sitioDelItem ?? sitioLocal;
        this.ubicacionActualCrear = sitioParaMostrar
          ? `${sitioParaMostrar.nombre}${this.getTipoLabel(sitioParaMostrar) ? '  ·  ' + this.getTipoLabel(sitioParaMostrar) : ''}`
          : 'Sin ubicación registrada';

        // Responsable — viene en item.sitio.responsable
        this.responsableOrigenNombre = sitioDelItem?.responsable?.nombre
          ?? sitioLocal?.responsable?.nombre
          ?? '';

        // Destinos: todos los sitios excepto el actual, separados por tipo
        const sitiosDestino = this.sitios
          .filter(s => s.id_sitio !== idSitio)
          .map(s => ({
            label: `${s.nombre}${s.codigo_lugar ? '  ·  ' + s.codigo_lugar : ''}`,
            value: s.id_sitio,
            tipo: s.tipo as string,
          }));
        this.destinosBodegaOpciones = sitiosDestino.filter(s => s.tipo === 'BODEGA');
        this.destinosAmbienteOpciones = sitiosDestino.filter(s => s.tipo === 'AMBIENTE');
        this.destinosLaboratorioOpciones = sitiosDestino.filter(s => s.tipo === 'LABORATORIO');
        this.destinosOpcionesCrear = sitiosDestino;
        // Resetear selección previa
        this.destinoBodega = null;
        this.destinoAmbiente = null;
        this.destinoLaboratorio = null;
        this.nuevoTraslado.id_sitio_destino = null;

        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.buscandoPlaca = false;
        const msg = err?.error?.message;
        this.errorBusquedaPlaca = msg || `No se encontró ningún ítem con la placa "${placa}".`;
        this.cdr.markForCheck();
      },
    });
  }

  guardarTraslado() {
    if (!this.nuevoTraslado.id_item || !this.nuevoTraslado.id_sitio_destino) return;
    this.creandoTraslado = true;
    const userId = Number(this.authService.getUserId()) || 1;
    this.trasladoService.crearTraslado({
      id_item: this.nuevoTraslado.id_item,
      id_sitio_destino: this.nuevoTraslado.id_sitio_destino,
      justificacion: this.nuevoTraslado.justificacion?.trim() || undefined,
      id_usuario_solicita: userId,
    }).subscribe({
      next: () => {
        this.notification.add({ module: 'Traslados', severity: 'success', summary: 'Solicitud enviada', detail: `Traslado solicitado. ${this.responsableOrigenNombre ? this.responsableOrigenNombre + ' recibirá' : 'El responsable recibirá'} una notificación para aprobar.` });
        this.creandoTraslado = false;
        this.displayDialogCrear = false;
        this.cargarTraslados();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.creandoTraslado = false;
        this.cdr.markForCheck();
        this.notification.add({ module: 'Traslados', severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo solicitar el traslado' });
      },
    });
  }

  onDestinoChange(tipo: 'bodega' | 'ambiente' | 'laboratorio', valor: number | null) {
    this.destinoBodega = tipo === 'bodega' ? valor : null;
    this.destinoAmbiente = tipo === 'ambiente' ? valor : null;
    this.destinoLaboratorio = tipo === 'laboratorio' ? valor : null;
    this.nuevoTraslado.id_sitio_destino = valor;
  }

  getDestinoLabel(): string {
    const id = this.nuevoTraslado.id_sitio_destino;
    if (!id) return '';
    const opt = this.destinosOpcionesCrear.find(o => o.value === id);
    return opt?.label ?? '';
  }

  getTipoLabel(sitio: any): string {
    if (!sitio) return '';
    const tipo = sitio.tipo === 'OTRO' ? (sitio.tipo_personalizado || 'Otro') : (this.TIPOS_LUGAR_LABELS[sitio.tipo] || sitio.tipo || '');
    return sitio.codigo_lugar ? `${tipo} · ${sitio.codigo_lugar}` : tipo;
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.trasladosFiltrados = this.traslados.filter(t =>
      (t.item?.producto?.nombre ?? '').toLowerCase().includes(f) ||
      (t.sitio_origen?.nombre ?? '').toLowerCase().includes(f) ||
      (t.sitio_destino?.nombre ?? '').toLowerCase().includes(f) ||
      (t.justificacion ?? '').toLowerCase().includes(f) ||
      (t.usuario_solicita?.nombre ?? '').toLowerCase().includes(f) ||
      (t.estado ?? '').toLowerCase().includes(f)
    );
  }

  contarEstado(estado: string): number {
    return this.traslados.filter(t => t.estado === estado).length;
  }

  getStatusClass(estado: string | undefined): string {
    if (estado === 'PENDIENTE') return 'status-pendiente';
    if (estado === 'APROBADO') return 'status-aprobada';
    if (estado === 'RECHAZADO') return 'status-rechazada';
    return 'status-info';
  }

  ver(t: Traslado) {
    this.trasladoView = t;
    this.displayDialog = true;
  }

  aprobar(t: Traslado) {
    this.confirmationService.confirm({
      message: `¿Aprobar el traslado de <b>${t.item?.producto?.nombre ?? 'este ítem'}</b> hacia <b>${t.sitio_destino?.nombre ?? 'el destino solicitado'}</b>?`,
      header: 'Confirmar traslado',
      icon: 'pi pi-check-circle',
      accept: () => {
        const adminId = Number(this.authService.getUserId()) || 1;
        this.trasladoService.aprobar(t.id_traslado!, adminId).subscribe({
          next: () => {
            this.notification.add({ module: 'Traslados', severity: 'success', summary: 'Aprobado', detail: 'Traslado aprobado. El ítem ahora pertenece a su nueva ubicación.' });
            this.cargarTraslados();
          },
          error: (err) => this.notification.add({ module: 'Traslados', severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo aprobar' }),
        });
      },
    });
  }

  rechazar(t: Traslado) {
    this.confirmationService.confirm({
      message: `¿Rechazar el traslado de <b>${t.item?.producto?.nombre ?? 'este ítem'}</b>?`,
      header: 'Confirmar rechazo',
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const adminId = Number(this.authService.getUserId()) || 1;
        this.trasladoService.rechazar(t.id_traslado!, adminId).subscribe({
          next: () => {
            this.notification.add({ module: 'Traslados', severity: 'warn', summary: 'Rechazado', detail: 'Traslado rechazado' });
            this.cargarTraslados();
          },
          error: (err) => this.notification.add({ module: 'Traslados', severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo rechazar' }),
        });
      },
    });
  }
}
