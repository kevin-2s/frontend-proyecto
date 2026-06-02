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

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  codigo_unspsc: string;
  SKU: string;
  tipo_material: string;
  unidad_medida: string;
  es_psd: boolean;
  fecha_vencimiento?: string;
  id_categoria?: number;
  stock_minimo?: number;
  itemsDisponibles?: number;
  totalItems?: number;
  categoria?: {
    id_categoria: number;
    nombre: string;
  };
}

interface Categoria {
  id_categoria: number;
  nombre: string;
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
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-box"></i> Catálogo de Productos
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar producto, SKU..." class="search-input" />
          </div>
          <button
            *ngIf="!displayDialog"
            type="button"
            class="btn-add"
            (click)="openNew()"
          >
            <i class="pi pi-plus"></i>
            Nuevo Producto
          </button>
          <button
            *ngIf="displayDialog"
            type="button"
            class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none"
            (click)="displayDialog = false"
          >
            <i class="pi pi-times"></i>
            Cerrar Formulario
          </button>
        </div>
      </div>

      <!-- Inline Form Card -->
      <div *ngIf="displayDialog" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
            <i class="pi pi-box text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Registrar Producto' : 'Editar Producto' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el producto en el catálogo</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <form [formGroup]="productoForm" class="form-grid mt-2">
            <div class="form-field">
              <input
                pInputText
                id="nombre"
                formControlName="nombre"
                placeholder="Ej: Martillo"
              />
              <label for="nombre">Nombre *</label>
            </div>

            <div class="product-form-row">
              <div class="form-field">
                <input
                  pInputText
                  id="codigo_unspsc"
                  formControlName="codigo_unspsc"
                  placeholder="27111600"
                />
                <label for="codigo_unspsc">Código UNSPSC</label>
              </div>
              <div class="form-field">
                <input 
                  pInputText 
                  id="SKU" 
                  formControlName="SKU" 
                  placeholder="MAR-001" 
                />
                <label for="SKU">SKU *</label>
              </div>
            </div>

            <div class="product-form-row">
              <div class="form-field">
                <div class="input-with-button">
                  <p-select
                    id="tipo_material"
                    formControlName="tipo_material"
                    [options]="tiposMaterial"
                    placeholder=" "
                    appendTo="body"
                    styleClass="w-full"
                  ></p-select>
                  <button
                    type="button"
                    class="btn-inline-add"
                    (click)="displayAddTipoMaterial = true"
                    pTooltip="Agregar tipo de material"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
                <label for="tipo_material">Tipo de Material *</label>
              </div>
              <div class="form-field">
                <div class="input-with-button">
                  <p-select
                    id="unidad_medida"
                    formControlName="unidad_medida"
                    [options]="unidadesMedida"
                    placeholder=" "
                    appendTo="body"
                    styleClass="w-full"
                  ></p-select>
                  <button
                    type="button"
                    class="btn-inline-add"
                    (click)="displayAddUnidadMedida = true"
                    pTooltip="Agregar unidad de medida"
                  >
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
                <label for="unidad_medida">Unidad de Medida *</label>
              </div>
            </div>

            <div class="product-form-row">
              <div *ngIf="esNuevo" class="form-field">
                <input
                  pInputText
                  type="number"
                  id="cantidad"
                  formControlName="cantidad"
                  placeholder="Ej: 5"
                  min="1"
                />
                <label for="cantidad">Cantidad de unidades *</label>
              </div>
              <div class="form-field">
                <input
                  pInputText
                  type="number"
                  id="stock_minimo"
                  formControlName="stock_minimo"
                  placeholder="Ej: 2"
                  min="1"
                />
                <label for="stock_minimo">Stock mínimo para alertas *</label>
              </div>
            </div>

            <div class="product-form-row items-center gap-5">
              <div class="form-field flex flex-row items-center gap-2 py-1">
                <input type="checkbox" formControlName="es_psd" (change)="onPsdChange($event)" id="es_psd" class="w-4 h-4 cursor-pointer" />
                <label for="es_psd" class="text-xs font-bold text-slate-800 cursor-pointer select-none">¿Es PSD?</label>
              </div>
              <div *ngIf="psdChecked" class="form-field">
                <input
                  pInputText
                  type="date"
                  id="fecha_vencimiento"
                  formControlName="fecha_vencimiento"
                  class="w-full animate-fade-in"
                />
                <label for="fecha_vencimiento">Fecha de Vencimiento</label>
              </div>
            </div>

