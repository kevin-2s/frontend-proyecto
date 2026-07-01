import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../core/services/notification.service';
import { MovimientoService } from '../../infrastructure/services/movimiento.service';
import { TipoMovimientoService } from '../../infrastructure/services/tipo-movimiento.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Movimiento {
  id_movimiento: number;
  fecha: string;
  observacion: string | null;
  id_item: number;
  id_tipo_movimiento: number;
  id_usuario: number;
  item?: any;
  tipoMovimiento?: any;
  usuario?: any;
}

interface TipoMov {
  id_tipo_movimiento: number;
  nombre: string;
}

interface Item {
  id_item: number;
  codigo_sku: string;
  estado: string;
  producto?: { nombre: string };
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule,
    ToastModule,
    TooltipModule,
  ],
  template: `
    <p-toast position="bottom-right"></p-toast>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-arrows-h"></i> Movimientos de Inventario
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar movimiento..." class="search-input" />
          </div>
          <button
            *ngIf="esAdmin() || esInstructor()"
            pButton
            label="Registrar Movimiento"
            icon="pi pi-plus"
            class="btn-agregar"
            (click)="abrirDialogoCrear()"
          ></button>
        </div>
      </div>

      <!-- Cards de resumen -->
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div class="stat-card" style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Total</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#eff6ff;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-list" style="color:#3b82f6;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#111827;margin:0">{{ movimientos.length }}</p>
        </div>
        <div class="stat-card" style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Entradas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ecfdf5;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-arrow-down" style="color:#10b981;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#10b981;margin:0">{{ contarTipo('ENTRADA') }}</p>
        </div>
        <div class="stat-card" style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Salidas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-arrow-up" style="color:#ef4444;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#ef4444;margin:0">{{ contarTipo('SALIDA') }}</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="movimientosFiltrados"
          [paginator]="true"
          [rows]="12"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Ítem / Producto</th>
              <th style="width:160px">Tipo</th>
              <th style="width:170px">Fecha</th>
              <th style="width:140px">Usuario</th>
              <th>Observación</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-mov>
            <tr>
              <td><span class="id-badge">#{{ mov.id_movimiento }}</span></td>
              <td>
                <div style="display:flex;flex-direction:column">
                  <span class="nombre-cell" style="font-weight:600;">
                    {{ mov.item?.producto?.nombre ?? ('Ítem #' + mov.id_item) }}
                  </span>
                  <span style="font-size:11px;color:#94a3b8;margin-top:2px">SKU: {{ mov.item?.codigo_sku ?? '—' }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getTipoClass(mov.tipoMovimiento?.nombre)">
                  {{ mov.tipoMovimiento?.nombre ?? '—' }}
                </span>
              </td>
              <td>
                <span class="fecha-cell">{{ mov.fecha | date: 'dd/MM/yyyy HH:mm' }}</span>
              </td>
              <td>
                <span style="font-size:13px;color:#374151">{{ mov.usuario?.nombre ?? ('Usuario #' + mov.id_usuario) }}</span>
              </td>
              <td>
                <span style="font-size:12px;color:#6b7280;max-width:200px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" [title]="mov.observacion ?? ''">
                  {{ mov.observacion ?? '—' }}
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-arrows-h"></i>
                <p>No se encontraron movimientos</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Dialog Crear Movimiento -->
    <p-dialog
      maskStyleClass="transparent-mask"
      [dismissableMask]="true"
      header="➕ Registrar Movimiento"
      [(visible)]="displayDialogCrear"
      [modal]="true"
      [style]="{ width: '540px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
    >
      <div class="form-container mt-4" *ngIf="displayDialogCrear">
        <div class="form-group">
          <label class="form-label">Ítem <span class="required">*</span></label>
          <select class="form-select-native" [(ngModel)]="nuevoMovimiento.id_item">
            <option [ngValue]="null" disabled>Seleccionar ítem...</option>
            <option *ngFor="let item of items" [ngValue]="item.id_item">
              {{ item.producto?.nombre ?? 'Ítem' }} — SKU: {{ item.codigo_sku }} ({{ item.estado }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Tipo de Movimiento <span class="required">*</span></label>
          <select class="form-select-native" [(ngModel)]="nuevoMovimiento.id_tipo_movimiento">
            <option [ngValue]="null" disabled>Seleccionar tipo...</option>
            <option *ngFor="let tipo of tiposMovimiento" [ngValue]="tipo.id_tipo_movimiento">
              {{ tipo.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Cantidad <span class="required">*</span></label>
          <input pInputText type="number" [(ngModel)]="nuevoMovimiento.cantidad" min="1"
            placeholder="Ej: 5" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Observación</label>
          <textarea [(ngModel)]="nuevoMovimiento.observacion" rows="3"
            placeholder="Motivo o descripción del movimiento..."
            class="form-input" style="resize:vertical;font-family:inherit"></textarea>
        </div>
      </div>

      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Registrar" icon="pi pi-check" class="btn-guardar"
          [disabled]="!nuevoMovimiento.id_item || !nuevoMovimiento.id_tipo_movimiento || !nuevoMovimiento.cantidad"
          (click)="guardarMovimiento()"></button>
      </div>
    </p-dialog>
  `
})
export class MovimientosComponent implements OnInit {
  private movimientoService = inject(MovimientoService);
  private tipoMovimientoService = inject(TipoMovimientoService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  tiposMovimiento: TipoMov[] = [];
  items: Item[] = [];
  filtro = '';
  displayDialogCrear = false;

  nuevoMovimiento: {
    id_item: number | null;
    id_tipo_movimiento: number | null;
    cantidad: number;
    observacion: string;
  } = { id_item: null, id_tipo_movimiento: null, cantidad: 1, observacion: '' };

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  esInstructor(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'INSTRUCTOR';
  }

  ngOnInit() {
    this.cargarMovimientos();
    this.cargarTipos();
    this.cargarItems();
  }

  cargarMovimientos() {
    this.movimientoService.getMovimientos().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.movimientos = d;
        this.movimientosFiltrados = d;
      },
      error: () => {
        this.movimientos = [];
        this.movimientosFiltrados = [];
      },
    });
  }

  cargarTipos() {
    this.tipoMovimientoService.getAll().subscribe({
      next: (res: any) => {
        this.tiposMovimiento = res?.data || res || [];
      },
      error: () => { this.tiposMovimiento = []; }
    });
  }

  cargarItems() {
    this.http.get<any>(`${environment.apiUrl}/items`).subscribe({
      next: (res: any) => {
        this.items = res?.data || res || [];
      },
      error: () => { this.items = []; }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.movimientosFiltrados = this.movimientos.filter(m =>
      (m.item?.producto?.nombre ?? '').toLowerCase().includes(f) ||
      (m.tipoMovimiento?.nombre ?? '').toLowerCase().includes(f) ||
      (m.observacion ?? '').toLowerCase().includes(f)
    );
  }

  getTipoClass(tipo: string): string {
    if (!tipo) return 'status-pendiente';
    const upper = tipo.toUpperCase();
    if (upper === 'ENTRADA' || upper === 'DEVOLUCION') return 'status-aprobada';
    if (upper === 'SALIDA' || upper === 'PRESTAMO') return 'status-rechazada';
    return 'status-pendiente';
  }

  contarTipo(keyword: string): number {
    return this.movimientos.filter(m =>
      (m.tipoMovimiento?.nombre ?? '').toUpperCase().includes(keyword)
    ).length;
  }

  abrirDialogoCrear() {
    this.nuevoMovimiento = { id_item: null, id_tipo_movimiento: null, cantidad: 1, observacion: '' };
    this.displayDialogCrear = true;
  }

  guardarMovimiento() {
    const userId = this.authService.getUserId() ?? 1;
    const payload = {
      fecha: new Date(),
      observacion: this.nuevoMovimiento.observacion || null,
      id_item: this.nuevoMovimiento.id_item,
      id_tipo_movimiento: this.nuevoMovimiento.id_tipo_movimiento,
      id_usuario: userId,
      cantidad: this.nuevoMovimiento.cantidad,
    };

    this.movimientoService.crearMovimiento(payload).subscribe({
      next: () => {
        this.notification.add({
          module: 'Movimientos',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Movimiento registrado correctamente',
        });
        this.displayDialogCrear = false;
        this.cargarMovimientos();
      },
      error: () => {
        this.notification.add({
          module: 'Movimientos',
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el movimiento',
        });
      },
    });
  }
}
