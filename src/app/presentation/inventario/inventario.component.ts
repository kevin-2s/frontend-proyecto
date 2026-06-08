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
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { CategoriaService } from '../../infrastructure/services/categoria.service';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { forkJoin } from 'rxjs';

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
  providers: [ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
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
            *ngIf="!displayDialog"
            type="button"
            class="btn-add"
            (click)="openNew()"
          >
            <i class="pi pi-plus"></i>
            Registrar Entrada
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
              <th style="width:100px">ID Prod</th>
              <th>Código SKU</th>
              <th>Producto</th>
              <th>Ubicación / Sitio</th>
              <th style="width:120px" class="text-center">Cantidad</th>
              <th style="width:160px">Estado</th>
              <th style="width:140px" class="text-center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-inv>
            <tr>
              <td><span class="text-slate-400 text-xs font-bold">#{{ inv.id_producto }}</span></td>
              <td><span class="sku-cell">{{ inv.codigo_sku }}</span></td>
              <td><span class="text-slate-600 font-medium">{{ inv.nombre_producto }}</span></td>
              <td>
                <span class="flex items-center gap-1.5 text-slate-500">
                  <i class="pi pi-map-marker text-xs text-slate-400"></i>
                  {{ inv.nombre_sitio }}
                </span>
              </td>
              <td class="text-center font-bold text-slate-800">{{ inv.cantidad }}</td>
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
                    class="btn-table-action btn-editor"
                    (click)="editar(inv)"
                    pTooltip="Modificar Estado"
                    tooltipPosition="top"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(inv)"
                    pTooltip="Dar de Baja"
                    tooltipPosition="top"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message py-20 text-center">
                <i class="pi pi-warehouse text-5xl text-slate-300 opacity-50 mb-3 block"></i>
                <p class="text-slate-400 font-bold text-lg">No se encontraron registros de inventario</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>



    <!-- Diálogo para agregar nueva Categoría -->
    <p-dialog [dismissableMask]="true"
      header="✨ Registrar Nueva Categoría"
      [(visible)]="displayAddCategoria"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="form-field flex flex-col gap-1.5">
          <label class="text-sm font-bold text-gray-900">Nombre de la Categoría *</label>
          <input
            pInputText
            [(ngModel)]="nuevoNombreCategoria"
            placeholder="Ej: Herramientas"
            class="w-full !bg-gray-100 !py-2.5 !rounded-md outline-none"
          />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-5 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors outline-none cursor-pointer border-none bg-transparent"
          (click)="displayAddCategoria = false; nuevoNombreCategoria = ''"
        >
          Cancelar
        </button>
        <button
          class="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-md transition-all outline-none disabled:opacity-50 cursor-pointer border-none"
          [disabled]="!nuevoNombreCategoria.trim()"
          (click)="guardarNuevaCategoria()"
        >
          Guardar
        </button>
      </div>
    </p-dialog>

    <!-- Diálogo para agregar nuevo Tipo de Material -->
    <p-dialog [dismissableMask]="true"
      header="✨ Registrar Tipo de Material"
      [(visible)]="displayAddTipoMaterial"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="form-field flex flex-col gap-1.5">
          <label class="text-sm font-bold text-gray-900">Nombre del Tipo *</label>
          <input
            pInputText
            [(ngModel)]="nuevoNombreTipoMaterial"
            placeholder="Ej: CONSUMO, DEVOLUTIVO..."
            class="w-full !bg-gray-100 !py-2.5 !rounded-md outline-none"
          />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-5 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors outline-none cursor-pointer border-none bg-transparent"
          (click)="displayAddTipoMaterial = false; nuevoNombreTipoMaterial = ''"
        >
          Cancelar
        </button>
        <button
          class="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-md transition-all outline-none disabled:opacity-50 cursor-pointer border-none"
          [disabled]="!nuevoNombreTipoMaterial.trim()"
          (click)="guardarNuevoTipoMaterial()"
        >
          Guardar
        </button>
      </div>
    </p-dialog>

    <!-- Diálogo para agregar nueva Unidad de Medida -->
    <p-dialog [dismissableMask]="true"
      header="✨ Registrar Unidad de Medida"
      [(visible)]="displayAddUnidadMedida"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '400px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="form-field flex flex-col gap-1.5">
          <label class="text-sm font-bold text-gray-900">Nombre de la Unidad *</label>
          <input
            pInputText
            [(ngModel)]="nuevoNombreUnidadMedida"
            placeholder="Ej: UNIDAD, PAR, METRO..."
            class="w-full !bg-gray-100 !py-2.5 !rounded-md outline-none"
          />
        </div>
      </div>
      <div class="flex justify-end gap-3 mt-6">
        <button
          class="px-5 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors outline-none cursor-pointer border-none bg-transparent"
          (click)="displayAddUnidadMedida = false; nuevoNombreUnidadMedida = ''"
        >
          Cancelar
        </button>
        <button
          class="px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-black rounded-md transition-all outline-none disabled:opacity-50 cursor-pointer border-none"
          [disabled]="!nuevoNombreUnidadMedida.trim()"
          (click)="guardarNuevaUnidadMedida()"
        >
          Guardar
        </button>
      </div>
    </p-dialog>
  `
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sitioService = inject(SitioService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  inventario: Inventario[] = [];
  inventarioRaw: Inventario[] = [];
  inventarioAgrupado: any[] = [];
  inventarioFiltrado: any[] = [];
  grupoEditSelected: any = null;
  sitios: any[] = [];
  categorias: any[] = [];
  itemsDisponibles: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  inventarioEdit: Inventario = this.getNuevoInventario();

  estadosDisponibles = ['DISPONIBLE', 'BAJO STOCK', 'SIN STOCK', 'PRESTADO', 'MANTENIMIENTO', 'RESERVADO'];

  displayAddCategoria = false;
  displayAddTipoMaterial = false;
  displayAddUnidadMedida = false;

  nuevoNombreCategoria = '';
  nuevoNombreTipoMaterial = '';
  nuevoNombreUnidadMedida = '';

  nuevoProducto = this.getLimpiarNuevoProducto();

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

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarInventario();
    this.cargarSitios();
    this.cargarCategorias();
  }

  cargarInventario() {
    this.inventarioService.getInventarios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        setTimeout(() => {
          this.inventarioRaw = d;
          this.agruparInventario(d);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.inventarioRaw = [];
          this.inventarioAgrupado = [];
          this.inventarioFiltrado = [];
          this.cdr.detectChanges();
        });
      },
    });
  }

  agruparInventario(data: Inventario[]) {
    const groups: { [key: string]: any } = {};

    data.forEach((inv) => {
      const prodId = inv.item?.producto?.id_producto || 0;
      const sitioId = inv.sitio?.id_sitio || 0;
      const key = `${prodId}_${sitioId}`;

      if (!groups[key]) {
        groups[key] = {
          id_producto: prodId,
          codigo_sku: inv.item?.codigo_sku || 'Sin SKU',
          nombre_producto: inv.item?.producto?.nombre || 'Desconocido',
          id_sitio: sitioId,
          nombre_sitio: inv.sitio?.nombre || 'Sin Ubicación',
          cantidad: 0,
          estado: inv.estado,
          items: []
        };
      }

      groups[key].cantidad++;
      groups[key].items.push(inv);
      groups[key].estado = inv.estado;
    });

    this.inventarioAgrupado = Object.values(groups);
    this.filtrar();
  }

  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        setTimeout(() => {
          this.sitios = d.map((s: any) => ({
            ...s,
            id_sitio: s.id_sitio ?? s.id
          }));
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this.categorias = res?.data || res || [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  cargarItemsDisponibles() {
    // Stub: No longer used as selection is unified
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.inventarioFiltrado = this.inventarioAgrupado.filter(
      (i) =>
        i.codigo_sku?.toLowerCase().includes(f) ||
        i.nombre_producto?.toLowerCase().includes(f) ||
        i.nombre_sitio?.toLowerCase().includes(f) ||
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

  getLimpiarNuevoProducto() {
    return {
      nombre: '',
      descripcion: '',
      codigo_unspsc: '',
      SKU: '',
      tipo_material: 'CONSUMO',
      unidad_medida: 'UNIDAD',
      id_categoria: null as number | null,
      cantidad: 1,
      stock_minimo: 1,
      es_psd: false,
      fecha_vencimiento: ''
    };
  }

  openNew() {
    this.esNuevo = true;
    this.inventarioEdit = this.getNuevoInventario();
    this.nuevoProducto = this.getLimpiarNuevoProducto();
    this.cargarCategorias();
    this.displayDialog = true;
  }

  editar(inv: any) {
    this.esNuevo = false;
    this.inventarioEdit = {
      estado: inv.estado,
      id_item: inv.items[0]?.id_item,
      id_sitio: inv.id_sitio,
      id_inventario: inv.items[0]?.id_inventario,
      item: inv.items[0]?.item,
      sitio: inv.items[0]?.sitio
    };
    this.grupoEditSelected = inv;
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      // Registrar nuevo producto y sus items en inventario
      if (!this.nuevoProducto.nombre || !this.nuevoProducto.SKU || !this.nuevoProducto.id_categoria) {
        this.notification.add({ module: 'Inventario',
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Nombre, SKU y Categoría son requeridos para el producto',
        });
        return;
      }
      if (!this.inventarioEdit.id_sitio || !this.inventarioEdit.estado) {
        this.notification.add({ module: 'Inventario',
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Ubicación y Estado son requeridos para registrar en inventario',
        });
        return;
      }

      this.saving = true;
      const productPayload = {
        nombre: this.nuevoProducto.nombre,
        descripcion: this.nuevoProducto.descripcion || undefined,
        codigo_unspsc: this.nuevoProducto.codigo_unspsc,
        SKU: this.nuevoProducto.SKU,
        tipo_material: this.nuevoProducto.tipo_material,
        unidad_medida: this.nuevoProducto.unidad_medida,
        id_categoria: Number(this.nuevoProducto.id_categoria),
        cantidad: Number(this.nuevoProducto.cantidad),
        stock_minimo: Number(this.nuevoProducto.stock_minimo),
        es_psd: this.nuevoProducto.es_psd,
        fecha_vencimiento: this.nuevoProducto.es_psd && this.nuevoProducto.fecha_vencimiento ? new Date(this.nuevoProducto.fecha_vencimiento) : undefined
      };

      this.productoService.crearProducto(productPayload).subscribe({
        next: (res: any) => {
          const itemsGenerados = res?.data?.items_generados || [];
          if (itemsGenerados.length === 0) {
            this.notification.add({ module: 'Inventario',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Producto registrado correctamente, pero no se generaron items en el servidor',
            });
            this.displayDialog = false;
            this.cargarDatos();
            this.saving = false;
            return;
          }

          // Register all generated items in inventory
          const creations = itemsGenerados.map((item: any) => {
            return this.inventarioService.crearInventario({
              estado: this.inventarioEdit.estado,
              id_item: Number(item.id_item),
              id_sitio: Number(this.inventarioEdit.id_sitio)
            });
          });

          forkJoin(creations).subscribe({
            next: () => {
              this.notification.add({ module: 'Inventario',
                severity: 'success',
                summary: 'Éxito',
                detail: `Producto y ${itemsGenerados.length} items registrados en inventario exitosamente`,
              });
              this.displayDialog = false;
              this.cargarDatos();
              this.saving = false;
            },
            error: () => {
              this.notification.add({ module: 'Inventario',
                severity: 'warn',
                summary: 'Éxito parcial',
                detail: 'Producto creado, pero falló el registro de items en inventario',
              });
              this.displayDialog = false;
              this.cargarDatos();
              this.saving = false;
            }
          });
        },
        error: (err: any) => {
          this.saving = false;
          this.notification.add({ module: 'Inventario',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar el producto: ' + (err.error?.message || 'Error del servidor'),
          });
        }
      });

    } else {
      // Registrar item existente
      if (!this.inventarioEdit.id_sitio || !this.inventarioEdit.estado) {
        this.notification.add({ module: 'Inventario',
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Por favor complete todos los campos requeridos',
        });
        return;
      }

      this.saving = true;
      const updates = this.grupoEditSelected.items.map((item: any) => {
        return this.inventarioService.actualizarInventario(item.id_inventario, {
          estado: this.inventarioEdit.estado,
          id_item: Number(item.id_item),
          id_sitio: Number(this.inventarioEdit.id_sitio)
        });
      });

      forkJoin(updates).subscribe({
        next: () => {
          this.notification.add({ module: 'Inventario',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Estado de inventario actualizado correctamente para el grupo',
          });
          this.displayDialog = false;
          this.cargarInventario();
          this.saving = false;
        },
        error: () => {
          this.saving = false;
          this.notification.add({ module: 'Inventario',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado de inventario del grupo',
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
        this.notification.add({ module: 'Inventario',
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
              this.nuevoProducto.id_categoria = found.id_categoria;
            } else if (newCat?.id_categoria) {
              this.nuevoProducto.id_categoria = newCat.id_categoria;
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
        this.notification.add({ module: 'Inventario',
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
    
    this.nuevoProducto.tipo_material = val;
    this.displayAddTipoMaterial = false;
    this.nuevoNombreTipoMaterial = '';
    this.notification.add({ module: 'Inventario',
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

    this.nuevoProducto.unidad_medida = val;
    this.displayAddUnidadMedida = false;
    this.nuevoNombreUnidadMedida = '';
    this.notification.add({ module: 'Inventario',
      severity: 'success',
      summary: 'Éxito',
      detail: 'Unidad de medida agregada',
    });
  }

  eliminar(inv: any) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas retirar del inventario todos los ${inv.cantidad} items de "${inv.nombre_producto}" en ${inv.nombre_sitio}?`,
      header: 'Confirmar Retiro de Inventario',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, retirar todos',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const deletions = inv.items.map((item: any) => this.inventarioService.eliminarInventario(item.id_inventario));
        forkJoin(deletions).subscribe({
          next: () => {
            this.notification.add({ module: 'Inventario',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Items retirados del inventario correctamente',
            });
            this.cargarInventario();
          },
          error: () => {
            this.notification.add({ module: 'Inventario',
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron retirar algunos items del inventario',
            });
          }
        });
      }
    });
  }
}
