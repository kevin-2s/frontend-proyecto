import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { ProductoService } from '../../infrastructure/services/producto.service';

interface Inventario {
  id?: number;
  productoId: number;
  productoNombre?: string;
  cantidadActual: number;
  stockMinimo: number;
  estado?: string;
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
    InputNumberModule,
    TooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-warehouse"></i> Inventario
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar producto..." class="search-input" />
          </div>
        </div>
      </div>

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
              <th style="width:120px">ID</th>
              <th>Producto</th>
              <th style="text-align:right">Stock Actual</th>
              <th style="text-align:right">Stock Mínimo</th>
              <th style="width:180px">Estado</th>
              <th style="width:120px" class="text-center">Ajustar</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-inv>
            <tr>
              <td><span class="id-badge">#{{ inv.id }}</span></td>
              <td><span class="nombre-cell">{{ inv.productoNombre || 'Producto #' + inv.productoId }}</span></td>
              <td style="text-align:right"><span class="num-cell">{{ inv.cantidadActual }}</span></td>
              <td style="text-align:right"><span class="num-cell text-slate-400">{{ inv.stockMinimo }}</span></td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(inv)">
                  {{ getEstado(inv) }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(inv)"
                    pTooltip="Ajustar stock"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-box"></i>
                <p>No hay registros de inventario disponibles</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="📝 Ajustar Existencias"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="flex flex-col gap-4 mt-4">
        <div class="form-field">
          <label>Unidades en Stock</label>
          <p-inputNumber
            [(ngModel)]="inventarioEdit.cantidadActual"
            mode="decimal"
            [min]="0"
            [showButtons]="true"
            buttonLayout="horizontal"
            spinnerMode="horizontal"
            decrementButtonClass="p-button-secondary"
            incrementButtonClass="p-button-secondary"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
            styleClass="w-full"
            inputStyleClass="text-center font-bold"
          ></p-inputNumber>
        </div>
        <div class="form-field">
          <label>Límite de Alerta (Stock Mínimo)</label>
          <p-inputNumber
            [(ngModel)]="inventarioEdit.stockMinimo"
            mode="decimal"
            [min]="0"
            styleClass="w-full"
            placeholder="Ej: 5"
          ></p-inputNumber>
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
          label="Actualizar Stock"
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
  private messageService = inject(MessageService);
  inventario: Inventario[] = [];
  inventarioFiltrado: Inventario[] = [];
  filtro = '';
  displayDialog = false;
  inventarioEdit: Inventario = {} as Inventario;
  ngOnInit() {
    this.cargarInventario();
    this.cargarProductos();
  }
  cargarInventario() {
    this.inventarioService.getInventarios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.inventario = d;
        this.inventarioFiltrado = d;
      },
      error: () => {
        this.inventario = [];
        this.inventarioFiltrado = [];
      },
    });
  }
  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        const prods = res?.data || res || [];
        this.inventario.forEach((inv) => {
          const p = prods.find((x: any) => x.id === inv.productoId);
          if (p) inv.productoNombre = p.nombre;
        });
      },
      error: () => {},
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.inventarioFiltrado = this.inventario.filter(
      (i) => i.productoNombre?.toLowerCase().includes(f) || String(i.productoId).includes(f),
    );
  }
  getEstado(inv: Inventario): string {
    if (inv.cantidadActual === 0) return 'SIN STOCK';
    if (inv.cantidadActual <= inv.stockMinimo) return 'BAJO STOCK';
    return 'DISPONIBLE';
  }
  getStatusClass(inv: Inventario): string {
    const e = this.getEstado(inv);
    if (e === 'DISPONIBLE') return 'status-disponible';
    if (e === 'BAJO STOCK') return 'status-bajo';
    return 'status-sinstock';
  }
  editar(inv: Inventario) {
    this.inventarioEdit = { ...inv };
    this.displayDialog = true;
  }
  guardar() {
    this.inventarioService
      .actualizarInventario(this.inventarioEdit.id!, this.inventarioEdit)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Inventario actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarInventario();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el inventario',
          });
        },
      });
  }
}
