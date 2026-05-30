import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { SitioService } from '../../infrastructure/services/sitio.service';

interface Inventario {
  id_inventario?: number;
  estado: string;
  id_item: number;
  id_sitio: number;
  item?: {
    id_item: number;
    codigo_sku: string;
    estado: string;
    id_producto: number;
    producto?: {
      id_producto: number;
      nombre: string;
      SKU: string;
    };
  };
  sitio?: {
    id_sitio: number;
    nombre: string;
    tipo: string;
  };
}

@Component({
  selector: 'app-inventario',
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
    SelectModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <!-- Header -->
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-warehouse"></i> Control de Inventario
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar por SKU, producto o sitio..."
              class="search-input"
            />
          </div>
          <button
            pButton
            label="Registrar Entrada"
            icon="pi pi-plus"
            (click)="openNew()"
            class="btn-add"
          ></button>
        </div>
      </div>

      <!-- Table -->
      <div class="data-table-wrapper">
        <p-table
          [value]="inventarioFiltrado"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:100px">ID</th>
              <th>Código SKU (Item)</th>
              <th>Producto</th>
              <th>Ubicación / Sitio</th>
              <th style="width:160px">Estado</th>
              <th style="width:140px" class="text-center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-inv>
            <tr>
              <td><span class="text-slate-400 text-xs font-bold">#{{ inv.id_inventario }}</span></td>
              <td><span class="font-semibold text-slate-800">{{ inv.item?.codigo_sku || 'Sin SKU' }}</span></td>
              <td><span class="text-slate-600 font-medium">{{ inv.item?.producto?.nombre || 'Desconocido' }}</span></td>
              <td>
                <span class="flex items-center gap-1.5 text-slate-500">
                  <i class="pi pi-map-marker text-xs text-slate-400"></i>
                  {{ inv.sitio?.nombre || 'Sin Ubicación' }}
                </span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(inv.estado)">
                  {{ inv.estado }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    pTooltip="Modificar Estado"
                    tooltipPosition="top"
                    (click)="editar(inv)"
                    class="btn-table-action btn-editor"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    pTooltip="Dar de Baja / Retirar"
                    tooltipPosition="top"
                    (click)="eliminar(inv)"
                    class="btn-table-action btn-eliminar"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-warehouse"></i>
                <p>No se encontraron registros de inventario</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Create/Edit Form Dialog -->
    <p-dialog
      [header]="esNuevo ? '✨ Registrar Entrada en Inventario' : '📝 Actualizar Estado de Inventario'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '480px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      maskStyleClass="backdrop-blur-sm bg-black/40"
      appendTo="body"
    >
      <div class="form-grid mt-4">
        <!-- Selector de Item (Only on Create) -->
        <div class="form-field" *ngIf="esNuevo">
          <label class="text-sm font-bold text-gray-900">Seleccionar Item (SKU - Producto) *</label>
          <p-select
            [options]="itemsDisponibles"
            [(ngModel)]="inventarioEdit.id_item"
            optionLabel="displayLabel"
            optionValue="id_item"
            placeholder="Selecciona un item disponible"
            [filter]="true"
            filterBy="displayLabel"
            styleClass="w-full !bg-gray-100 !border-transparent hover:!border-gray-300 focus:!border-gray-300 !text-gray-900 !rounded-md transition-all"
            [style]="{'width':'100%'}"
            appendTo="body"
          ></p-select>
        </div>

        <!-- Static Item Info (Only on Edit) -->
        <div class="form-field p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl" *ngIf="!esNuevo">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item de Inventario</div>
          <div class="text-sm font-bold text-slate-900">{{ inventarioEdit.item?.codigo_sku }}</div>
          <div class="text-xs text-slate-500 mt-0.5">{{ inventarioEdit.item?.producto?.nombre }}</div>
        </div>

        <!-- Selector de Sitio / Ubicación (Only on Create) -->
        <div class="form-field" *ngIf="esNuevo">
          <label class="text-sm font-bold text-gray-900">Ubicación / Sitio de Almacenamiento *</label>
          <p-select
            [options]="sitios"
            [(ngModel)]="inventarioEdit.id_sitio"
            optionLabel="nombre"
            optionValue="id_sitio"
            placeholder="Selecciona un sitio"
            styleClass="w-full !bg-gray-100 !border-transparent hover:!border-gray-300 focus:!border-gray-300 !text-gray-900 !rounded-md transition-all"
            [style]="{'width':'100%'}"
            appendTo="body"
          ></p-select>
        </div>

        <!-- Static Sitio Info (Only on Edit) -->
        <div class="form-field p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl" *ngIf="!esNuevo">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación / Sitio</div>
          <div class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <i class="pi pi-map-marker text-slate-400"></i>
            {{ inventarioEdit.sitio?.nombre }}
          </div>
        </div>

        <!-- Selector de Estado -->
        <div class="form-field">
          <label class="text-sm font-bold text-gray-900">Estado de Disponibilidad *</label>
          <p-select
            [options]="estadosDisponibles"
            [(ngModel)]="inventarioEdit.estado"
            placeholder="Selecciona un estado"
            styleClass="w-full !bg-gray-100 !border-transparent hover:!border-gray-300 focus:!border-gray-300 !text-gray-900 !rounded-md transition-all"
            [style]="{'width':'100%'}"
            appendTo="body"
          ></p-select>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          class="btn-secondary"
          (click)="displayDialog = false"
        ></button>
        <button
          pButton
          [label]="esNuevo ? 'Registrar' : 'Actualizar'"
          class="btn-primary"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private sitioService = inject(SitioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  inventario: Inventario[] = [];
  inventarioFiltrado: Inventario[] = [];
  sitios: any[] = [];
  itemsDisponibles: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  inventarioEdit: Inventario = this.getNuevoInventario();

  estadosDisponibles = ['DISPONIBLE', 'BAJO STOCK', 'SIN STOCK', 'PRESTADO', 'MANTENIMIENTO', 'RESERVADO'];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarInventario();
    this.cargarSitios();
  }

  cargarInventario() {
    this.inventarioService.getInventarios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.inventario = d;
        this.inventarioFiltrado = d;
        this.cargarItemsDisponibles();
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.inventario = [];
        this.inventarioFiltrado = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.sitios = d.map((s: any) => ({
          ...s,
          id_sitio: s.id_sitio ?? s.id
        }));
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  cargarItemsDisponibles() {
    this.productoService.getAllItems().subscribe({
      next: (res: any) => {
        const allItems = res?.data || res || [];
        
        // Filter out items that are already linked in the inventory
        const existingItemIds = new Set(this.inventario.map(inv => inv.id_item));
        
        this.itemsDisponibles = allItems
          .filter((item: any) => !existingItemIds.has(item.id_item))
          .map((item: any) => ({
            ...item,
            displayLabel: `${item.codigo_sku} - ${item.producto?.nombre || 'Sin nombre'}`
          }));
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.inventarioFiltrado = this.inventario.filter(
      (i) =>
        i.item?.codigo_sku?.toLowerCase().includes(f) ||
        i.item?.producto?.nombre?.toLowerCase().includes(f) ||
        i.sitio?.nombre?.toLowerCase().includes(f) ||
        i.estado?.toLowerCase().includes(f)
    );
  }

  getStatusClass(estado: string): string {
    const e = (estado || '').toUpperCase();
    if (e.includes('DISPONIBLE')) return 'status-disponible';
    if (e.includes('BAJO')) return 'status-bajo';
    if (e.includes('SIN')) return 'status-sinstock';
    return 'status-pendiente';
  }

  getNuevoInventario(): Inventario {
    return {
      estado: 'DISPONIBLE',
      id_item: 0,
      id_sitio: 0
    };
  }

  openNew() {
    this.esNuevo = true;
    this.inventarioEdit = this.getNuevoInventario();
    this.cargarItemsDisponibles();
    this.displayDialog = true;
  }

  editar(inv: Inventario) {
    this.esNuevo = false;
    this.inventarioEdit = { ...inv };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.inventarioEdit.id_item || !this.inventarioEdit.id_sitio || !this.inventarioEdit.estado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete todos los campos requeridos',
      });
      return;
    }

    const payload = {
      estado: this.inventarioEdit.estado,
      id_item: Number(this.inventarioEdit.id_item),
      id_sitio: Number(this.inventarioEdit.id_sitio)
    };

    if (this.esNuevo) {
      this.inventarioService.crearInventario(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Entrada registrada en inventario correctamente',
          });
          this.displayDialog = false;
          this.cargarInventario();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la entrada en inventario: ' + (err.error?.message || 'Error del servidor'),
          });
        },
      });
    } else {
      this.inventarioService.actualizarInventario(this.inventarioEdit.id_inventario!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado de inventario actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarInventario();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado de inventario',
          });
        },
      });
    }
  }

  eliminar(inv: Inventario) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas retirar del inventario el item ${inv.item?.codigo_sku}?`,
      header: 'Confirmar Retiro de Inventario',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.inventarioService.eliminarInventario(inv.id_inventario!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Item retirado del inventario',
            });
            this.cargarInventario();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo retirar el item del inventario',
            });
          }
        });
      }
    });
  }
}
