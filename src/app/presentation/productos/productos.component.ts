import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
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
    TooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="productos-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            pButton
            label="Nuevo Producto"
            icon="pi pi-plus"
            class="btn-add"
            (click)="openNew()"
          ></button>
          <button
            pButton
            label="Eliminar"
            icon="pi pi-trash"
            class="p-button-danger p-button-outlined"
            style="border-radius: 14px; height: 50px; font-weight: 700;"
            [disabled]="!hasSelectedProducts"
            (click)="deleteSelected()"
          ></button>
        </div>
        <div class="toolbar-center">
          <h2 class="page-title">Catálogo de Productos</h2>
        </div>
        <div class="toolbar-right">
           <!-- Espacio para buscador u otros elementos -->
        </div>
      </div>

      <div class="table-card">
        <div class="table-header">
           <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar productos por nombre, SKU o código..."
              class="search-input"
            />
          </div>
        </div>

        <p-table
          [value]="productosFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [(selection)]="selectedProducts"
          styleClass="modern-table"
          [rowHover]="true"
          dataKey="id"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 4rem">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th>SKU / Referencia</th>
              <th>Producto</th>
              <th>Imagen</th>
              <th>Categoría</th>
              <th>Estado de Stock</th>
              <th class="text-center">Acciones</th>
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
                  <div *ngIf="!producto.imagenUrl" class="w-[48px] h-[48px] rounded-lg bg-slate-100 flex items-center justify-center">
                     <i class="pi pi-image text-slate-300"></i>
                  </div>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="producto.categoriaNombre || 'Sin categoría'"
                  severity="secondary"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <span class="status-badge" [ngClass]="getStatusClass(producto)">
                  {{ getEstado(producto) }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-text btn-edit"
                    (click)="editar(producto)"
                    pTooltip="Editar producto"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-text btn-delete"
                    (click)="eliminar(producto)"
                    pTooltip="Eliminar producto"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">
                <i class="pi pi-box"></i>
                <p>No se encontraron productos en el catálogo</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="esNuevo ? '✨ Registrar Producto' : '📝 Editar Producto'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <form [formGroup]="productoForm" class="form-grid mt-2">
        <div class="form-field">
          <label for="nombre">Nombre Comercial *</label>
          <input
            pInputText
            id="nombre"
            formControlName="nombre"
            placeholder="Ej: Teclado Mecánico RGB"
          />
        </div>

        <div class="form-field">
          <label for="descripcion">Descripción Breve</label>
          <input
            pInputText
            id="descripcion"
            formControlName="descripcion"
            placeholder="Detalles del producto"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="codigoUNSPSC">Código UNSPSC</label>
            <input
              pInputText
              id="codigoUNSPSC"
              formControlName="codigoUNSPSC"
              placeholder="Código estandarizado"
            />
          </div>
          <div class="form-field">
            <label for="SKU">Referencia SKU *</label>
            <input 
              pInputText 
              id="SKU" 
              formControlName="SKU" 
              placeholder="SKU-001" 
            />
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
            placeholder="Seleccione una categoría"
            [showClear]="true"
            appendTo="body"
            styleClass="w-full"
          ></p-select>
        </div>

        <div class="form-field">
          <label for="imagenUrl">URL de la Imagen</label>
          <input
            pInputText
            id="imagenUrl"
            formControlName="imagenUrl"
            placeholder="https://images.unsplash.com/..."
          />
        </div>
      </form>

      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          class="btn-secondary"
          (click)="displayDialog = false"
        ></button>
        <button
          pButton
          label="Guardar Producto"
          class="btn-primary"
          [disabled]="productoForm.invalid"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `
})
export class ProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private inventarioService = inject(InventarioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

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
        this.cdr.detectChanges();
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
      'DISPONIBLE': 'status-available',
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
