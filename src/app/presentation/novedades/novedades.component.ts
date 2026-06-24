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
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../core/services/notification.service';
import { NovedadService } from '../../infrastructure/services/novedad.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { AuthService } from '../../infrastructure/services/auth.service';

interface Novedad {
  id_novedad?: number;
  tipo?: string;
  descripcion?: string;
  estado?: string;
  fecha?: string;
  id_item?: number;
  id_usuario?: number;
  item?: any;
  usuario?: any;
}

const TIPOS_NOVEDAD = [
  { label: 'Daño', value: 'DAÑO' },
  { label: 'Pérdida', value: 'PERDIDA' },
  { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
  { label: 'Discrepancia', value: 'DISCREPANCIA' },
  { label: 'Otro', value: 'OTRO' },
];

@Component({
  selector: 'app-novedades',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule,
    TagModule, ToastModule, ConfirmDialogModule, TooltipModule,
    SelectModule, TextareaModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-exclamation-circle"></i> Novedades de Inventario
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar por descripción, tipo o estado..." class="search-input" />
          </div>
          <button pButton label="Nueva Novedad" icon="pi pi-plus"
            class="btn-agregar" (click)="abrirDialogoCrear()"></button>
        </div>
      </div>

      <!-- Tarjetas resumen -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Total</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-list" style="color:#3b82f6;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#111827;margin:0">{{ novedades.length }}</p>
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
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">En proceso</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ede9fe;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-spin pi-spinner" style="color:#7c3aed;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#7c3aed;margin:0">{{ contarEstado('EN_PROCESO') }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Resueltas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ecfdf5;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-check-circle" style="color:#10b981;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#10b981;margin:0">{{ contarEstado('RESUELTA') }}</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="novedadesFiltradas" [paginator]="true" [rows]="15"
          [rowsPerPageOptions]="[5,15,20]" styleClass="modern-table" [rowHover]="true"
          dataKey="id_novedad">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th style="min-width:130px">Tipo</th>
              <th style="min-width:200px">Descripción</th>
              <th style="min-width:160px">Elemento / SKU</th>
              <th style="min-width:140px">Reportado por</th>
              <th style="min-width:120px">Fecha</th>
              <th style="min-width:130px">Estado</th>
              <th style="min-width:140px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-n>
            <tr>
              <td><span class="id-badge">#{{ n.id_novedad }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getTipoClass(n.tipo)">{{ n.tipo }}</span>
              </td>
              <td>
                <span class="nombre-cell" [pTooltip]="n.descripcion" tooltipPosition="top">
                  {{ n.descripcion || '(sin descripción)' }}
                </span>
              </td>
              <td>
                <div>
                  <span style="font-size:13px;color:#374151">
                    {{ n.item?.producto?.nombre ?? n.item?.codigo_sku ?? (n.id_item ? ('Item #' + n.id_item) : '—') }}
                  </span>
                  <div *ngIf="n.item?.codigo_sku" style="font-size:11px;color:#94a3b8;font-family:monospace">
                    {{ n.item.codigo_sku }}
                  </div>
                </div>
              </td>
              <td>
                <span style="font-size:13px;color:#374151">
                  {{ n.usuario?.nombre ?? (n.id_usuario ? ('Usuario #' + n.id_usuario) : '—') }}
                </span>
              </td>
              <td><span class="fecha-cell">{{ n.fecha | date:'dd/MM/yyyy' }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(n.estado)">{{ n.estado }}</span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button pButton icon="pi pi-eye" class="p-button-text text-emerald-600 hover:bg-emerald-50"
                    (click)="ver(n)" pTooltip="Ver detalles"></button>
                  <button *ngIf="n.estado === 'PENDIENTE' && esAdmin()" pButton icon="pi pi-spin pi-cog"
                    class="p-button-text text-purple-600 hover:bg-purple-50"
                    (click)="cambiarEstado(n, 'EN_PROCESO')" pTooltip="Poner en proceso"></button>
                  <button *ngIf="n.estado === 'EN_PROCESO' && esAdmin()" pButton icon="pi pi-check"
                    class="p-button-text text-green-600 hover:bg-green-50"
                    (click)="cambiarEstado(n, 'RESUELTA')" pTooltip="Marcar como resuelta"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-trash"
                    class="p-button-text text-red-500 hover:bg-red-50"
                    (click)="eliminar(n)" pTooltip="Eliminar"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-message">
                <i class="pi pi-exclamation-circle"></i>
                <p>No se encontraron novedades</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Dialog Ver Detalles -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="Detalle de Novedad"
      [(visible)]="displayDialog" [modal]="true" [style]="{ width: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="detail-container mt-4" *ngIf="novedadView">
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="id-badge">#{{ novedadView.id_novedad }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo:</span>
          <span class="status-badge" [ngClass]="getTipoClass(novedadView.tipo)">{{ novedadView.tipo }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Descripción:</span>
          <span class="detail-value text-slate-600 italic">"{{ novedadView.descripcion || '(sin descripción)' }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Elemento:</span>
          <span class="detail-value font-bold">
            {{ novedadView.item?.producto?.nombre ?? novedadView.item?.codigo_sku ?? (novedadView.id_item ? ('Item #' + novedadView.id_item) : '—') }}
          </span>
        </div>
        <div class="detail-row" *ngIf="novedadView.item?.codigo_sku">
          <span class="detail-label">Código SKU:</span>
          <span class="detail-value" style="font-family:monospace">{{ novedadView.item.codigo_sku }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reportado por:</span>
          <span class="detail-value font-bold">
            {{ novedadView.usuario?.nombre ?? (novedadView.id_usuario ? ('Usuario #' + novedadView.id_usuario) : '—') }}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ novedadView.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge" [ngClass]="getStatusClass(novedadView.estado)">{{ novedadView.estado }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cerrar" class="btn-cancelar" (click)="displayDialog = false"></button>
      </div>
    </p-dialog>

    <!-- Dialog Nueva Novedad -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="Registrar Novedad"
      [(visible)]="displayDialogCrear" [modal]="true" [style]="{ width: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="form-container mt-4" *ngIf="displayDialogCrear">
        <div class="form-field">
          <label>Tipo de novedad <span style="color:red">*</span></label>
          <p-select
            [options]="tiposNovedad"
            [(ngModel)]="nuevaNovedad.tipo"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar tipo..."
            appendTo="body"
            style="width:100%">
          </p-select>
        </div>
        <div class="form-field">
          <label>Elemento afectado (opcional)</label>
          <p-select
            [options]="itemsOpciones"
            [(ngModel)]="nuevaNovedad.id_item"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar elemento..."
            [filter]="true"
            filterPlaceholder="Buscar..."
            [showClear]="true"
            appendTo="body"
            style="width:100%">
          </p-select>
        </div>
        <div class="form-field">
          <label>Descripción <span style="color:red">*</span></label>
          <textarea pTextarea [(ngModel)]="nuevaNovedad.descripcion" rows="4"
            placeholder="Describe detalladamente la novedad encontrada..."
            style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit"></textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Registrar" icon="pi pi-exclamation-circle" class="btn-guardar"
          [disabled]="!nuevaNovedad.tipo || !nuevaNovedad.descripcion"
          (click)="guardar()"></button>
      </div>
    </p-dialog>
  `
})
export class NovedadesComponent implements OnInit {
  private novedadService = inject(NovedadService);
  private productoService = inject(ProductoService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  novedades: Novedad[] = [];
  novedadesFiltradas: Novedad[] = [];
  filtro = '';

  displayDialog = false;
  displayDialogCrear = false;
  novedadView: Novedad | null = null;

  tiposNovedad = TIPOS_NOVEDAD;
  itemsOpciones: { label: string; value: number }[] = [];

  nuevaNovedad: { tipo: string; id_item: number | null; descripcion: string } =
    { tipo: '', id_item: null, descripcion: '' };

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  ngOnInit() {
    this.cargar();
    this.cargarItems();
  }

  cargar() {
    this.novedadService.getNovedades().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.novedades = data;
        this.novedadesFiltradas = data;
      },
      error: () => {
        this.novedades = [];
        this.novedadesFiltradas = [];
      },
    });
  }

  cargarItems() {
    this.productoService.getAllItems().subscribe({
      next: (res: any) => {
        const items = res?.data ?? res ?? [];
        this.itemsOpciones = items.map((i: any) => ({
          label: `${i.producto?.nombre ?? 'Item'} — ${i.codigo_sku ?? i.id_item ?? i.id}`,
          value: i.id_item ?? i.id,
        }));
      },
      error: () => { this.itemsOpciones = []; },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.novedadesFiltradas = this.novedades.filter(n =>
      (n.descripcion ?? '').toLowerCase().includes(f) ||
      (n.tipo ?? '').toLowerCase().includes(f) ||
      (n.estado ?? '').toLowerCase().includes(f) ||
      (n.item?.producto?.nombre ?? '').toLowerCase().includes(f) ||
      (n.item?.codigo_sku ?? '').toLowerCase().includes(f) ||
      (n.usuario?.nombre ?? '').toLowerCase().includes(f)
    );
  }

  contarEstado(estado: string): number {
    return this.novedades.filter(n => n.estado === estado).length;
  }

  getStatusClass(estado: string | undefined): string {
    if (estado === 'PENDIENTE') return 'status-pendiente';
    if (estado === 'EN_PROCESO') return 'status-proceso';
    if (estado === 'RESUELTA') return 'status-aprobada';
    return 'status-rechazada';
  }

  getTipoClass(tipo: string | undefined): string {
    if (tipo === 'DAÑO') return 'status-rechazada';
    if (tipo === 'PERDIDA') return 'status-rechazada';
    if (tipo === 'MANTENIMIENTO') return 'status-pendiente';
    if (tipo === 'DISCREPANCIA') return 'status-proceso';
    return 'status-info';
  }

  ver(n: Novedad) {
    this.novedadView = n;
    this.displayDialog = true;
  }

  abrirDialogoCrear() {
    this.nuevaNovedad = { tipo: '', id_item: null, descripcion: '' };
    this.displayDialogCrear = true;
  }

  guardar() {
    const userId = this.authService.getUserId() ?? 1;
    const payload: any = {
      tipo: this.nuevaNovedad.tipo,
      descripcion: this.nuevaNovedad.descripcion,
      id_usuario: userId,
      estado: 'PENDIENTE',
    };
    if (this.nuevaNovedad.id_item) payload.id_item = this.nuevaNovedad.id_item;

    this.novedadService.crearNovedad(payload).subscribe({
      next: () => {
        this.notification.add({ module: 'Novedades', severity: 'success', summary: 'Éxito', detail: 'Novedad registrada correctamente' });
        this.displayDialogCrear = false;
        this.cargar();
      },
      error: () => {
        this.notification.add({ module: 'Novedades', severity: 'error', summary: 'Error', detail: 'No se pudo registrar la novedad' });
      },
    });
  }

  cambiarEstado(n: Novedad, estado: string) {
    const mensajes: Record<string, string> = {
      EN_PROCESO: '¿Poner esta novedad en proceso?',
      RESUELTA: '¿Marcar esta novedad como resuelta?',
    };
    this.confirmationService.confirm({
      message: mensajes[estado] ?? '¿Cambiar estado?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.novedadService.actualizarEstado(n.id_novedad!, { estado }).subscribe({
          next: () => {
            this.notification.add({ module: 'Novedades', severity: 'success', summary: 'Éxito', detail: `Estado actualizado a ${estado}` });
            this.cargar();
          },
          error: () => {
            this.notification.add({ module: 'Novedades', severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado' });
          },
        });
      },
    });
  }

  eliminar(n: Novedad) {
    this.confirmationService.confirm({
      message: '¿Eliminar esta novedad? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.novedadService.eliminar(n.id_novedad!).subscribe({
          next: () => {
            this.notification.add({ module: 'Novedades', severity: 'success', summary: 'Éxito', detail: 'Novedad eliminada' });
            this.cargar();
          },
          error: () => {
            this.notification.add({ module: 'Novedades', severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la novedad' });
          },
        });
      },
    });
  }
}
