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
import { ProgramaService } from '../../infrastructure/services/programa.service';
import { AreaService } from '../../infrastructure/services/area.service';

interface Programa {
  id_programa?: number;
  codigo: string;
  nombre: string;
  id_area?: number;
  area?: {
    id_area: number;
    nombre: string;
    sitio?: {
      id_sitio: number;
      nombre: string;
    };
  };
  estado?: boolean;
}

@Component({
  selector: 'app-programas',
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
          <i class="pi pi-book"></i> Programas de Formación
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar programa..." class="search-input" />
          </div>
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="programasFiltrados"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th style="width:120px">Código</th>
              <th>Nombre del Programa</th>
              <th>Área</th>
              <th>Sede</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-programa>
            <tr>
              <td><span class="id-badge">#{{ programa.id_programa }}</span></td>
              <td><span class="font-mono text-sm font-semibold text-slate-700">{{ programa.codigo }}</span></td>
              <td><span class="nombre-cell">{{ programa.nombre }}</span></td>
              <td><span class="text-slate-600 text-sm font-semibold">{{ programa.area?.nombre || 'Sin área' }}</span></td>
              <td><span class="text-slate-500 text-xs">{{ programa.area?.sede?.nombre || 'Sin sede' }}</span></td>
              <td>
                <p-tag
                  [value]="programa.estado !== false ? 'ACTIVO' : 'INACTIVO'"
                  [severity]="programa.estado !== false ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(programa)"
                    pTooltip="Editar programa"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(programa)"
                    pTooltip="Eliminar programa"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">
                <i class="pi pi-book"></i>
                <p>No se encontraron programas de formación registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [dismissableMask]="true"
      [header]="esNuevo ? 'Registrar Nuevo Programa' : '📝 Editar Programa'"
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
          <label for="codigo">Código del Programa *</label>
          <input
            pInputText
            id="codigo"
            [(ngModel)]="programa.codigo"
            placeholder="Ej: 228106"
          />
        </div>

        <div class="form-field">
          <label for="nombre">Nombre del Programa *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="programa.nombre"
            placeholder="Ej: Análisis y Desarrollo de Software (ADSO)"
          />
        </div>

        <div class="form-field">
          <label for="id_area">Área *</label>
          <p-select
            id="id_area"
            [(ngModel)]="programa.id_area"
            [options]="areas"
            optionLabel="nombre"
            optionValue="id_area"
            placeholder="Seleccione área"
            [filter]="true"
            filterBy="nombre"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label>Estado</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p-toggleSwitch [(ngModel)]="programa.estado"></p-toggleSwitch>
            <span class="font-bold text-sm" [class.text-green-600]="programa.estado !== false" [class.text-red-600]="programa.estado === false">
               {{ programa.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
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
          [label]="saving ? 'Guardando...' : 'Guardar Programa'"
          class="btn-guardar"
          (click)="guardar()"
          [disabled]="saving"
        ></button>
      </div>
    </p-dialog>
  `
})
export class ProgramasComponent implements OnInit {
  private programaService = inject(ProgramaService);
  private areaService = inject(AreaService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  programas: Programa[] = [];
  programasFiltrados: Programa[] = [];
  areas: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  programa: Programa = this.getNuevoPrograma();

  ngOnInit() {
    this.cargarProgramas();
    this.cargarAreas();
  }

  cargarProgramas() {
    this.programaService.getProgramas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        setTimeout(() => {
          this.programas = d;
          this.programasFiltrados = d;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.programas = [];
          this.programasFiltrados = [];
          this.cdr.detectChanges();
        });
      },
    });
  }

  cargarAreas() {
    this.areaService.getAreas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        setTimeout(() => {
          this.areas = d;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.areas = [];
          this.cdr.detectChanges();
        });
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.programasFiltrados = this.programas.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(f) ||
        p.codigo?.toLowerCase().includes(f) ||
        p.area?.nombre?.toLowerCase().includes(f) ||
        p.area?.sitio?.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevoPrograma(): Programa {
    return { codigo: '', nombre: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.programa = this.getNuevoPrograma();
    this.displayDialog = true;
  }

  editar(p: Programa) {
    this.esNuevo = false;
    this.programa = { ...p };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.programa.codigo || !this.programa.nombre || !this.programa.id_area) {
      this.notification.add({
        module: 'Programas',
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Código, Nombre y Área son requeridos',
      });
      return;
    }

    const payload = {
      codigo: this.programa.codigo,
      nombre: this.programa.nombre,
      id_area: this.programa.id_area,
      estado: this.programa.estado !== false,
    };

    this.saving = true;

    if (this.esNuevo) {
      this.programaService.crearPrograma(payload).subscribe({
        next: () => {
          this.notification.add({
            module: 'Programas',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Programa creado correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarProgramas();
        },
        error: () => {
          this.saving = false;
          this.notification.add({
            module: 'Programas',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el programa (el código debe ser único)',
          });
        },
      });
    } else {
      this.programaService.actualizarPrograma(this.programa.id_programa!, payload).subscribe({
        next: () => {
          this.notification.add({
            module: 'Programas',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Programa actualizado correctamente',
          });
          this.displayDialog = false;
          this.saving = false;
          this.cargarProgramas();
        },
        error: () => {
          this.saving = false;
          this.notification.add({
            module: 'Programas',
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el programa',
          });
        },
      });
    }
  }

  eliminar(p: Programa) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el programa ' + p.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.programaService.eliminarPrograma(p.id_programa!).subscribe({
          next: () => {
            this.notification.add({
              module: 'Programas',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Programa eliminado correctamente',
            });
            this.cargarProgramas();
          },
          error: () => {
            this.notification.add({
              module: 'Programas',
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el programa (puede tener dependencias)',
            });
          },
        });
      },
    });
  }
}
