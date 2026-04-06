import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { CategoriaService } from '../../infrastructure/services/categoria.service';
import { InventarioService } from '../../infrastructure/services/inventario.service';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  codigoUNSPSC: string;
  SKU: string;
  imagenUrl: string;
  categoriaId: number;
  categoriaNombre?: string;
  cantidadActual?: number;
  stockMinimo?: number;
}

interface Categoria {
  id: number;
  nombre: string;
}

interface Inventario {
  productoId: number;
  cantidadActual: number;
  stockMinimo: number;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    FileUploadModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="productos-container">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            pButton
            label="Nuevo"
            icon="pi pi-plus"
            class="p-button-success"
            (click)="openNew()"
          ></button>
          <button
            pButton
            label="Eliminar"
            icon="pi pi-trash"
            class="p-button-danger"
            [disabled]="!hasSelectedProducts"
            (click)="deleteSelected()"
          ></button>
        </div>
        <div class="toolbar-right">
          <h2 class="page-title">Gestionar Productos</h2>
        </div>
        <div class="search-box">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar productos..."
              class="search-input"
            />
          </span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-container">
        <p-table
          [value]="productosFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20, 50]"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
          [(selection)]="selectedProducts"
          [tableStyle]="{ 'min-width': '75rem' }"
          styleClass="p-datatable-sm p-datatable-gridlines"
          [rowHover]="true"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 4rem">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th pSortableColumn="SKU" style="min-width: 100px">
                SKU <p-sortIcon field="SKU"></p-sortIcon>
              </th>
              <th pSortableColumn="nombre" style="min-width: 200px">
                Nombre <p-sortIcon field="nombre"></p-sortIcon>
              </th>
              <th style="min-width: 100px">Imagen</th>
              <th pSortableColumn="categoriaNombre" style="min-width: 150px">
                Categoría <p-sortIcon field="categoriaNombre"></p-sortIcon>
              </th>
              <th pSortableColumn="estado" style="min-width: 120px">
                Estado <p-sortIcon field="estado"></p-sortIcon>
              </th>
              <th style="width: 120px; text-align: center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-producto>
            <tr>
              <td>
                <p-tableCheckbox [value]="producto"></p-tableCheckbox>
              </td>
              <td>
                <span class="sku-cell">{{ producto.SKU }}</span>
              </td>
              <td>
                <span class="product-name">{{ producto.nombre }}</span>
              </td>
              <td>
                <div class="image-cell">
                  <img
                    *ngIf="producto.imagenUrl"
                    [src]="producto.imagenUrl"
                    [alt]="producto.nombre"
                    class="product-image"
                    (error)="onImageError($event)"
                  />
                  <i *ngIf="!producto.imagenUrl" class="pi pi-image no-image-icon"></i>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="producto.categoriaNombre || 'Sin categoría'"
                  severity="info"
                ></p-tag>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(producto)">
                  {{ getEstado(producto) }}
                </span>
              </td>
              <td class="action-buttons">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-text p-button-sm edit-btn"
                  (click)="editar(producto)"
                  pTooltip="Editar"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="p-button-text p-button-sm p-button-danger"
                  (click)="eliminar(producto)"
                  pTooltip="Eliminar"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">
                <i class="pi pi-inbox"></i>
                <span>No se encontraron productos.</span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Dialog Create/Edit -->
    <p-dialog
      [header]="esNuevo ? 'Nuevo Producto' : 'Editar Producto'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="product-dialog"
    >
      <form [formGroup]="productoForm" class="product-form">
        <div class="form-field">
          <label for="nombre">Nombre del Producto *</label>
          <input
            pInputText
            id="nombre"
            formControlName="nombre"
            placeholder="Ingrese nombre del producto"
          />
          <small
            class="error-text"
            *ngIf="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched"
          >
            El nombre es requerido
          </small>
        </div>