            <div class="form-field">
              <div class="input-with-button">
                <p-select
                  id="id_categoria"
                  formControlName="id_categoria"
                  [options]="categorias"
                  optionLabel="nombre"
                  optionValue="id_categoria"
                  placeholder=" "
                  [showClear]="true"
                  appendTo="body"
                  styleClass="w-full"
                ></p-select>
                <button
                  type="button"
                  class="btn-inline-add"
                  (click)="displayAddCategoria = true"
                  pTooltip="Agregar nueva categoría"
                >
                  <i class="pi pi-plus"></i>
                </button>
              </div>
              <label for="id_categoria">Categoría *</label>
            </div>
          </form>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              class="btn-cancelar"
              (click)="displayDialog = false"
            >Cancelar</button>
            <button
              type="button"
              class="btn-guardar"
              [disabled]="productoForm.invalid"
              (click)="guardar()"
            >Guardar Producto</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">

        <p-table
          [value]="productosFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [(selection)]="selectedProducts"
          styleClass="modern-table"
          [rowHover]="true"
          dataKey="id_producto"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 4rem">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th>SKU</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Código UNSPSC</th>
              <th>Tipo Material</th>
              <th class="text-center">Stock Mínimo</th>
              <th class="text-center">Cantidad</th>
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
                <p-tag
                  [value]="producto.categoria?.nombre || 'Sin categoría'"
                  severity="secondary"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <span>{{ producto.codigo_unspsc || '-' }}</span>
              </td>
              <td>
                <p-tag
                  [value]="producto.tipo_material || '-'"
                  severity="info"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td class="text-center">
                <span>{{ producto.stock_minimo || 0 }}</span>
              </td>
              <td class="text-center">
                <span class="font-bold text-slate-700">{{ producto.totalItems || 0 }}</span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-eye"
                    class="btn-table-action btn-editor"
                    style="background-color: #f1f5f9 !important; color: #475569 !important;"
                    (click)="verItems(producto)"
                    pTooltip="Ver items"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(producto)"
                    pTooltip="Editar producto"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(producto)"
                    pTooltip="Eliminar producto"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-4">
                <i class="pi pi-box text-4xl text-slate-300 mb-2"></i>
                <p>No se encontraron productos</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>



    <!-- Diálogo para agregar nueva Categoría -->
    <p-dialog
      header="✨ Registrar Nueva Categoría"
      [(visible)]="displayAddCategoria"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nuevoNombreCat">Nombre de la Categoría *</label>
          <input
            pInputText
            id="nuevoNombreCat"
            [(ngModel)]="nuevoNombreCategoria"
            placeholder="Ej: Herramientas"
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            class="btn-cancelar"
            (click)="displayAddCategoria = false; nuevoNombreCategoria = ''"
          ></button>
          <button
            pButton
            label="Guardar"
            class="btn-guardar"
            [disabled]="!nuevoNombreCategoria.trim()"
            (click)="guardarNuevaCategoria()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Diálogo para agregar nuevo Tipo de Material -->
    <p-dialog
      header="✨ Registrar Tipo de Material"
      [(visible)]="displayAddTipoMaterial"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nuevoTipoMat">Nombre del Tipo *</label>
          <input
            pInputText
            id="nuevoTipoMat"
            [(ngModel)]="nuevoNombreTipoMaterial"
            placeholder="Ej: CONSUMO, DEVOLUTIVO..."
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            class="btn-cancelar"
            (click)="displayAddTipoMaterial = false; nuevoNombreTipoMaterial = ''"
          ></button>
          <button
            pButton
            label="Guardar"
            class="btn-guardar"
            [disabled]="!nuevoNombreTipoMaterial.trim()"
            (click)="guardarNuevoTipoMaterial()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Diálogo para agregar nueva Unidad de Medida -->
    <p-dialog
      header="✨ Registrar Unidad de Medida"
      [(visible)]="displayAddUnidadMedida"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nuevaUniMed">Nombre de la Unidad *</label>
          <input
            pInputText
            id="nuevaUniMed"
            [(ngModel)]="nuevoNombreUnidadMedida"
            placeholder="Ej: UNIDAD, PAR, METRO..."
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            label="Cancelar"
            class="btn-cancelar"
            (click)="displayAddUnidadMedida = false; nuevoNombreUnidadMedida = ''"
          ></button>
          <button
            pButton
            label="Guardar"
            class="btn-guardar"
            [disabled]="!nuevoNombreUnidadMedida.trim()"
            (click)="guardarNuevaUnidadMedida()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Diálogo para ver items del producto -->
    <p-dialog
      [header]="productoSeleccionadoParaItems ? '📦 Items de: ' + productoSeleccionadoParaItems.nombre : '📦 Items del Producto'"
      [(visible)]="displayItemsDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '600px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div *ngIf="cargandoItems" class="flex justify-center items-center p-8">
        <i class="pi pi-spin pi-spinner text-4xl text-blue-500"></i>
      </div>

