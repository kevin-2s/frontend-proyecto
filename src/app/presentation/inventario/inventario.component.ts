import { Component, OnInit, inject } from '@angular/core';
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
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    <div class="module-container">
      <div class="toolbar">
        <div class="toolbar-center"><h2 class="page-title">Gestionar Inventario</h2></div>
        <div class="toolbar-right">
          <span class="p-input-icon-left search-box"
            ><i class="pi pi-search"></i
            ><input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar inventario..."
              class="search-input"
          /></span>
        </div>
      </div>
      <div class="table-card">
        <p-table
          [value]="inventarioFiltrado"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
          [tableStyle]="{ 'min-width': '60rem' }"
          [stripedRows]="true"
          styleClass="p-datatable-gridlines"
          [rowHover]="true"
        >
          <ng-template pTemplate="header"
            ><tr>
              <th pSortableColumn="id" style="width:80px">
                ID <p-sortIcon field="id"></p-sortIcon>
              </th>
              <th pSortableColumn="productoNombre">
                Producto <p-sortIcon field="productoNombre"></p-sortIcon>
              </th>
              <th pSortableColumn="cantidadActual" style="text-align:right">
                Cantidad Actual <p-sortIcon field="cantidadActual"></p-sortIcon>
              </th>
              <th pSortableColumn="stockMinimo" style="text-align:right">
                Stock Mínimo <p-sortIcon field="stockMinimo"></p-sortIcon>
              </th>
              <th pSortableColumn="estado" style="width:120px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width:100px;text-align:center">Acciones</th>
            </tr></ng-template
          >
          <ng-template pTemplate="body" let-inv
            ><tr>
              <td>
                <span class="id-badge">#{{ inv.id }}</span>
              </td>
              <td>
                <span class="nombre-cell">{{
                  inv.productoNombre || 'Producto #' + inv.productoId
                }}</span>
              </td>
              <td style="text-align:right">
                <span class="num-cell">{{ inv.cantidadActual }}</span>
              </td>
              <td style="text-align:right">
                <span class="num-cell">{{ inv.stockMinimo }}</span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(inv)">{{
                  getEstado(inv)
                }}</span>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="btn-edit p-button-sm p-button-text"
                  (click)="editar(inv)"
                  pTooltip="Editar"
                ></button>
              </td></tr
          ></ng-template>
          <ng-template pTemplate="emptymessage"
            ><tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-box"></i><span>No se encontraron registros de inventario.</span>
              </td>
            </tr></ng-template
          >
        </p-table>
      </div>
    </div>
    <p-dialog
      [header]="'Editar Inventario'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ minWidth: '400px', width: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="form-container">
        <div class="form-field">
          <label>Cantidad Actual</label
          ><p-inputNumber
            [(ngModel)]="inventarioEdit.cantidadActual"
            mode="decimal"
            [min]="0"
            class="form-input"
          ></p-inputNumber>
        </div>
        <div class="form-field">
          <label>Stock Mínimo</label
          ><p-inputNumber
            [(ngModel)]="inventarioEdit.stockMinimo"
            mode="decimal"
            [min]="0"
            class="form-input"
          ></p-inputNumber>
        </div>
      </div>
      <ng-template pTemplate="footer"
        ><div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            icon="pi pi-times"
            class="btn-cancel"
            (click)="displayDialog = false"
          ></button
          ><button
            pButton
            label="Guardar"
            icon="pi pi-check"
            class="btn-save"
            (click)="guardar()"
          ></button></div
      ></ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .module-container {
        padding: 24px;
        background-color: #f8f9fa;
        min-height: calc(100vh - 60px);
      }
      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 16px;
      }
      .toolbar-center {
        flex: 1;
        text-align: center;
      }
      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #212529;
        margin: 0;
      }
      .toolbar-right {
        min-width: 280px;
      }
      .search-box {
        width: 100%;
      }
      .search-input {
        width: 100%;
        border-radius: 8px;
        border: 1px solid #dee2e6;
      }
      .search-input:focus {
        border-color: #39a900;
        box-shadow: 0 0 0 2px rgba(57, 169, 0, 0.2);
      }
      .table-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }
      .id-badge {
        font-weight: 600;
        color: #495057;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
      .nombre-cell {
        font-weight: 500;
        color: #212529;
      }
      .num-cell {
        font-weight: 600;
        color: #212529;
      }
      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .status-disponible {
        background: #d1fae5;
        color: #059669;
      }
      .status-bajo {
        background: #fed7aa;
        color: #ea580c;
      }
      .status-sinstock {
        background: #fee2e2;
        color: #dc2626;
      }
      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 4px;
      }
      .btn-edit {
        color: #fd7e14 !important;
      }
      .btn-edit:hover {
        background-color: #fff3e0 !important;
      }
      .empty-message {
        text-align: center;
        padding: 40px !important;
        color: #6c757d;
      }
      .empty-message i {
        display: block;
        font-size: 48px;
        margin-bottom: 10px;
        color: #adb5bd;
      }
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .form-field label {
        font-weight: 500;
        color: #495057;
        font-size: 14px;
      }
      .form-input {
        width: 100%;
      }
      .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        width: 100%;
      }
      .btn-cancel {
        background-color: #6c757d !important;
        border-color: #6c757d !important;
        border-radius: 8px !important;
      }
      .btn-cancel:hover {
        background-color: #5a6268 !important;
      }
      .btn-save {
        background-color: #39a900 !important;
        border-color: #39a900 !important;
        border-radius: 8px !important;
      }
      .btn-save:hover {
        background-color: #2d8600 !important;
      }
      :host ::ng-deep .p-datatable .p-datatable-header {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }
      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #212529;
        font-weight: 600;
        border-bottom: 2px solid #39a900;
        padding: 14px;
      }
      :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        padding: 14px;
        border-bottom: 1px solid #e9ecef;
      }
      :host ::ng-deep .p-paginator {
        padding: 12px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
      }
      :host ::ng-deep .form-dialog .p-dialog-header {
        background: #39a900;
        color: white;
        padding: 16px 24px;
      }
      :host ::ng-deep .form-dialog .p-dialog-title {
        color: white;
        font-weight: 600;
      }
      :host ::ng-deep .form-dialog .p-dialog-header .p-dialog-header-icon {
        color: white;
      }
      :host ::ng-deep .form-dialog .p-dialog-body {
        padding: 24px;
      }
      :host ::ng-deep .form-dialog .p-dialog-footer {
        padding: 16px 24px;
        border-top: 1px solid #dee2e6;
      }
    `,
  ],
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