        <div class="form-field">
          <label for="descripcion">Descripción</label>
          <input
            pInputText
            id="descripcion"
            formControlName="descripcion"
            placeholder="Ingrese descripción"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="codigoUNSPSC">Código UNSPSC</label>
            <input
              pInputText
              id="codigoUNSPSC"
              formControlName="codigoUNSPSC"
              placeholder="Código UNSPSC"
            />
          </div>
          <div class="form-field">
            <label for="SKU">SKU *</label>
            <input pInputText id="SKU" formControlName="SKU" placeholder="SKU" />
            <small
              class="error-text"
              *ngIf="productoForm.get('SKU')?.invalid && productoForm.get('SKU')?.touched"
            >
              El SKU es requerido
            </small>
          </div>
        </div>

        <div class="form-field">
          <label for="categoriaId">Categoría</label>
          <p-select
            id="categoriaId"
            formControlName="categoriaId"
            [options]="categorias"
            optionLabel="nombre"
            optionValue="id"
            placeholder="Seleccione categoría"
            [showClear]="true"
            styleClass="w-full"
          ></p-select>
        </div>

        <div class="form-field">
          <label for="imagenUrl">URL de Imagen</label>
          <input
            pInputText
            id="imagenUrl"
            formControlName="imagenUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          icon="pi pi-times"
          class="p-button-text"
          (click)="displayDialog = false"
        ></button>
        <button
          pButton
          label="Guardar"
          icon="pi pi-check"
          class="p-button-success"
          [disabled]="productoForm.invalid"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .productos-container {
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

      .toolbar-left {
        display: flex;
        gap: 10px;
      }

      .toolbar-left .p-button-success {
        background-color: #39a900;
        border-color: #39a900;
      }

      .toolbar-left .p-button-success:hover {
        background-color: #2d8600;
        border-color: #2d8600;
      }

      .toolbar-left .p-button-danger {
        background-color: #dc3545;
        border-color: #dc3545;
      }

      .toolbar-left .p-button-danger:disabled {
        background-color: #e9ecef;
        border-color: #dee2e6;
        color: #adb5bd;
      }

      .toolbar-right {
        flex: 1;
      }

      .page-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .search-box {
        min-width: 280px;
      }

      .search-input {
        width: 100%;
        border-radius: 6px;
      }

      .table-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        overflow: hidden;
      }

      .sku-cell {
        font-family: 'Consolas', monospace;
        font-size: 13px;
        color: #495057;
        background: #f8f9fa;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .product-name {
        font-weight: 500;
        color: #212529;
      }

      .image-cell {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 60px;
        height: 60px;
      }