      <div *ngIf="!cargandoItems">
        <p-table
          [value]="itemsDelProducto"
          styleClass="modern-table"
          [rowHover]="true"
          [paginator]="itemsDelProducto.length > 5"
          [rows]="5"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 100px">ID Item</th>
              <th>Código SKU</th>
              <th class="text-center" style="width: 150px">Estado</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>
                <span class="font-semibold text-slate-600">#{{ item.id_item }}</span>
              </td>
              <td>
                <span class="sku-cell">{{ item.codigo_sku }}</span>
              </td>
              <td class="text-center">
                <p-tag
                  [value]="item.estado"
                  [severity]="getItemSeverity(item.estado)"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="3" class="text-center p-4">
                <i class="pi pi-info-circle text-4xl text-slate-300 mb-2"></i>
                <p class="text-slate-500">No se encontraron items físicos registrados para este producto.</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button
            pButton
            label="Cerrar"
            class="btn-cancelar"
            (click)="displayItemsDialog = false"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class ProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  selectedProducts: Producto[] = [];
  psdChecked = false;

  displayAddCategoria = false;
  displayAddTipoMaterial = false;
  displayAddUnidadMedida = false;

  nuevoNombreCategoria = '';
  nuevoNombreTipoMaterial = '';
  nuevoNombreUnidadMedida = '';

  displayItemsDialog = false;
  itemsDelProducto: any[] = [];
  productoSeleccionadoParaItems: any = null;
  cargandoItems = false;

  tiposMaterial = [
    { label: 'CONSUMO', value: 'CONSUMO' },
    { label: 'DEVOLUTIVO', value: 'DEVOLUTIVO' },
    { label: 'SOFTWARE', value: 'SOFTWARE' },
    { label: 'EPP', value: 'EPP' }
  ];

  unidadesMedida = [
    { label: 'UNIDAD', value: 'UNIDAD' },
    { label: 'PAR', value: 'PAR' },
    { label: 'KIT', value: 'KIT' },
    { label: 'METRO', value: 'METRO' },
    { label: 'LITRO', value: 'LITRO' },
    { label: 'KILO', value: 'KILO' }
  ];

  productoForm: FormGroup = this.fb.group({
    id_producto: [null],
    nombre: ['', Validators.required],
    codigo_unspsc: [''],
    SKU: ['', Validators.required],
    tipo_material: ['CONSUMO', Validators.required],
    unidad_medida: ['UNIDAD', Validators.required],
    es_psd: [false],
    fecha_vencimiento: [''],
    id_categoria: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    stock_minimo: [1, [Validators.required, Validators.min(1)]],
  });

  get hasSelectedProducts(): boolean {
    return this.selectedProducts && this.selectedProducts.length > 0;
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarCategorias();
  }

