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
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SitioService } from '../../infrastructure/services/sitio.service';

interface Sitio {
  id?: number;
  nombre: string;
  tipo: string;
  estado?: boolean;
}

@Component({
  selector: 'app-sitios',
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
    SelectModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <button
            pButton
            label="Nuevo Sitio"
            icon="pi pi-plus"
            class="btn-add"
            (click)="openNew()"
          ></button>
        </div>
        <div class="toolbar-center">
          <h2 class="page-title">Gestión de Sitios y Bodegas</h2>
        </div>
        <div class="toolbar-right">
           <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar sitio por nombre o tipo..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <div class="table-card">
        <p-table
          [value]="sitiosFiltrados"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:120px">ID</th>
              <th>Nombre del Sitio</th>
              <th>Categoría / Tipo</th>
              <th style="width:150px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sitio>
            <tr>
              <td><span class="id-badge">#{{ sitio.id }}</span></td>
              <td><span class="nombre-cell">{{ sitio.nombre }}</span></td>
              <td>
                <p-tag 
                  [value]="sitio.tipo.toUpperCase()" 
                  [severity]="getTipoSeverity(sitio.tipo)"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="sitio.estado ? 'DISPONIBLE' : 'INACTIVO'"
                  [severity]="sitio.estado ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-text btn-edit"
                    (click)="editar(sitio)"
                    pTooltip="Editar sitio"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-text btn-delete"
                    (click)="eliminar(sitio)"
                    pTooltip="Eliminar sitio"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="empty-message">
                <i class="pi pi-map-marker"></i>
                <p>No se encontraron sitios registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="esNuevo ? '✨ Registrar Nuevo Sitio' : '📝 Editar Ubicación'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nombre">Nombre de la Ubicación *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="sitio.nombre"
            placeholder="Ej: Bodega de Electrónica"
          />
        </div>
        
        <div class="form-field">
          <label for="tipo">Tipo de Ambiente *</label>
          <p-select
            id="tipo"
            [(ngModel)]="sitio.tipo"
            [options]="tipos"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione tipo"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Estado Operativo</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p-toggleSwitch [(ngModel)]="sitio.estado"></p-toggleSwitch>
            <span class="font-bold text-sm" [class.text-green-600]="sitio.estado" [class.text-red-600]="!sitio.estado">
               {{ sitio.estado ? 'SITIO ACTIVO' : 'SITIO INACTIVO' }}
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
          label="Guardar Ubicación"
          class="btn-primary"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `
})
export class SitiosComponent implements OnInit {
  private sitioService = inject(SitioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  sitios: Sitio[] = [];
  sitiosFiltrados: Sitio[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  sitio: Sitio = this.getNuevoSitio();
  tipos = [
    { label: 'Bodega', value: 'Bodega' },
    { label: 'Laboratorio', value: 'Laboratorio' },
    { label: 'Aula', value: 'Aula' },
    { label: 'Oficina', value: 'Oficina' },
    { label: 'Almacén', value: 'Almacén' },
  ];
  ngOnInit() {
    this.cargarSitios();
  }
  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.sitios = d;
        this.sitiosFiltrados = d;
      },
      error: () => {
        this.sitios = [];
        this.sitiosFiltrados = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.sitiosFiltrados = this.sitios.filter(
      (s) => s.nombre?.toLowerCase().includes(f) || s.tipo?.toLowerCase().includes(f),
    );
  }
  getNuevoSitio(): Sitio {
    return { nombre: '', tipo: '', estado: true };
  }
  openNew() {
    this.esNuevo = true;
    this.sitio = this.getNuevoSitio();
    this.displayDialog = true;
  }
  editar(s: Sitio) {
    this.esNuevo = false;
    this.sitio = { ...s };
    this.displayDialog = true;
  }
  guardar() {
    if (!this.sitio.nombre || !this.sitio.tipo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.esNuevo) {
      this.sitioService
        .crearSitio({
          nombre: this.sitio.nombre,
          tipo: this.sitio.tipo,
          id_responsable: 1,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Sitio creado correctamente',
            });
            this.displayDialog = false;
            this.cargarSitios();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el sitio',
            });
          },
        });
    } else {
      this.sitioService.actualizarSitio(this.sitio.id!, this.sitio).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sitio actualizado correctamente',
          });
          this.displayDialog = false;
          this.cargarSitios();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el sitio',
          });
        },
      });
    }
  }
  eliminar(s: Sitio) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el sitio ' + s.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.sitioService.eliminarSitio(s.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Sitio eliminado correctamente',
            });
            this.cargarSitios();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el sitio',
            });
          },
        });
      },
    });
  }
  getTipoSeverity(tipo: string): 'warn' | 'info' | 'success' | 'secondary' {
    const map: any = {
      Bodega: 'warn',
      Laboratorio: 'info',
      Aula: 'success',
      Oficina: 'secondary',
      Almacén: 'warn',
    };
    return map[tipo] || 'secondary';
  }
}