      .product-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 6px;
        border: 1px solid #dee2e6;
      }

      .no-image-icon {
        font-size: 24px;
        color: #adb5bd;
      }

      .status-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-disponible {
        background-color: #d1fae5;
        color: #059669;
      }

      .status-bajo-stock {
        background-color: #fed7aa;
        color: #ea580c;
      }

      .status-sin-stock {
        background-color: #fee2e2;
        color: #dc2626;
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 4px;
      }

      .edit-btn {
        color: #fd7e14 !important;
      }

      .edit-btn:hover {
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

      .product-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-field label {
        font-weight: 500;
        color: #495057;
        font-size: 14px;
      }

      .form-field input {
        width: 100%;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .error-text {
        color: #dc3545;
        font-size: 12px;
      }

      :host ::ng-deep .p-datatable .p-datatable-header {
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }

      :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        border-bottom: 2px solid #39a900;
      }

      :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
        background: #f8f9fa;
      }

      :host ::ng-deep .p-paginator {
        padding: 12px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
      }

      :host ::ng-deep .p-dropdown {
        width: 100%;
      }

      :host ::ng-deep .product-dialog .p-dialog-header {
        background: white;
        border-bottom: 2px solid #39a900;
      }

      :host ::ng-deep .product-dialog .p-dialog-footer {
        border-top: 1px solid #dee2e6;
      }

      :host ::ng-deep .p-button-success {
        background-color: #39a900 !important;
        border-color: #39a900 !important;
      }

      :host ::ng-deep .p-button-success:hover {
        background-color: #2d8600 !important;
        border-color: #2d8600 !important;
      }

      :host ::ng-deep .p-button-text {
        color: #6c757d;
      }
    `,
  ],
})
export class ProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private inventarioService = inject(InventarioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  inventarios: Inventario[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  selectedProducts: Producto[] = [];

  productoForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', Validators.required],
    descripcion: [''],
    codigoUNSPSC: [''],
    SKU: ['', Validators.required],
    imagenUrl: [''],
    categoriaId: [null],
  });

  get hasSelectedProducts(): boolean {
    return this.selectedProducts && this.selectedProducts.length > 0;
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.productos = data;
        this.productosFiltrados = data;
        this.cargarInventario();
      },
      error: () => {
        this.productos = [];
        this.productosFiltrados = [];
      },
    });

    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res?.data || res || [];
      },
      error: () => {
        this.categorias = [];
      },
    });
  }

  cargarInventario() {
    this.inventarioService.getInventarios().subscribe({
      next: (res: any) => {
        this.inventarios = res?.data || res || [];
      },
      error: () => {
        this.inventarios = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(filtroLower) ||
        p.codigoUNSPSC?.toLowerCase().includes(filtroLower) ||
        p.SKU?.toLowerCase().includes(filtroLower) ||
        p.categoriaNombre?.toLowerCase().includes(filtroLower),
    );
  }

  getInventario(productoId: number): Inventario | undefined {
    return this.inventarios.find((i) => i.productoId === productoId);
  }

  getEstado(producto: Producto): string {
    const inventario = this.getInventario(producto.id);
    const cantidad = inventario?.cantidadActual ?? producto.cantidadActual ?? 0;
    const stockMin = inventario?.stockMinimo ?? producto.stockMinimo ?? 0;

    if (cantidad === 0) return 'SIN STOCK';
    if (cantidad <= stockMin) return 'BAJO STOCK';
    return 'DISPONIBLE';
  }

  getStatusClass(producto: Producto): string {
    const estado = this.getEstado(producto);
    const map: { [key: string]: string } = {
      DISPONIBLE: 'status-disponible',
      'BAJO STOCK': 'status-bajo-stock',
      'SIN STOCK': 'status-sin-stock',
    };
    return map[estado] || '';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  openNew() {
    this.esNuevo = true;
    this.productoForm.reset({
      id: null,
      nombre: '',
      descripcion: '',
      codigoUNSPSC: '',
      SKU: '',
      imagenUrl: '',
      categoriaId: null,
    });
    this.displayDialog = true;
  }

  editar(producto: Producto) {
    this.esNuevo = false;
    this.productoForm.patchValue({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      codigoUNSPSC: producto.codigoUNSPSC,
      SKU: producto.SKU,
      imagenUrl: producto.imagenUrl,
      categoriaId: producto.categoriaId,
    });
    this.displayDialog = true;
  }

  guardar() {
    if (this.productoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor complete los campos requeridos',
      });
      return;
    }

    const productoData = this.productoForm.value;

    if (this.esNuevo) {
      this.productoService.crearProducto(productoData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto creado correctamente',
          });
          this.displayDialog = false;
          this.cargarDatos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el producto: ' + (err?.message || 'Error desconocido'),
          });
        },
      });
    } else {
      this.productoService.actualizarProducto(productoData.id, productoData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarDatos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el producto',
          });
        },
      });
    }
  }

  eliminar(producto: Producto) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el producto "' + producto.nombre + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productoService.eliminarProducto(producto.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto eliminado correctamente',
            });
            this.cargarDatos();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el producto',
            });
          },
        });
      },
    });
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message:
        '¿Está seguro de eliminar los ' +
        this.selectedProducts.length +
        ' productos seleccionados?',
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const ids = this.selectedProducts.map((p) => p.id);
        this.productoService.eliminarMultiples(ids).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Productos eliminados correctamente',
            });
            this.selectedProducts = [];
            this.cargarDatos();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron eliminar los productos',
            });
          },
        });
      },
    });
  }
}