  cargarDatos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        const prods = res?.data || res || [];
        this.productoService.getAllItems().subscribe({
          next: (itemsRes: any) => {
            const items = itemsRes?.data || itemsRes || [];
            this.productos = prods.map((p: any) => {
              const productItems = items.filter((item: any) => item.id_producto === p.id_producto);
              const disponibles = productItems.filter((item: any) => item.estado === 'DISPONIBLE').length;
              return {
                ...p,
                itemsDisponibles: disponibles,
                totalItems: productItems.length
              };
            });
            this.productosFiltrados = this.productos;
            setTimeout(() => this.cdr.detectChanges());
          },
          error: () => {
            this.productos = prods.map((p: any) => ({ ...p, itemsDisponibles: 0, totalItems: 0 }));
            this.productosFiltrados = this.productos;
            setTimeout(() => this.cdr.detectChanges());
          }
        });
      },
      error: () => {
        this.productos = [];
        this.productosFiltrados = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res?.data || res || [];
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.categorias = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }



  onPsdChange(event: any) {
    this.psdChecked = event.target.checked;
    if (!this.psdChecked) {
      this.productoForm.patchValue({ fecha_vencimiento: '' });
    }
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(filtroLower) ||
        p.codigo_unspsc?.toLowerCase().includes(filtroLower) ||
        p.SKU?.toLowerCase().includes(filtroLower) ||
        p.categoria?.nombre?.toLowerCase().includes(filtroLower) ||
        p.tipo_material?.toLowerCase().includes(filtroLower),
    );
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  openNew() {
    this.esNuevo = true;
    this.psdChecked = false;
    this.productoForm.get('cantidad')?.enable();
    this.productoForm.reset({
      id_producto: null,
      nombre: '',
      codigo_unspsc: '',
      SKU: '',
      tipo_material: 'CONSUMO',
      unidad_medida: 'UNIDAD',
      es_psd: false,
      fecha_vencimiento: '',
      id_categoria: null,
      cantidad: 1,
      stock_minimo: 1,
    });
    this.displayDialog = true;
  }

  editar(producto: Producto) {
    this.esNuevo = false;
    this.psdChecked = producto.es_psd === true;
    this.productoForm.get('cantidad')?.disable();
    const id_categoria = producto.id_categoria ?? producto.categoria?.id_categoria ?? null;
    this.productoForm.patchValue({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      codigo_unspsc: producto.codigo_unspsc,
      SKU: producto.SKU,
      tipo_material: producto.tipo_material,
      unidad_medida: producto.unidad_medida,
      es_psd: producto.es_psd,
      fecha_vencimiento: producto.fecha_vencimiento,
      id_categoria: id_categoria,
      stock_minimo: producto.stock_minimo || 1,
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

    const formValue = this.productoForm.getRawValue();
    const productoData: any = {
      nombre: formValue.nombre,
      codigo_unspsc: formValue.codigo_unspsc || undefined,
      SKU: formValue.SKU,
      tipo_material: formValue.tipo_material,
      unidad_medida: formValue.unidad_medida,
      es_psd: formValue.es_psd === true,
      fecha_vencimiento: formValue.fecha_vencimiento || undefined,
      id_categoria: formValue.id_categoria,
      stock_minimo: Number(formValue.stock_minimo),
    };

    if (this.esNuevo) {
      productoData.cantidad = Number(formValue.cantidad);
    }

    //console.log('Datos enviados al backend:', JSON.stringify(productoData));

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
      this.productoService.actualizarProducto(formValue.id_producto, productoData).subscribe({
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

  guardarNuevaCategoria() {
    const nombre = this.nuevoNombreCategoria.trim();
    if (!nombre) return;

    this.categoriaService.crearCategoria({ nombreCat: nombre }).subscribe({
      next: (res: any) => {
        const newCat = res?.data || res;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Categoría agregada correctamente',
        });
        
        // Reload categories and select the new one
        this.categoriaService.getCategorias().subscribe({
          next: (catRes: any) => {
            this.categorias = catRes?.data || catRes || [];
            const found = this.categorias.find(
              (c) => c.nombre.toLowerCase() === nombre.toLowerCase() || c.id_categoria === newCat?.id_categoria
            );
            if (found) {
              this.productoForm.patchValue({ id_categoria: found.id_categoria });
            } else if (newCat?.id_categoria) {
              this.productoForm.patchValue({ id_categoria: newCat.id_categoria });
            }
            this.displayAddCategoria = false;
            this.nuevoNombreCategoria = '';
            setTimeout(() => this.cdr.detectChanges());
          },
          error: () => {
            this.displayAddCategoria = false;
            this.nuevoNombreCategoria = '';
          }
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la categoría',
        });
      }
    });
  }

  guardarNuevoTipoMaterial() {
    const val = this.nuevoNombreTipoMaterial.trim().toUpperCase();
    if (!val) return;

    const exists = this.tiposMaterial.some(t => t.value === val);
    if (!exists) {
      this.tiposMaterial = [...this.tiposMaterial, { label: val, value: val }];
    }
    
    this.productoForm.patchValue({ tipo_material: val });
    this.displayAddTipoMaterial = false;
    this.nuevoNombreTipoMaterial = '';
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tipo de material agregado',
    });
  }

  guardarNuevaUnidadMedida() {
    const val = this.nuevoNombreUnidadMedida.trim().toUpperCase();
    if (!val) return;

    const exists = this.unidadesMedida.some(u => u.value === val);
    if (!exists) {
      this.unidadesMedida = [...this.unidadesMedida, { label: val, value: val }];
    }

    this.productoForm.patchValue({ unidad_medida: val });
    this.displayAddUnidadMedida = false;
    this.nuevoNombreUnidadMedida = '';
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Unidad de medida agregada',
    });
  }

  eliminar(producto: Producto) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el producto "' + producto.nombre + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productoService.eliminarProducto(producto.id_producto).subscribe({
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

  verItems(producto: Producto) {
    this.productoSeleccionadoParaItems = producto;
    this.displayItemsDialog = true;
    this.cargandoItems = true;
    this.itemsDelProducto = [];

    this.productoService.getItemsByProducto(producto.id_producto).subscribe({
      next: (res: any) => {
        this.itemsDelProducto = res?.data || res || [];
        this.cargandoItems = false;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los items del producto',
        });
        this.cargandoItems = false;
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  getItemSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'DISPONIBLE':
        return 'success';
      case 'PRESTADO':
        return 'warn';
      case 'DAÑADO':
        return 'danger';
      case 'PERDIDO':
        return 'secondary';
      default:
        return 'info';
    }
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
        const ids = this.selectedProducts.map((p) => p.id_producto);
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
