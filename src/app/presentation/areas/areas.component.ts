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
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { AreaService } from '../../infrastructure/services/area.service';
import { SedeService } from '../../infrastructure/services/sede.service';

interface Area {
  id_area?: number;
  nombre: string;
  id_sede?: number;
  sede?: {
    id_sede: number;
    nombre: string;
    centro?: {
      id_centro: number;
      nombre: string;
    };
  };
  estado?: boolean;
}

@Component({
  selector: 'app-areas',
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
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-folder"></i> Áreas
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar área..." class="search-input" />
          </div>
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="areasFiltrados"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre del Área</th>
              <th>Sede</th>
              <th>Centro</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-area>
            <tr>
              <td><span class="id-badge">#{{ area.id_area }}</span></td>
              <td><span class="nombre-cell">{{ area.nombre }}</span></td>
              <td><span class="text-slate-600 text-sm font-semibold">{{ area.sede?.nombre || 'Sin sede' }}</span></td>
              <td>
                <div class="flex items-center gap-1.5">
                  <i class="pi pi-map text-slate-500 text-base"></i>
                  <span class="text-slate-500 text-xs font-semibold">{{ area.sede?.centro?.nombre || 'Sin centro' }}</span>
                </div>
              </td>
              <td>
                <p-tag
                  [value]="area.estado !== false ? 'ACTIVO' : 'INACTIVO'"
                  [severity]="area.estado !== false ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(area)"
                    pTooltip="Editar área"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(area)"
                    pTooltip="Eliminar área"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-folder"></i>
                <p>No se encontraron áreas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [dismissableMask]="true"
      [header]="esNuevo ? '✨ Registrar Nueva Área' : '📝 Editar Área'"
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
          <label for="nombre">Nombre del Área *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="area.nombre"
            placeholder="Ej: Sistemas / Electrónica"
          />
        </div>

        <div class="form-field">
          <label for="id_sede">Sede (Ubicación) *</label>
          <p-select
            id="id_sede"
            [(ngModel)]="area.id_sede"
            [options]="sedes"
            optionLabel="nombre"
            optionValue="id_sede"
            placeholder="Seleccione sede"
            [filter]="true"
            filterBy="nombre"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Estado</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p-toggleSwitch [(ngModel)]="area.estado"></p-toggleSwitch>
            <span class="font-bold text-sm" [class.text-green-600]="area.estado !== false" [class.text-red-600]="area.estado === false">
               {{ area.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
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
          [label]="saving ? 'Guardando...' : 'Guardar Área'"
          class="btn-guardar"
          (click)="guardar()"
          [disabled]="saving"
        ></button>
      </div>
    </p-dialog>
  `
})
export class AreasComponent implements OnInit {
  private areaService = inject(AreaService);
  private sedeService = inject(SedeService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  areas: Area[] = [];
  areasFiltrados: Area[] = [];
  sedes: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  area: Area = this.getNuevoArea();

  ngOnInit() {
    this.cargarAreas();
    this.cargarSedes();
  }

  cargarAreas() {
    this.areaService.getAreas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.areas = d;
        this.areasFiltrados = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.areas = [];
        this.areasFiltrados = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  cargarSedes() {
    this.sedeService.getSedes().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.sedes = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.sedes = [];
        setTimeout(() => this.cdr.detectChanges());
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.areasFiltrados = this.areas.filter(
      (a) =>
        a.nombre?.toLowerCase().includes(f) ||
        a.sede?.nombre?.toLowerCase().includes(f) ||
        a.sede?.centro?.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevoArea(): Area {
    return { nombre: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.area = this.getNuevoArea();
    this.displayDialog = true;
  }

  editar(a: Area) {
    this.esNuevo = false;
    this.area = { ...a };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.area.nombre || !this.area.id_sede) {
      this.notification.add({
        module: 'Áreas',
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Nombre del área y Sede son requeridos',
      });
      return;
    }

    const payload = {
      nombre: this.area.nombre,
      id_sede: Number(this.area.id_sede),
      estado: this.area.estado !== false,
    };

    this.saving = true;

    if (this.esNuevo) {
      this.areaService.crearArea(payload).subscribe({
        next: () => {
          this.notification.add({
            module: 'Áreas',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Área creada correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarAreas();
        },
        error: () => {
          this.saving = false;
          this.notification.add({
            module: 'Áreas',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el área',
          });
        },
      });
    } else {
      this.areaService.actualizarArea(this.area.id_area!, payload).subscribe({
        next: () => {
          this.notification.add({
            module: 'Áreas',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Área actualizada correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarAreas();
        },
        error: () => {
          this.saving = false;
          this.notification.add({
            module: 'Áreas',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el área',
          });
        },
      });
    }
  }

  eliminar(a: Area) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el área ' + a.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.areaService.eliminarArea(a.id_area!).subscribe({
          next: () => {
            this.notification.add({
              module: 'Áreas',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Área eliminada correctamente',
            });
            this.cargarAreas();
          },
          error: () => {
            this.notification.add({
              module: 'Áreas',
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el área (puede tener dependencias)',
            });
          },
        });
      },
    });
  }
}
