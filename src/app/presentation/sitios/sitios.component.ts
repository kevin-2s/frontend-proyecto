import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
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
import { UsuarioService } from '../../infrastructure/services/usuario.service';

interface Sitio {
  id_sitio?: number;
  nombre: string;
  tipo: string;
  id_responsable?: number;
  responsable?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
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
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-map-marker"></i> Sitios y Bodegas
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar sitio..." class="search-input" />
          </div>
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="sitiosFiltrados"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre del Sitio</th>
              <th>Responsable</th>
              <th>Tipo</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sitio>
            <tr>
              <td><span class="id-badge">#{{ sitio.id_sitio }}</span></td>
              <td><span class="nombre-cell">{{ sitio.nombre }}</span></td>
              <td><span class="text-slate-600 text-sm">{{ sitio.responsable?.nombre || 'Sin responsable' }}</span></td>
              <td>
                <p-tag 
                  [value]="sitio.tipo.toUpperCase()" 
                  [severity]="getTipoSeverity(sitio.tipo)"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="sitio.estado !== false ? 'DISPONIBLE' : 'INACTIVO'"
                  [severity]="sitio.estado !== false ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(sitio)"
                    pTooltip="Editar sitio"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(sitio)"
                    pTooltip="Eliminar sitio"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
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
      [style]="{ width: '90vw', maxWidth: '550px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
      maskStyleClass="backdrop-blur-sm bg-black/40"
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
          <label for="id_responsable">Responsable</label>
          <p-select
            id="id_responsable"
            [(ngModel)]="sitio.id_responsable"
            [options]="usuarios"
            optionLabel="nombre"
            optionValue="id_usuario"
            placeholder="Seleccione responsable"
            [filter]="true"
            filterBy="nombre,correo"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Estado Operativo</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p-toggleSwitch [(ngModel)]="sitio.estado"></p-toggleSwitch>
            <span class="font-bold text-sm" [class.text-green-600]="sitio.estado !== false" [class.text-red-600]="sitio.estado === false">
               {{ sitio.estado !== false ? 'SITIO ACTIVO' : 'SITIO INACTIVO' }}
            </span>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button
          pButton
          label="Cancelar"
          class="btn-cancelar"
          (click)="displayDialog = false"
        ></button>
        <button
          pButton
          [label]="saving ? 'Guardando...' : 'Guardar Ubicación'"
          class="btn-guardar"
          (click)="guardar()"
          [disabled]="saving"
        ></button>
      </div>
    </p-dialog>
  `
})
export class SitiosComponent implements OnInit {
  private sitioService = inject(SitioService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  sitios: Sitio[] = [];
  sitiosFiltrados: Sitio[] = [];
  usuarios: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
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
    this.cargarUsuarios();
  }

  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.sitios = d;
        this.sitiosFiltrados = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.sitios = [];
        this.sitiosFiltrados = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  cargarUsuarios() {
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.usuarios = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.usuarios = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.sitiosFiltrados = this.sitios.filter(
      (s) =>
        s.nombre?.toLowerCase().includes(f) ||
        s.tipo?.toLowerCase().includes(f) ||
        s.responsable?.nombre?.toLowerCase().includes(f),
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

    const payload: any = {
      nombre: this.sitio.nombre,
      tipo: this.sitio.tipo,
      estado: this.sitio.estado !== false,
    };
    if (this.sitio.id_responsable) payload.id_responsable = this.sitio.id_responsable;

    this.saving = true;

    if (this.esNuevo) {
      this.sitioService.crearSitio(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sitio creado correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarSitios();
        },
        error: () => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el sitio',
          });
        },
      });
    } else {
      this.sitioService.actualizarSitio(this.sitio.id_sitio!, payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sitio actualizado correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarSitios();
        },
        error: () => {
          this.saving = false;
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
        this.sitioService.eliminarSitio(s.id_sitio!).subscribe({
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