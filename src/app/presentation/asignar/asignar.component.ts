import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../core/services/notification.service';
import { AsignacionService } from '../../infrastructure/services/asignacion.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { FichaService } from '../../infrastructure/services/ficha.service';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { AuthService } from '../../infrastructure/services/auth.service';

interface Asignacion {
  id_asignacion?: number;
  id_ficha?: number;
  id_producto?: number;
  cantidad?: number;
  fecha_asignacion?: string;
  id_usuario_asigna?: number;
  observacion?: string | null;
  estado?: string;
  ficha?: any;
  producto?: any;
  usuario_asigna?: any;
}

@Component({
  selector: 'app-asignar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, InputTextModule, InputNumberModule, DialogModule,
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
          <i class="pi pi-user-plus"></i> Asignación de Productos a Fichas
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar por producto, ficha o estado..." class="search-input" />
          </div>
          <button *ngIf="esAdmin()" pButton label="Nueva Asignación" icon="pi pi-plus"
            class="btn-add" (click)="abrirDialogoCrear()"></button>
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
          <p style="font-size:24px;font-weight:800;color:#111827;margin:0">{{ asignaciones.length }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Activas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#ecfdf5;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-check-circle" style="color:#10b981;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#10b981;margin:0">{{ contarEstado('ACTIVA') }}</p>
        </div>
        <div style="background:white;border-radius:16px;padding:1.25rem;border:1px solid #f0fdf4;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
            <span style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Anuladas</span>
            <div style="width:32px;height:32px;border-radius:8px;background:#fef2f2;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-ban" style="color:#ef4444;font-size:14px"></i>
            </div>
          </div>
          <p style="font-size:24px;font-weight:800;color:#ef4444;margin:0">{{ contarEstado('ANULADA') }}</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="asignacionesFiltradas" [paginator]="true" [rows]="15"
          [rowsPerPageOptions]="[5,15,20]" styleClass="modern-table" [rowHover]="true"
          dataKey="id_asignacion">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:70px">ID</th>
              <th style="min-width:180px">Producto</th>
              <th style="min-width:160px">Ficha</th>
              <th style="min-width:90px" class="text-center">Cantidad</th>
              <th style="min-width:130px">Asignado por</th>
              <th style="min-width:120px">Fecha</th>
              <th style="min-width:110px">Estado</th>
              <th style="min-width:130px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr>
              <td><span class="id-badge">#{{ a.id_asignacion }}</span></td>
              <td>
                <div>
                  <span class="nombre-cell">{{ a.producto?.nombre ?? ('Producto #' + a.id_producto) }}</span>
                  <span *ngIf="a.producto?.SKU" style="font-size:11px;color:#94a3b8;font-family:monospace;display:block">{{ a.producto.SKU }}</span>
                </div>
              </td>
              <td>
                <div>
                  <span style="font-size:13px;font-weight:600;color:#374151">
                    {{ a.ficha?.numero_ficha ?? ('Ficha #' + a.id_ficha) }}
                  </span>
                  <span *ngIf="a.ficha?.programa?.nombre" style="font-size:11px;color:#94a3b8;display:block">{{ a.ficha.programa.nombre }}</span>
                </div>
              </td>
              <td style="text-align:center">
                <span style="font-size:15px;font-weight:700;color:#1e293b">{{ a.cantidad }}</span>
              </td>
              <td>
                <span style="font-size:13px;color:#374151">
                  {{ a.usuario_asigna?.nombre ?? (a.id_usuario_asigna ? ('Usuario #' + a.id_usuario_asigna) : '—') }}
                </span>
              </td>
              <td><span class="fecha-cell">{{ a.fecha_asignacion | date:'dd/MM/yyyy' }}</span></td>
              <td><span class="status-badge" [ngClass]="getStatusClass(a.estado)">{{ a.estado }}</span></td>
              <td>
                <div class="action-buttons" style="justify-content:center">
                  <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                    style="color:#10b981" (click)="ver(a)" pTooltip="Ver detalles"></button>
                  <button *ngIf="a.estado === 'ACTIVA' && esAdmin()" pButton icon="pi pi-ban"
                    class="p-button-text p-button-sm" style="color:#f97316"
                    (click)="anular(a)" pTooltip="Anular"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-trash"
                    class="p-button-text p-button-sm" style="color:#ef4444"
                    (click)="eliminar(a)" pTooltip="Eliminar"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-message">
                <i class="pi pi-user-plus"></i>
                <p>No se encontraron asignaciones</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- ══════════ DIALOG VER DETALLES ══════════ -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="📋 Detalle de Asignación"
      [(visible)]="displayDialog" [modal]="true" [style]="{ width: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">
      <div class="detail-container" style="margin-top:1rem" *ngIf="asignacionView">
        <div class="detail-row">
          <span class="detail-label">ID:</span>
          <span class="id-badge">#{{ asignacionView.id_asignacion }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Producto:</span>
          <span class="detail-value" style="font-weight:800">{{ asignacionView.producto?.nombre ?? ('Producto #' + asignacionView.id_producto) }}</span>
        </div>
        <div class="detail-row" *ngIf="asignacionView.producto?.SKU">
          <span class="detail-label">SKU:</span>
          <span class="detail-value" style="font-family:monospace">{{ asignacionView.producto.SKU }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ficha:</span>
          <span class="detail-value" style="font-weight:800">
            {{ asignacionView.ficha?.numero_ficha ?? ('Ficha #' + asignacionView.id_ficha) }}
            <span *ngIf="asignacionView.ficha?.programa?.nombre" style="font-weight:400;color:#6b7280">
              — {{ asignacionView.ficha.programa.nombre }}
            </span>
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Cantidad:</span>
          <span class="detail-value" style="font-size:1.25rem;font-weight:900;color:#1e293b">{{ asignacionView.cantidad }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Asignado por:</span>
          <span class="detail-value" style="font-weight:800">{{ asignacionView.usuario_asigna?.nombre ?? ('Usuario #' + asignacionView.id_usuario_asigna) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">{{ asignacionView.fecha_asignacion | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
        <div class="detail-row" *ngIf="asignacionView.observacion">
          <span class="detail-label">Observación:</span>
          <span class="detail-value" style="color:#64748b;font-style:italic">"{{ asignacionView.observacion }}"</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge" [ngClass]="getStatusClass(asignacionView.estado)">{{ asignacionView.estado }}</span>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cerrar" class="btn-cancelar" (click)="displayDialog = false"></button>
      </div>
    </p-dialog>

    <!-- ══════════ DIALOG NUEVA ASIGNACIÓN ══════════ -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="Nueva Asignación de Producto"
      [(visible)]="displayDialogCrear" [modal]="true" [style]="{ width: '560px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200">

      <div class="asignar-steps" *ngIf="displayDialogCrear">

        <!-- PASO 1: Producto -->
        <div class="asignar-step">
          <span class="step-label">1 · Producto a asignar <span class="required">*</span></span>
          <p-select
            [options]="productosOpciones"
            [formControl]="productoCtrl"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar producto..."
            [filter]="true"
            filterPlaceholder="Buscar por nombre o SKU..."
            appendTo="body"
            style="width:100%">
          </p-select>

          <!-- Tarjeta de stock -->
          <div *ngIf="productoCtrl.value" class="stock-card"
            [ngClass]="{
              'stock-loading': stock.cargando,
              'stock-ok':      !stock.cargando && stock.disponibles > 3,
              'stock-low':     !stock.cargando && stock.disponibles > 0 && stock.disponibles <= 3,
              'stock-empty':   !stock.cargando && stock.disponibles === 0
            }">

            <!-- Cargando -->
            <div *ngIf="stock.cargando" class="stock-loading-row">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Consultando stock disponible...</span>
            </div>

            <!-- Resultado -->
            <ng-container *ngIf="!stock.cargando">
              <div class="stock-header">
                <span class="stock-label"
                  [style.color]="stock.disponibles === 0 ? '#dc2626' : stock.disponibles <= 3 ? '#b45309' : '#15803d'">
                  Stock disponible
                </span>
                <span class="stock-number"
                  [style.color]="stock.disponibles === 0 ? '#dc2626' : stock.disponibles <= 3 ? '#b45309' : '#15803d'">
                  {{ stock.disponibles }}
                  <span class="stock-total">/ {{ stock.total }} total</span>
                </span>
              </div>

              <div class="stock-bar-track">
                <div class="stock-bar-fill"
                  [ngClass]="stock.disponibles === 0 ? 'fill-empty' : stock.disponibles <= 3 ? 'fill-low' : 'fill-ok'"
                  [style.width]="stock.total > 0 ? (stock.disponibles / stock.total * 100) + '%' : '0%'">
                </div>
              </div>

              <div *ngIf="stock.disponibles === 0" class="stock-alert alert-error">
                <i class="pi pi-times-circle"></i>
                Sin unidades disponibles — no se puede asignar este producto.
              </div>
              <div *ngIf="stock.disponibles > 0 && stock.disponibles <= 3" class="stock-alert alert-warning">
                <i class="pi pi-exclamation-triangle"></i>
                Stock bajo — solo {{ stock.disponibles }} unidad(es) disponible(s).
              </div>
            </ng-container>
          </div>
        </div>

        <!-- PASO 2: Cantidad (solo si hay stock) -->
        <div class="asignar-step" *ngIf="productoCtrl.value && !stock.cargando && stock.disponibles > 0">
          <span class="step-label">2 · Cantidad a asignar <span class="required">*</span></span>
          <div class="cantidad-row">
            <p-inputnumber
              [(ngModel)]="nueva.cantidad"
              [min]="1"
              [max]="stock.disponibles"
              [showButtons]="true"
              buttonLayout="horizontal"
              decrementButtonClass="p-button-secondary"
              incrementButtonClass="p-button-secondary"
              decrementButtonIcon="pi pi-minus"
              incrementButtonIcon="pi pi-plus"
              (onInput)="validarCantidad()"
              style="flex:1"
              inputStyleClass="text-center font-bold text-xl w-full">
            </p-inputnumber>
            <div class="cantidad-max">
              Máx. disponible
              <strong>{{ stock.disponibles }}</strong>
            </div>
          </div>
          <div *ngIf="nueva.cantidad > stock.disponibles" class="cantidad-warning">
            <i class="pi pi-exclamation-triangle"></i>
            La cantidad ({{ nueva.cantidad }}) supera el stock disponible ({{ stock.disponibles }}).
          </div>
        </div>

        <!-- PASO 3: Ficha -->
        <div class="asignar-step">
          <span class="step-label">3 · Ficha de formación <span class="required">*</span></span>
          <p-select
            [options]="fichasOpciones"
            [(ngModel)]="nueva.id_ficha"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar ficha..."
            [filter]="true"
            filterPlaceholder="Buscar por número o programa..."
            appendTo="body"
            style="width:100%">
          </p-select>
        </div>

        <!-- PASO 4: Observación -->
        <div class="asignar-step">
          <span class="step-label">4 · Observación (opcional)</span>
          <textarea #txtArea pTextarea [(ngModel)]="nueva.observacion" rows="3"
            placeholder="Motivo, actividad o detalle de la asignación..."
            style="width:100%;resize:vertical;border:2px solid #e2e8f0;border-radius:12px;padding:10px 14px;font-size:0.875rem;font-family:inherit;outline:none;transition:border-color .2s;background:#f8fafc"
            (focus)="txtArea.style.borderColor='#39A900'"
            (blur)="txtArea.style.borderColor='#e2e8f0'">
          </textarea>
        </div>

      </div>

      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialogCrear = false"></button>
        <button pButton label="Asignar" icon="pi pi-user-plus" class="btn-guardar"
          [disabled]="!puedeGuardar()"
          (click)="guardar()">
        </button>
      </div>
    </p-dialog>
  `
})
export class AsignarComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private asignacionService = inject(AsignacionService);
  private productoService = inject(ProductoService);
  private fichaService = inject(FichaService);
  private inventarioService = inject(InventarioService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

  asignaciones: Asignacion[] = [];
  asignacionesFiltradas: Asignacion[] = [];
  filtro = '';

  displayDialog = false;
  displayDialogCrear = false;
  asignacionView: Asignacion | null = null;

  productosOpciones: { label: string; value: number }[] = [];
  fichasOpciones: { label: string; value: number }[] = [];

  stock = { disponibles: 0, total: 0, cargando: false };
  productoCtrl = new FormControl<number | null>(null);

  nueva: { id_producto: number | null; id_ficha: number | null; cantidad: number; observacion: string } =
    { id_producto: null, id_ficha: null, cantidad: 1, observacion: '' };

  esAdmin(): boolean {
    const role = this.authService.getUserRole()?.toUpperCase() ?? '';
    return role === 'ADMINISTRADOR' || role === 'RESPONSABLE';
  }

  ngOnInit() {
    this.cargar();
    this.cargarProductos();
    this.cargarFichas();
    this.productoCtrl.valueChanges.subscribe(id => this.onProductoChange(id ?? 0));
  }

  cargar() {
    this.asignacionService.getAsignaciones().subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.asignaciones = data;
        this.asignacionesFiltradas = data;
      },
      error: () => { this.asignaciones = []; this.asignacionesFiltradas = []; },
    });
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        const items = res?.data ?? res ?? [];
        this.productosOpciones = items.map((p: any) => ({
          label: p.SKU ? `${p.nombre}  ·  ${p.SKU}` : p.nombre,
          value: p.id_producto,
        }));
      },
      error: () => { this.productosOpciones = []; },
    });
  }

  cargarFichas() {
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        const items = res?.data ?? res ?? [];
        this.fichasOpciones = items.map((f: any) => ({
          label: f.programa?.nombre
            ? `${f.numero_ficha}  —  ${f.programa.nombre}`
            : f.numero_ficha,
          value: f.id_ficha,
        }));
      },
      error: () => { this.fichasOpciones = []; },
    });
  }

  onProductoChange(id: number) {
    this.nueva.cantidad = 1;
    if (!id) {
      this.stock = { disponibles: 0, total: 0, cargando: false };
      return;
    }
    this.stock = { disponibles: 0, total: 0, cargando: true };
    this.cdr.detectChanges();

    this.inventarioService.getStockByProducto(id).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        this.stock = { disponibles: d.disponibles ?? 0, total: d.total ?? 0, cargando: false };
      },
      error: () => { this.stock = { disponibles: 0, total: 0, cargando: false }; },
    });
  }

  validarCantidad() {
    if (this.nueva.cantidad > this.stock.disponibles) this.nueva.cantidad = this.stock.disponibles;
    if (this.nueva.cantidad < 1) this.nueva.cantidad = 1;
  }

  puedeGuardar(): boolean {
    return !!(
      this.productoCtrl.value &&
      this.nueva.id_ficha &&
      this.nueva.cantidad >= 1 &&
      this.nueva.cantidad <= this.stock.disponibles &&
      !this.stock.cargando
    );
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.asignacionesFiltradas = this.asignaciones.filter(a =>
      (a.producto?.nombre ?? '').toLowerCase().includes(f) ||
      (a.producto?.SKU ?? '').toLowerCase().includes(f) ||
      (a.ficha?.numero_ficha ?? '').toLowerCase().includes(f) ||
      (a.ficha?.programa?.nombre ?? '').toLowerCase().includes(f) ||
      (a.estado ?? '').toLowerCase().includes(f)
    );
  }

  contarEstado(estado: string): number {
    return this.asignaciones.filter(a => a.estado === estado).length;
  }

  getStatusClass(estado: string | undefined): string {
    if (estado === 'ACTIVA') return 'status-aprobada';
    if (estado === 'ANULADA') return 'status-rechazada';
    return 'status-pendiente';
  }

  ver(a: Asignacion) { this.asignacionView = a; this.displayDialog = true; }

  abrirDialogoCrear() {
    this.nueva = { id_producto: null, id_ficha: null, cantidad: 1, observacion: '' };
    this.stock = { disponibles: 0, total: 0, cargando: false };
    this.productoCtrl.setValue(null, { emitEvent: false });
    this.displayDialogCrear = true;
  }

  guardar() {
    const userId = Number(this.authService.getUserId()) || 1;
    const payload: any = {
      id_producto: this.productoCtrl.value,
      id_ficha: this.nueva.id_ficha,
      cantidad: this.nueva.cantidad,
      id_usuario_asigna: userId,
    };
    if (this.nueva.observacion?.trim()) payload.observacion = this.nueva.observacion.trim();

    this.asignacionService.crearAsignacion(payload).subscribe({
      next: () => {
        this.notification.add({ module: 'Asignar', severity: 'success', summary: 'Éxito', detail: 'Asignación creada correctamente' });
        this.displayDialogCrear = false;
        this.cargar();
      },
      error: () => {
        this.notification.add({ module: 'Asignar', severity: 'error', summary: 'Error', detail: 'No se pudo crear la asignación' });
      },
    });
  }

  anular(a: Asignacion) {
    this.confirmationService.confirm({
      message: `¿Anular la asignación de <b>${a.producto?.nombre ?? 'este producto'}</b> a la ficha <b>${a.ficha?.numero_ficha ?? a.id_ficha}</b>?`,
      header: 'Confirmar anulación',
      icon: 'pi pi-ban',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.asignacionService.anular(a.id_asignacion!).subscribe({
          next: () => {
            this.notification.add({ module: 'Asignar', severity: 'success', summary: 'Éxito', detail: 'Asignación anulada' });
            this.cargar();
          },
          error: () => {
            this.notification.add({ module: 'Asignar', severity: 'error', summary: 'Error', detail: 'No se pudo anular' });
          },
        });
      },
    });
  }

  eliminar(a: Asignacion) {
    this.confirmationService.confirm({
      message: '¿Eliminar esta asignación permanentemente?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.asignacionService.eliminar(a.id_asignacion!).subscribe({
          next: () => {
            this.notification.add({ module: 'Asignar', severity: 'success', summary: 'Éxito', detail: 'Asignación eliminada' });
            this.cargar();
          },
          error: () => {
            this.notification.add({ module: 'Asignar', severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
          },
        });
      },
    });
  }
}
