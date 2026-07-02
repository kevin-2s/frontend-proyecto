import { Component, OnInit, OnDestroy, inject, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { SolicitudService } from '../../infrastructure/services/solicitud.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { ApiService } from '../../core/services/api.service';

interface Solicitud {
  id_solicitud?: number;
  observacion?: string | null;
  fecha?: string;
  estado?: string;
  tipo?: string;
  id_usuario?: number;
  id_producto?: number | null;
  cantidad?: number;
  id_usuario_aprueba?: number | null;
  usuario?: any;
  usuario_aprueba?: any;
  ficha?: any;
  producto?: any;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, InputNumberModule, DialogModule,
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
          <i class="pi pi-inbox"></i> Solicitudes de Materiales
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar por producto, bodega, solicitante..." class="search-input" />
          </div>
          <button pButton label="Nueva Solicitud" icon="pi pi-plus"
            class="btn-agregar" (click)="abrirDialogoCrear()"></button>
        </div>
      </div>

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
        <!-- Badge de pendientes para aprobar (solo visible para quien puede aprobar) -->
        <div *ngIf="pendientesParaAprobar > 0"
          style="background:#fffbeb;border-radius:16px;padding:1.25rem;border:2px solid #fbbf24;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.05em">Tu aprobación</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef3c7;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-bell" style="color:#d97706;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#d97706;margin:0">{{ pendientesParaAprobar }}</p>
          <div style="font-size:11px;color:#92400e;margin-top:2px">esperando tu respuesta</div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="solicitudesFiltradas" [paginator]="true" [rows]="15"
          [rowsPerPageOptions]="[10,15,25]" styleClass="modern-table" [rowHover]="true"
          dataKey="id_solicitud">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">Folio</th>
              <th style="min-width:180px">Producto</th>
              <th style="min-width:140px">Bodega / Responsable</th>
              <th style="width:90px" class="text-center">Cant.</th>
              <th style="min-width:180px">Justificación</th>
              <th style="min-width:130px">Solicitante</th>
              <th style="min-width:110px">Fecha</th>
              <th style="min-width:130px">Estado</th>
              <th style="min-width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sol>
            <tr [style.background]="esPendienteParaMi(sol) ? '#fffbeb' : ''">
              <td>
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="id-badge">#{{ sol.id_solicitud }}</span>
                  <i *ngIf="esPendienteParaMi(sol)" class="pi pi-bell"
                    style="color:#d97706;font-size:12px" pTooltip="Requiere tu aprobación" tooltipPosition="top"></i>
                </div>
              </td>
              <td>
                <div>
                  <span style="font-size:13px;font-weight:600;color:#1e293b">
                    {{ sol.producto?.nombre ?? (sol.id_producto ? 'Producto #' + sol.id_producto : '—') }}
                  </span>
                  <div *ngIf="sol.producto?.SKU" style="font-size:11px;color:#94a3b8;font-family:monospace">
                    {{ sol.producto.SKU }}
                  </div>
                </div>
              </td>
              <td>
                <span style="font-size:13px;color:#374151;display:block">
                  {{ getBodegaNombre(sol) }}
                </span>
                <span *ngIf="getBodegaResponsable(sol)" style="font-size:11px;color:#6366f1;font-weight:600">
                  <i class="pi pi-user" style="font-size:10px;margin-right:3px"></i>{{ getBodegaResponsable(sol) }}
                </span>
                <span *ngIf="!getBodegaResponsable(sol) && getBodegaNombre(sol) !== '—'"
                  style="font-size:11px;color:#94a3b8">Sin responsable</span>
              </td>
              <td class="text-center">
                <span style="font-weight:700;color:#1e293b;font-size:15px">{{ sol.cantidad ?? 1 }}</span>
              </td>
              <td>
                <span class="nombre-cell" [pTooltip]="sol.observacion" tooltipPosition="top">
                  {{ sol.observacion || '(sin justificación)' }}
                </span>
              </td>
              <td>
                <span style="font-size:13px;color:#374151">
                  {{ sol.usuario?.nombre ?? ('Usuario #' + sol.id_usuario) }}
                </span>
                <div *ngIf="sol.id_usuario === currentUserId"
                  style="font-size:10px;color:#6366f1;font-weight:700">TÚ</div>
              </td>
              <td><span class="fecha-cell">{{ sol.fecha | date:'dd/MM/yyyy' }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(sol.estado)">{{ sol.estado }}</span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button *ngIf="sol.estado === 'PENDIENTE' && puedeAprobarSolicitud(sol)"
                    pButton icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="aprobar(sol)" pTooltip="Aprobar solicitud" tooltipPosition="top"></button>
                  <button *ngIf="sol.estado === 'PENDIENTE' && puedeAprobarSolicitud(sol)"
                    pButton icon="pi pi-times"
                    class="p-button-text text-red-600 hover:bg-red-50"
                    (click)="rechazar(sol)" pTooltip="Rechazar solicitud" tooltipPosition="top"></button>
                  <button *ngIf="sol.estado === 'APROBADA' && puedeAprobarSolicitud(sol)"
                    pButton icon="pi pi-send"
                    class="p-button-text text-emerald-600 hover:bg-emerald-50"
                    (click)="entregar(sol)" pTooltip="Marcar como entregada" tooltipPosition="top"></button>
                  <button pButton icon="pi pi-eye"
                    class="p-button-text text-slate-500 hover:bg-slate-50"
                    (click)="ver(sol)" pTooltip="Ver detalles" tooltipPosition="top"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="empty-message">
                <i class="pi pi-inbox"></i>
                <p>No se encontraron solicitudes</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="Detalles de la Solicitud"
      [(visible)]="displayDialog" [modal]="true" [style]="{ width: '560px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="detail-container mt-4" *ngIf="solicitudView">
        <div class="detail-row">
          <span class="detail-label">Folio:</span>
          <span class="id-badge">#{{ solicitudView.id_solicitud }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Producto solicitado:</span>
          <span class="detail-value font-bold">
            {{ solicitudView.producto?.nombre ?? (solicitudView.id_producto ? 'Producto #' + solicitudView.id_producto : '—') }}
          </span>
        </div>
        <div class="detail-row" *ngIf="solicitudView.producto?.SKU">
          <span class="detail-label">SKU:</span>
          <span class="detail-value" style="font-family:monospace">{{ solicitudView.producto.SKU }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bodega:</span>
          <span class="detail-value">
            {{ getBodegaNombre(solicitudView) }}
            <span *ngIf="getBodegaResponsable(solicitudView)" style="color:#6366f1;font-size:12px;margin-left:6px">
              (Resp: {{ getBodegaResponsable(solicitudView) }})
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cantidad:</span>
          <span class="detail-value font-bold">{{ solicitudView.cantidad ?? 1 }} unidad(es)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Justificación:</span>
          <span class="detail-value text-slate-600 italic">"{{ solicitudView.observacion || '(sin justificación)' }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Solicitante:</span>
          <span class="detail-value font-bold">{{ solicitudView.usuario?.nombre ?? ('Usuario #' + solicitudView.id_usuario) }}</span>
        </div>
        <div class="detail-row" *ngIf="solicitudView.usuario_aprueba">
          <span class="detail-label">Gestionado por:</span>
          <span class="detail-value font-bold">{{ solicitudView.usuario_aprueba?.nombre }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ solicitudView.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge" [ngClass]="getStatusClass(solicitudView.estado)">{{ solicitudView.estado }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cerrar" class="btn-cancelar" (click)="displayDialog = false"></button>
      </div>
    </p-dialog>

    <!-- Dialog Nueva Solicitud -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="Nueva Solicitud de Préstamo"
      [(visible)]="displayDialogCrear" [modal]="true" [style]="{ width: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="form-container mt-4" *ngIf="displayDialogCrear">

        <!-- Paso 1: Bodega -->
        <div class="form-field">
          <label>Bodega <span style="color:red">*</span></label>
          <p-select
            [options]="bodegasOpciones"
            [ngModel]="nuevaSolicitud.id_bodega"
            (ngModelChange)="onBodegaChange($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar bodega..."
            [filter]="true"
            filterPlaceholder="Buscar bodega..."
            appendTo="body"
            [showClear]="true"
            style="width:100%">
          </p-select>
        </div>

        <!-- Paso 2: Producto (filtrado por bodega) -->
        <div class="form-field">
          <label>Producto a solicitar <span style="color:red">*</span></label>
          <p-select
            [options]="productosOpciones"
            [ngModel]="selectedProductoId"
            (ngModelChange)="onProductoChange($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="{{ nuevaSolicitud.id_bodega ? 'Seleccionar producto...' : 'Seleccione una bodega primero' }}"
            [filter]="true"
            filterPlaceholder="Buscar producto..."
            appendTo="body"
            [disabled]="!nuevaSolicitud.id_bodega"
            style="width:100%">
          </p-select>
          <small *ngIf="nuevaSolicitud.id_bodega && productosOpciones.length === 0"
            style="color:#ef4444;font-size:12px;margin-top:4px;display:block">
            Esta bodega no tiene productos registrados.
          </small>
        </div>

        <!-- Stock disponible -->
        <div *ngIf="selectedProductoId" style="margin-bottom:1rem">
          <div *ngIf="stockSol.cargando" style="padding:10px;background:#f8fafc;border-radius:8px;font-size:13px;color:#64748b;text-align:center">
            <i class="pi pi-spin pi-spinner" style="margin-right:6px"></i>Cargando stock...
          </div>
          <div *ngIf="!stockSol.cargando" style="padding:10px 14px;border-radius:8px;border:1px solid;"
            [style.background]="stockSol.disponibles > 0 ? '#f0fdf4' : '#fef2f2'"
            [style.border-color]="stockSol.disponibles > 0 ? '#bbf7d0' : '#fecaca'">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase">Stock disponible</span>
              <span style="font-size:20px;font-weight:800;"
                [style.color]="stockSol.disponibles > 0 ? '#16a34a' : '#dc2626'">
                {{ stockSol.disponibles }}
              </span>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">de {{ stockSol.total }} unidades totales</div>
            <div *ngIf="stockSol.disponibles === 0" style="margin-top:6px;font-size:12px;color:#dc2626;font-weight:600">
              <i class="pi pi-exclamation-circle" style="margin-right:4px"></i>Sin stock disponible. No se puede solicitar.
            </div>
          </div>
          <small *ngIf="!stockSol.cargando && nuevaSolicitud.cantidad > stockSol.disponibles && stockSol.disponibles > 0"
            style="color:#dc2626;font-size:12px;margin-top:4px;display:block;font-weight:600">
            <i class="pi pi-exclamation-triangle" style="margin-right:4px"></i>
            La cantidad solicitada supera el stock disponible ({{ stockSol.disponibles }}).
          </small>
        </div>

        <!-- Paso 3: Cantidad -->
        <div class="form-field">
          <label>Cantidad <span style="color:red">*</span></label>
          <p-inputnumber
            [(ngModel)]="nuevaSolicitud.cantidad"
            [min]="1"
            [max]="stockSol.disponibles > 0 ? stockSol.disponibles : 9999"
            [showButtons]="true"
            buttonLayout="horizontal"
            decrementButtonClass="p-button-secondary"
            incrementButtonClass="p-button-secondary"
            decrementButtonIcon="pi pi-minus"
            incrementButtonIcon="pi pi-plus"
            style="width:100%"
            inputStyleClass="text-center font-bold">
          </p-inputnumber>
        </div>

        <!-- Paso 4: Justificación -->
        <div class="form-field">
          <label>Justificación / Motivo</label>
          <textarea pTextarea [(ngModel)]="nuevaSolicitud.observacion" rows="3"
            placeholder="Describe el motivo de la solicitud..."
            style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit">
          </textarea>
        </div>

        <!-- Info bodega responsable -->
        <div *ngIf="bodegaSeleccionada" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;margin-top:4px">
          <div style="display:flex;align-items:center;gap:8px">
            <i class="pi pi-info-circle" style="color:#3b82f6;font-size:14px"></i>
            <span style="font-size:12px;color:#1d4ed8">
              <span *ngIf="bodegaSeleccionada.responsable">
                <strong>{{ bodegaSeleccionada.responsable.nombre }}</strong> recibirá una notificación como responsable de
                <strong>{{ bodegaSeleccionada.nombre }}</strong>.
              </span>
              <span *ngIf="!bodegaSeleccionada.responsable && !bodegaSeleccionada.id_responsable">
                La bodega <strong>{{ bodegaSeleccionada.nombre }}</strong> no tiene responsable asignado. El Administrador gestionará la solicitud.
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Enviar Solicitud" icon="pi pi-send" class="btn-guardar"
          [disabled]="!selectedProductoId || !nuevaSolicitud.cantidad || nuevaSolicitud.cantidad < 1 || stockSol.cargando || stockSol.disponibles === 0 || nuevaSolicitud.cantidad > stockSol.disponibles"
          (click)="guardarSolicitud()">
        </button>
      </div>
    </p-dialog>
  `
})
export class SolicitudesComponent implements OnInit, OnDestroy {
  private solicitudService = inject(SolicitudService);
  private productoService = inject(ProductoService);
  private sitioService = inject(SitioService);
  private inventarioService = inject(InventarioService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);
  private changesSub!: Subscription;

  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];
  filtro = '';
  displayDialog = false;
  displayDialogCrear = false;
  solicitudView: Solicitud | null = null;

  bodegas: any[] = [];
  bodegasOpciones: { label: string; value: number }[] = [];
  bodegaSeleccionada: any = null;
  todosLosProductos: any[] = [];
  productosOpciones: { label: string; value: number }[] = [];

  // Evita que los botones de aprobar/rechazar aparezcan antes de cargar las bodegas
  bodegasCargadas = false;

  selectedProductoId: number | null = null;
  stockSol = { disponibles: 0, total: 0, cargando: false };

  nuevaSolicitud: { id_bodega: number | null; id_producto: number | null; cantidad: number; observacion: string } =
    { id_bodega: null, id_producto: null, cantidad: 1, observacion: '' };

  get currentUserId(): number {
    return Number(this.authService.getUserId()) || 0;
  }

  private get currentRole(): string {
    return this.authService.getUserRole()?.toUpperCase() ?? '';
  }

  get pendientesParaAprobar(): number {
    if (!this.bodegasCargadas) return 0;
    return this.solicitudes.filter(s => s.estado === 'PENDIENTE' && this.puedeAprobarSolicitud(s)).length;
  }

  /**
   * Determina si el usuario actual puede aprobar/rechazar/entregar esta solicitud.
   *
   * Reglas (independientes del nombre del rol):
   *  - Nunca puede aprobar su propia solicitud.
   *  - Si el usuario ES el responsable asignado de esa bodega → puede aprobar (sin importar el rol).
   *  - Si la bodega NO tiene responsable asignado y el usuario es Administrador → puede aprobar.
   *  - Cualquier otro caso → no puede aprobar.
   *  - Si las bodegas aún no cargaron → false (evita race condition).
   */
  puedeAprobarSolicitud(sol: Solicitud): boolean {
    if (!this.bodegasCargadas) return false;

    const userId = this.currentUserId;
    if (!userId || sol.id_usuario === userId) return false;

    const idSitio = sol.producto?.id_sitio;
    const bodega = idSitio ? this.bodegas.find(b => b.id_sitio === idSitio) : null;
    const idResponsable: number | null = bodega?.id_responsable ?? bodega?.responsable?.id_usuario ?? null;

    // El usuario es el responsable asignado de esta bodega (cualquier rol)
    if (idResponsable && idResponsable === userId) return true;

    // Bodega sin responsable: solo Administrador o Responsable de Bodega puede aprobar
    if (!idResponsable && (this.currentRole === 'ADMINISTRADOR' || this.currentRole === 'RESPONSABLE DE BODEGA')) return true;

    return false;
  }

  esPendienteParaMi(sol: Solicitud): boolean {
    return sol.estado === 'PENDIENTE' && this.puedeAprobarSolicitud(sol);
  }

  ngOnInit() {
    // Cargar bodegas y productos en paralelo, luego cargar solicitudes
    forkJoin({
      sitios: this.sitioService.getSitios(),
      productos: this.productoService.getProductos(),
    }).subscribe({
      next: ({ sitios, productos }) => {
        const sitioData = sitios?.data ?? sitios ?? [];
        this.bodegas = sitioData.filter((s: any) => this.TIPOS_LUGAR_VALIDOS.includes(s.tipo) && s.estado !== false);
        this.bodegasOpciones = this.bodegas.map((b: any) => ({
          label: `${b.nombre} (${this.getTipoLabelDeSitio(b)})` + (b.responsable ? ` — ${b.responsable.nombre}` : ''),
          value: b.id_sitio,
        }));
        this.todosLosProductos = productos?.data ?? productos ?? [];
        this.bodegasCargadas = true;
        this.cargarSolicitudes();
        this.cdr.markForCheck();
      },
      error: () => {
        this.bodegasCargadas = true;
        this.cargarSolicitudes();
        this.cdr.markForCheck();
      },
    });

    this.changesSub = this.apiService.changes.subscribe(() => this.cargarSolicitudes());
  }

  ngOnDestroy() {
    this.changesSub.unsubscribe();
  }

  cargarSolicitudes() {
    this.solicitudService.getSolicitudes().subscribe({
      next: (res: any) => {
        let d = res?.data ?? res ?? [];
        const role = this.currentRole;
        const userId = this.currentUserId;

        if (role !== 'ADMINISTRADOR') {
          if (role === 'RESPONSABLE DE BODEGA') {
            d = d.filter((sol: any) => {
              const idSitio = sol.producto?.id_sitio;
              const bodega = idSitio ? this.bodegas.find(b => b.id_sitio === idSitio) : null;
              const idResponsable = bodega?.id_responsable ?? bodega?.responsable?.id_usuario ?? null;
              return sol.id_usuario === userId || idResponsable === userId;
            });
          } else {
            d = d.filter((sol: any) => sol.id_usuario === userId);
          }
        }

        this.solicitudes = d;
        this.solicitudesFiltradas = d;
        this.cdr.markForCheck();
      },
      error: () => { this.solicitudes = []; this.solicitudesFiltradas = []; this.cdr.markForCheck(); },
    });
  }

  private readonly TIPOS_LUGAR_VALIDOS = ['BODEGA', 'AMBIENTE', 'LABORATORIO', 'OTRO'];
  private readonly TIPOS_LUGAR_LABELS: Record<string, string> = {
    BODEGA: 'Bodega', AMBIENTE: 'Ambiente', LABORATORIO: 'Laboratorio', OTRO: 'Otro',
  };

  private getTipoLabelDeSitio(b: any): string {
    const tipo = b.tipo === 'OTRO' ? (b.tipo_personalizado || 'Otro') : (this.TIPOS_LUGAR_LABELS[b.tipo] || b.tipo || '');
    return b.codigo_lugar ? `${tipo} · ${b.codigo_lugar}` : tipo;
  }

  onBodegaChange(id: number | null) {
    this.nuevaSolicitud.id_bodega = id;
    this.nuevaSolicitud.id_producto = null;
    this.selectedProductoId = null;
    this.stockSol = { disponibles: 0, total: 0, cargando: false };
    this.bodegaSeleccionada = id ? (this.bodegas.find(b => b.id_sitio === id) ?? null) : null;

    if (!id) { this.productosOpciones = []; return; }

    const filtrados = this.todosLosProductos.filter((p: any) => p.id_sitio === id);
    this.productosOpciones = filtrados.map((p: any) => ({
      label: p.SKU ? `${p.nombre}  ·  ${p.SKU}` : p.nombre,
      value: p.id_producto,
    }));
  }

  onProductoChange(id: number | null) {
    this.selectedProductoId = id;
    this.nuevaSolicitud.id_producto = id;
    this.nuevaSolicitud.cantidad = 1;
    if (!id) { this.stockSol = { disponibles: 0, total: 0, cargando: false }; return; }
    this.stockSol = { disponibles: 0, total: 0, cargando: true };
    this.inventarioService.getStockByProducto(id).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        this.stockSol = { disponibles: d.disponibles ?? 0, total: d.total ?? 0, cargando: false };
        this.cdr.markForCheck();
      },
      error: () => { this.stockSol = { disponibles: 0, total: 0, cargando: false }; this.cdr.markForCheck(); },
    });
  }

  getBodegaNombre(sol: Solicitud): string {
    if (!sol.producto?.id_sitio) return '—';
    const bodega = this.bodegas.find(b => b.id_sitio === sol.producto.id_sitio);
    return bodega?.nombre ?? `Bodega #${sol.producto.id_sitio}`;
  }

  getBodegaResponsable(sol: Solicitud): string | null {
    if (!sol.producto?.id_sitio) return null;
    const bodega = this.bodegas.find(b => b.id_sitio === sol.producto.id_sitio);
    return bodega?.responsable?.nombre ?? null;
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.solicitudesFiltradas = this.solicitudes.filter(s =>
      (s.producto?.nombre ?? '').toLowerCase().includes(f) ||
      (s.observacion ?? '').toLowerCase().includes(f) ||
      (s.estado ?? '').toLowerCase().includes(f) ||
      (s.usuario?.nombre ?? '').toLowerCase().includes(f) ||
      this.getBodegaNombre(s).toLowerCase().includes(f)
    );
  }

  contarEstado(estado: string): number {
    return this.solicitudes.filter(s => s.estado === estado).length;
  }

  getStatusClass(estado: string | undefined): string {
    if (estado === 'PENDIENTE') return 'status-pendiente';
    if (estado === 'APROBADA' || estado === 'ENTREGADA') return 'status-aprobada';
    if (estado === 'RECHAZADA') return 'status-rechazada';
    return 'status-info';
  }

  ver(sol: Solicitud) {
    this.solicitudView = sol;
    this.displayDialog = true;
  }

  abrirDialogoCrear() {
    this.nuevaSolicitud = { id_bodega: null, id_producto: null, cantidad: 1, observacion: '' };
    this.productosOpciones = [];
    this.bodegaSeleccionada = null;
    this.selectedProductoId = null;
    this.stockSol = { disponibles: 0, total: 0, cargando: false };
    this.displayDialogCrear = true;
  }

  guardarSolicitud() {
    const idProducto = this.selectedProductoId;
    if (!idProducto) return;
    if (this.stockSol.disponibles === 0) {
      this.notification.add({ module: 'Solicitudes', severity: 'warn', summary: 'Sin stock', detail: 'El producto seleccionado no tiene unidades disponibles.' });
      return;
    }
    if (this.nuevaSolicitud.cantidad > this.stockSol.disponibles) {
      this.notification.add({ module: 'Solicitudes', severity: 'warn', summary: 'Cantidad excedida', detail: `Solo hay ${this.stockSol.disponibles} unidad(es) disponible(s).` });
      return;
    }
    // id_usuario lo inyecta el backend desde el JWT
    this.solicitudService.crearSolicitud({
      tipo: 'PRESTAMO',
      id_producto: idProducto,
      cantidad: this.nuevaSolicitud.cantidad,
      observacion: this.nuevaSolicitud.observacion?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Solicitud enviada', detail: 'Tu solicitud fue registrada. El responsable de la bodega recibirá una notificación.' });
        this.displayDialogCrear = false;
        this.cargarSolicitudes();
      },
      error: () => {
        this.notification.add({ module: 'Solicitudes', severity: 'error', summary: 'Error', detail: 'No se pudo crear la solicitud' });
      },
    });
  }

  aprobar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: `¿Aprobar la solicitud de <b>${sol.producto?.nombre ?? 'este producto'}</b>?`,
      header: 'Confirmar aprobación',
      icon: 'pi pi-check-circle',
      accept: () => {
        this.solicitudService.aprobar(sol.id_solicitud!).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Aprobada', detail: 'Solicitud aprobada correctamente' });
            this.cargarSolicitudes();
          },
          error: (err: any) => this.notification.add({
            module: 'Solicitudes', severity: 'error', summary: 'Sin permiso',
            detail: err?.error?.message || 'No se pudo aprobar la solicitud',
          }),
        });
      },
    });
  }

  rechazar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: `¿Rechazar la solicitud de <b>${sol.producto?.nombre ?? 'este producto'}</b>?`,
      header: 'Confirmar rechazo',
      icon: 'pi pi-times-circle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.solicitudService.rechazar(sol.id_solicitud!).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'warn', summary: 'Rechazada', detail: 'Solicitud rechazada' });
            this.cargarSolicitudes();
          },
          error: (err: any) => this.notification.add({
            module: 'Solicitudes', severity: 'error', summary: 'Sin permiso',
            detail: err?.error?.message || 'No se pudo rechazar la solicitud',
          }),
        });
      },
    });
  }

  entregar(sol: Solicitud) {
    this.confirmationService.confirm({
      message: `¿Marcar como entregada la solicitud de <b>${sol.producto?.nombre ?? 'este producto'}</b>?`,
      header: 'Confirmar entrega',
      icon: 'pi pi-send',
      accept: () => {
        this.solicitudService.entregar(sol.id_solicitud!).subscribe({
          next: () => {
            this.notification.add({ module: 'Solicitudes', severity: 'success', summary: 'Entregada', detail: 'Solicitud marcada como entregada' });
            this.cargarSolicitudes();
          },
          error: () => this.notification.add({ module: 'Solicitudes', severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }),
        });
      },
    });
  }
}
