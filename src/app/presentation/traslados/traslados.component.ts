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
                  <button *ngIf="t.estado === 'PENDIENTE' && esAdmin()"
                    pButton icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="aprobar(t)" pTooltip="Aprobar traslado" tooltipPosition="top"></button>
                  <button *ngIf="t.estado === 'PENDIENTE' && esAdmin()"
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
      header="🚚 Nuevo Traslado"
      [(visible)]="displayDialogCrear" [modal]="true" [style]="{ width: '90vw', maxWidth: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="form-container mt-4" *ngIf="displayDialogCrear">

        <!-- Paso 1: Producto -->
        <div class="form-field">
          <label>Producto <span style="color:red">*</span></label>
          <p-select
            [options]="productosOpciones"
            [ngModel]="nuevoTraslado.id_producto"
            (ngModelChange)="onProductoChangeCrear($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar producto..."
            [filter]="true"
            filterPlaceholder="Buscar producto..."
            appendTo="body"
            [showClear]="true"
            style="width:100%">
          </p-select>
        </div>

        <!-- Paso 2: Ítem específico (disponible) -->
        <div class="form-field">
          <label>Ítem a trasladar <span style="color:red">*</span></label>
          <p-select
            [options]="itemsOpciones"
            [ngModel]="nuevoTraslado.id_item"
            (ngModelChange)="onItemChangeCrear($event)"
            optionLabel="label"
            optionValue="value"
            placeholder="{{ nuevoTraslado.id_producto ? 'Seleccionar ítem...' : 'Seleccione un producto primero' }}"
            [filter]="true"
            appendTo="body"
            [disabled]="!nuevoTraslado.id_producto"
            style="width:100%">
          </p-select>
          <small *ngIf="cargandoItemsProducto" style="color:#94a3b8;font-size:12px;margin-top:4px;display:block">
            <i class="pi pi-spin pi-spinner mr-1"></i>Cargando ítems disponibles...
          </small>
          <small *ngIf="nuevoTraslado.id_producto && !cargandoItemsProducto && itemsOpciones.length === 0"
            style="color:#ef4444;font-size:12px;margin-top:4px;display:block">
            Este producto no tiene ítems disponibles para trasladar.
          </small>
        </div>

        <!-- Ubicación actual -->
        <div *ngIf="nuevoTraslado.id_item" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin-bottom:1rem">
          <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Ubicación actual</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b;margin-top:2px">{{ ubicacionActualCrear || 'Sin ubicación asignada' }}</div>
        </div>

        <!-- Paso 3: Destino -->
        <div class="form-field">
          <label>Trasladar a <span style="color:red">*</span></label>
          <p-select
            [options]="destinosOpcionesCrear"
            [ngModel]="nuevoTraslado.id_sitio_destino"
            (ngModelChange)="nuevoTraslado.id_sitio_destino = $event"
            optionLabel="label"
            optionValue="value"
            placeholder="{{ nuevoTraslado.id_item ? 'Seleccionar destino...' : 'Seleccione un ítem primero' }}"
            [filter]="true"
            appendTo="body"
            [disabled]="!nuevoTraslado.id_item"
            style="width:100%">
          </p-select>
        </div>

        <!-- Paso 4: Justificación -->
        <div class="form-field">
          <label>Justificación / Motivo</label>
          <textarea pTextarea [(ngModel)]="nuevoTraslado.justificacion" rows="3"
            placeholder="Describe el motivo del traslado..."
            style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit">
          </textarea>
        </div>

        <div *ngIf="nuevoTraslado.id_item" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px">
          <div style="display:flex;align-items:center;gap:8px">
            <i class="pi pi-info-circle" style="color:#3b82f6;font-size:14px"></i>
            <span style="font-size:12px;color:#1d4ed8">
              El responsable del lugar actual recibirá una notificación y debe aprobar el traslado antes de que el ítem cambie de ubicación.
            </span>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Solicitar Traslado" icon="pi pi-truck" class="btn-guardar"
          [disabled]="!nuevoTraslado.id_item || !nuevoTraslado.id_sitio_destino" [loading]="creandoTraslado"
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
  todosLosProductos: any[] = [];
  productosOpciones: { label: string; value: number }[] = [];
  sitios: any[] = [];
  itemsDelProductoSeleccionado: any[] = [];
  itemsOpciones: { label: string; value: number }[] = [];
  cargandoItemsProducto = false;
  ubicacionActualCrear = '';
  destinosOpcionesCrear: { label: string; value: number }[] = [];

  nuevoTraslado: { id_producto: number | null; id_item: number | null; id_sitio_destino: number | null; justificacion: string } =
    { id_producto: null, id_item: null, id_sitio_destino: null, justificacion: '' };

  private readonly TIPOS_LUGAR_VALIDOS = ['BODEGA', 'AMBIENTE', 'LABORATORIO', 'OTRO'];
  private readonly TIPOS_LUGAR_LABELS: Record<string, string> = {
    BODEGA: 'Bodega', AMBIENTE: 'Ambiente', LABORATORIO: 'Laboratorio', OTRO: 'Otro',
  };

  esAdmin(): boolean {
    const role = this.authService.getUserRole()?.toUpperCase() ?? '';
    return role === 'ADMINISTRADOR' || role === 'RESPONSABLE';
  }

  ngOnInit() {
    this.cargarTraslados();
    this.cargarProductos();
    this.cargarSitios();
    this.changesSub = this.apiService.changes.subscribe(() => this.cargarTraslados());
  }

  ngOnDestroy() {
    this.changesSub.unsubscribe();
  }

  cargarTraslados() {
    this.trasladoService.getTraslados().subscribe({
      next: (res: any) => {
        const d = res?.data ?? res ?? [];
        this.traslados = d;
        this.trasladosFiltrados = d;
        this.cdr.markForCheck();
      },
      error: () => { this.traslados = []; this.trasladosFiltrados = []; this.cdr.markForCheck(); },
    });
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        this.todosLosProductos = res?.data ?? res ?? [];
        this.productosOpciones = this.todosLosProductos.map((p: any) => ({
          label: p.SKU ? `${p.nombre}  ·  ${p.SKU}` : p.nombre,
          value: p.id_producto,
        }));
        this.cdr.markForCheck();
      },
      error: () => { this.todosLosProductos = []; this.productosOpciones = []; this.cdr.markForCheck(); },
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

  onProductoChangeCrear(id: number | null) {
    this.nuevoTraslado.id_producto = id;
    this.nuevoTraslado.id_item = null;
    this.nuevoTraslado.id_sitio_destino = null;
    this.itemsOpciones = [];
    this.ubicacionActualCrear = '';
    this.destinosOpcionesCrear = [];
    if (!id) return;

    this.cargandoItemsProducto = true;
    this.productoService.getItemsByProducto(id).subscribe({
      next: (res: any) => {
        const items = res?.data ?? res ?? [];
        this.itemsDelProductoSeleccionado = items.filter((it: any) => it.estado === 'DISPONIBLE');
        this.itemsOpciones = this.itemsDelProductoSeleccionado.map((it: any) => {
          const referencia = it.placa_sena || it.codigo_sku || `#${it.id_item}`;
          const sitio = this.sitios.find(s => s.id_sitio === it.id_sitio);
          const ubicacion = sitio ? ` — ${sitio.nombre}` : '';
          return { label: `${referencia}${ubicacion}`, value: it.id_item };
        });
        this.cargandoItemsProducto = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.itemsDelProductoSeleccionado = [];
        this.itemsOpciones = [];
        this.cargandoItemsProducto = false;
        this.cdr.markForCheck();
      },
    });
  }

  onItemChangeCrear(id: number | null) {
    this.nuevoTraslado.id_item = id;
    this.nuevoTraslado.id_sitio_destino = null;
    this.ubicacionActualCrear = '';
    this.destinosOpcionesCrear = [];
    if (!id) return;

    const item = this.itemsDelProductoSeleccionado.find(it => it.id_item === id);
    const idSitioActual = item?.id_sitio ?? null;
    const sitioActual = this.sitios.find(s => s.id_sitio === idSitioActual);
    this.ubicacionActualCrear = sitioActual
      ? `${sitioActual.nombre}${this.getTipoLabel(sitioActual) ? ' · ' + this.getTipoLabel(sitioActual) : ''}`
      : '';

    this.destinosOpcionesCrear = this.sitios
      .filter(s => s.id_sitio !== idSitioActual)
      .map(s => ({
        label: `${s.nombre}${this.getTipoLabel(s) ? ' · ' + this.getTipoLabel(s) : ''}`,
        value: s.id_sitio,
      }));
  }

  abrirDialogoCrear() {
    this.nuevoTraslado = { id_producto: null, id_item: null, id_sitio_destino: null, justificacion: '' };
    this.itemsOpciones = [];
    this.ubicacionActualCrear = '';
    this.destinosOpcionesCrear = [];
    this.displayDialogCrear = true;
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
        this.notification.add({ module: 'Traslados', severity: 'success', summary: 'Solicitud enviada', detail: 'Traslado solicitado. El responsable del lugar actual recibirá una notificación.' });
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
