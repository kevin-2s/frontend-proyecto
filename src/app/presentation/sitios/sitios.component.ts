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
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { CentroService } from '../../infrastructure/services/centro.service';

interface Sitio {
  id_sitio?: number;
  nombre: string;
  id_centro?: number;
  centro?: {
    id_centro: number;
    nombre: string;
  };
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
    TooltipModule,
    SelectModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-map-marker"></i> Sedes
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar sede..." class="search-input" />
          </div>
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="sitiosFiltrados"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre de la Sede</th>
              <th>Centro</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sitio>
            <tr>
              <td><span class="id-badge">#{{ sitio.id_sitio }}</span></td>
              <td><span class="nombre-cell">{{ sitio.nombre }}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-map text-slate-500 text-base"></i>
                  <span class="text-slate-600 text-sm font-semibold">{{ sitio.centro?.nombre || 'Sin centro' }}</span>
                </div>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(sitio)"
                    pTooltip="Eliminar sede"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-message">
                <i class="pi pi-map-marker"></i>
                <p>No se encontraron sedes registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [dismissableMask]="true"
      header="✨ Registrar Nueva Sede"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '550px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nombre">Nombre de la Sede *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="sitio.nombre"
            placeholder="Ej: Comercios y Servicios / Yamboro"
          />
        </div>

        <div class="form-field">
          <label for="id_centro">Centro *</label>
          <p-select
            id="id_centro"
            [(ngModel)]="sitio.id_centro"
            [options]="centros"
            optionLabel="nombre"
            optionValue="id_centro"
            placeholder="Seleccione centro"
            [filter]="true"
            filterBy="nombre"
            styleClass="w-full"
            appendTo="body"
          >
            <ng-template let-dep pTemplate="selectedItem">
              <div class="flex items-center gap-2">
                <i class="pi pi-map text-slate-600 text-base"></i>
                <span class="font-semibold text-sm">{{ dep.nombre }}</span>
              </div>
            </ng-template>
            <ng-template let-dep pTemplate="item">
              <div class="flex items-center gap-2">
                <i class="pi pi-map text-slate-500 text-base"></i>
                <span class="text-sm">{{ dep.nombre }}</span>
              </div>
            </ng-template>
          </p-select>
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
          [label]="saving ? 'Guardando...' : 'Guardar Sede'"
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
  private centroService = inject(CentroService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  sitios: Sitio[] = [];
  sitiosFiltrados: Sitio[] = [];
  centros: any[] = [];
  filtro = '';
  displayDialog = false;
  saving = false;
  sitio: Sitio = this.getNuevoSitio();

  ngOnInit() {
    this.cargarSitios();
    this.cargarCentros();
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

  cargarCentros() {
    this.centroService.getCentros().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.centros = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.centros = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.sitiosFiltrados = this.sitios.filter(
      (s) =>
        s.nombre?.toLowerCase().includes(f) ||
        s.centro?.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevoSitio(): Sitio {
    return { nombre: '' };
  }

  openNew() {
    this.sitio = this.getNuevoSitio();
    this.displayDialog = true;
  }

  guardar() {
    if (!this.sitio.nombre || !this.sitio.id_centro) {
      this.notification.add({ module: 'Sedes',
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Nombre y Centro son requeridos',
      });
      return;
    }

    const payload: any = {
      nombre: this.sitio.nombre,
      tipo: 'Sede',
      id_centro: this.sitio.id_centro,
      estado: true,
      id_responsable: null
    };

    this.saving = true;

    this.sitioService.crearSitio(payload).subscribe({
      next: () => {
        this.notification.add({ module: 'Sedes',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sede creada correctamente',
        });
        this.displayDialog = false;
        this.saving = false;
        this.cargarSitios();
      },
      error: () => {
        this.saving = false;
        this.notification.add({ module: 'Sedes',
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la sede',
        });
      },
    });
  }

  eliminar(s: Sitio) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la sede ' + s.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.sitioService.eliminarSitio(s.id_sitio!).subscribe({
          next: () => {
            this.notification.add({ module: 'Sedes',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Sede de formación eliminada correctamente',
            });
            this.cargarSitios();
          },
          error: () => {
            this.notification.add({ module: 'Sedes',
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la sede (puede tener dependencias)',
            });
          },
        });
      },
    });
  }
}
