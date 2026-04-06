import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { CategoriaService } from '../../infrastructure/services/categoria.service';

interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  codigoUNSPSC: string;
  SKU: string;
  imagenUrl: string;
  categoriaId: number;
  categoriaNombre?: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    InputNumberModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
        <button
          pButton
          label="Nuevo Producto"
          icon="pi pi-plus"
          (click)="openNew()"
          class="bg-[#39A900] border-[#39A900] hover:bg-[#2D8600]"
        ></button>
      </div>

      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar producto..."
              class="w-64"
            />
          </span>
        </div>

        <p-table
          [value]="productosFiltrados"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Nombre</th>
              <th class="!bg-white !text-gray-600">Código UNSPSC</th>
              <th class="!bg-white !text-gray-600">SKU</th>
              <th class="!bg-white !text-gray-600">Categoría</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-producto>
            <tr>
              <td class="font-medium text-gray-900">#{{ producto.id }}</td>
              <td class="font-medium text-gray-900">{{ producto.nombre }}</td>
              <td>{{ producto.codigoUNSPSC }}</td>
              <td>{{ producto.SKU }}</td>
              <td>
                <p-tag
                  [value]="producto.categoriaNombre || 'Sin categoría'"
                  severity="info"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(producto)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(producto)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-500">
                No se encontraron productos.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nuevo Producto' : 'Editar Producto' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="nombre" class="font-medium text-gray-700">Nombre del Producto</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="producto.nombre"
            class="w-full"
            placeholder="Ingrese nombre del producto"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="descripcion" class="font-medium text-gray-700">Descripción</label>
          <input
            pInputText
            id="descripcion"
            [(ngModel)]="producto.descripcion"
            class="w-full"
            placeholder="Ingrese descripción"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="codigoUNSPSC" class="font-medium text-gray-700">Código UNSPSC</label>
            <input
              pInputText
              id="codigoUNSPSC"
              [(ngModel)]="producto.codigoUNSPSC"
              class="w-full"
              placeholder="Código UNSPSC"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="SKU" class="font-medium text-gray-700">SKU</label>
            <input
              pInputText
              id="SKU"
              [(ngModel)]="producto.SKU"
              class="w-full"
              placeholder="SKU"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label for="categoria" class="font-medium text-gray-700">Categoría</label>
          <select
            id="categoria"
            [(ngModel)]="producto.categoriaId"
            class="w-full p-2 border border-gray-300 rounded"
          >
            <option [value]="0">Seleccione categoría</option>
            <option *ngFor="let cat of categorias" [value]="cat.id">{{ cat.nombre }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label for="imagenUrl" class="font-medium text-gray-700">URL de Imagen</label>
          <input
            pInputText
            id="imagenUrl"
            [(ngModel)]="producto.imagenUrl"
            class="w-full"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          (click)="displayDialog = false"
          class="p-button-text"
        ></button>
        <button
          pButton
          label="Guardar"
          (click)="guardar()"
          class="bg-[#39A900] border-[#39A900]"
        ></button>
      </ng-template>
    </p-dialog>
  `,
})
export class ProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  producto: Producto = this.getNuevoProducto();

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.productos = res.data;
          this.productosFiltrados = res.data;
        }
      },
      error: () => {
        this.productos = [];
        this.productosFiltrados = [];
      },
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.categorias = res.data;
        }
      },
      error: () => {
        this.categorias = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.productosFiltrados = this.productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(filtroLower) ||
        p.codigoUNSPSC?.toLowerCase().includes(filtroLower) ||
        p.SKU?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoProducto(): Producto {
    return {
      nombre: '',
      descripcion: '',
      codigoUNSPSC: '',
      SKU: '',
      imagenUrl: '',
      categoriaId: 0,
    };
  }

  openNew() {
    this.esNuevo = true;
    this.producto = this.getNuevoProducto();
    this.displayDialog = true;
  }

  editar(producto: Producto) {
    this.esNuevo = false;
    this.producto = { ...producto };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.productoService.crearProducto(this.producto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto creado correctamente',
          });
          this.displayDialog = false;
          this.cargarProductos();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el producto',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Producto actualizado correctamente',
      });
      this.displayDialog = false;
      this.cargarProductos();
    }
  }

  eliminar(producto: Producto) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el producto ' + producto.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Producto eliminado correctamente',
        });
        this.cargarProductos();
      },
    });
  }
}
