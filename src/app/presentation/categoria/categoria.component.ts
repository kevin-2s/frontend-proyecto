import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriaService } from '../../infrastructure/services/categoria.service';

interface Categoria {
  id?: number;
  nombreCat: string;
  estado?: boolean;
}

@Component({
  selector: 'app-categoria',
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
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Categorías</h2>
        <button
          pButton
          label="Nueva Categoría"
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
              placeholder="Buscar categoría..."
              class="w-64"
            />
          </span>
        </div>

        <p-table
          [value]="categoriasFiltradas"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Nombre de Categoría</th>
              <th class="!bg-white !text-gray-600">Estado</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-categoria>
            <tr>
              <td class="font-medium text-gray-900">#{{ categoria.id }}</td>
              <td class="font-medium text-gray-900">{{ categoria.nombreCat }}</td>
              <td>
                <p-tag
                  [value]="categoria.estado ? 'Activa' : 'Inactiva'"
                  [severity]="categoria.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(categoria)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(categoria)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center py-8 text-gray-500">
                No se encontraron categorías.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nueva Categoría' : 'Editar Categoría' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '400px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="nombreCat" class="font-medium text-gray-700">Nombre de Categoría</label>
          <input
            pInputText
            id="nombreCat"
            [(ngModel)]="categoria.nombreCat"
            class="w-full"
            placeholder="Ej: Herramientas"
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
export class CategoriaComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  categoria: Categoria = this.getNuevaCategoria();

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.categorias = res.data;
          this.categoriasFiltradas = res.data;
        }
      },
      error: () => {
        this.categorias = [];
        this.categoriasFiltradas = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter((c) =>
      c.nombreCat?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevaCategoria(): Categoria {
    return { nombreCat: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.categoria = this.getNuevaCategoria();
    this.displayDialog = true;
  }

  editar(categoria: Categoria) {
    this.esNuevo = false;
    this.categoria = { ...categoria };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.categoriaService.crearCategoria({ nombreCat: this.categoria.nombreCat }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría creada correctamente',
          });
          this.displayDialog = false;
          this.cargarCategorias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la categoría',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Categoría actualizada correctamente',
      });
      this.displayDialog = false;
      this.cargarCategorias();
    }
  }

  eliminar(categoria: Categoria) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la categoría ' + categoria.nombreCat + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Categoría eliminada correctamente',
        });
        this.cargarCategorias();
      },
    });
  }
}
