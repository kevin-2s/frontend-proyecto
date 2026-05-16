import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriaService } from '../../infrastructure/services/categoria.service';

interface Categoria {
  id?: number;
  nombre: string;
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
    ToggleSwitchModule,
    TooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-tag"></i> Categorías
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar categoría..." class="search-input" />
          </div>
          <button pButton label="Nueva" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="categoriasFiltradas"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:120px">ID</th>
              <th>Nombre de la Categoría</th>
              <th style="width:150px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-cat>
            <tr>
              <td><span class="id-badge">#{{ cat.id }}</span></td>
              <td><span class="nombre-cell">{{ cat.nombre }}</span></td>
              <td>
                <p-tag
                  [value]="cat.estado ? 'ACTIVA' : 'INACTIVA'"
                  [severity]="cat.estado ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(cat)"
                    pTooltip="Editar categoría"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(cat)"
                    pTooltip="Eliminar categoría"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-message">
                <i class="pi pi-tag"></i>
                <p>No se encontraron categorías registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="esNuevo ? '✨ Nueva Categoría' : '📝 Editar Categoría'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '450px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nombre">Nombre de la Categoría *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="categoria.nombre"
            placeholder="Ej: Insumos Médicos"
          />
        </div>
        <div class="form-field">
          <label>Estado de la Categoría</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p-toggleSwitch [(ngModel)]="categoria.estado"></p-toggleSwitch>
            <span class="font-bold text-sm" [class.text-green-600]="categoria.estado" [class.text-red-600]="!categoria.estado">
               {{ categoria.estado ? 'CATEGORÍA ACTIVA' : 'CATEGORÍA INACTIVA' }}
            </span>
          </div>
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
          label="Guardar Cambios"
          class="btn-primary"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `
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
        const d = res?.data || res || [];
        this.categorias = d;
        this.categoriasFiltradas = d;
      },
      error: () => {
        this.categorias = [];
        this.categoriasFiltradas = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter((c) =>
      c.nombre?.toLowerCase().includes(f),
    );
  }
  getNuevaCategoria(): Categoria {
    return { nombre: '', estado: true };
  }
  openNew() {
    this.esNuevo = true;
    this.categoria = this.getNuevaCategoria();
    this.displayDialog = true;
  }
  editar(cat: Categoria) {
    this.esNuevo = false;
    this.categoria = { ...cat };
    this.displayDialog = true;
  }
  guardar() {
    if (!this.categoria.nombre) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El nombre de la categoría es requerido',
      });
      return;
    }
    if (this.esNuevo) {
      this.categoriaService.crearCategoria({ nombre: this.categoria.nombre }).subscribe({
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
      this.categoriaService.actualizarCategoria(this.categoria.id!, this.categoria).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Categoría actualizada correctamente',
          });
          this.displayDialog = false;
          this.cargarCategorias();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la categoría',
          });
        },
      });
    }
  }
  eliminar(cat: Categoria) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la categoría ' + cat.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.eliminarCategoria(cat.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Categoría eliminada correctamente',
            });
            this.cargarCategorias();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la categoría',
            });
          },
        });
      },
    });
  }
}
