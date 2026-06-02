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
import { MessageService, ConfirmationService } from 'primeng/api';
import { AreaService } from '../../infrastructure/services/area.service';
import { Area } from '../../domain/models/area.model';

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
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-clone"></i> Áreas de Formación
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar área..."
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
            Nueva Área
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
            <i class="pi pi-clone text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Registrar Nueva Área' : 'Editar Área' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el área de formación</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Nombre del Área -->
            <div class="form-field">
              <input
                pInputText
                id="a-nombre"
                [(ngModel)]="area.nombre"
                placeholder="Ej: Teleinformática y Tecnología"
              />
              <label for="a-nombre">Nombre del Área *</label>
            </div>

            <!-- Estado Switch -->
            <div class="form-field">
              <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 h-[46px]">
                <p-toggleSwitch [(ngModel)]="area.estado"></p-toggleSwitch>
                <span class="font-bold text-sm"
                  [class.text-green-600]="area.estado !== false"
                  [class.text-red-600]="area.estado === false">
                  {{ area.estado !== false ? 'ACTIVA' : 'INACTIVA' }}
                </span>
              </div>
              <label>Estado</label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button type="button" class="btn-cancelar" (click)="displayDialog = false">Cancelar</button>
            <button
              type="button"
              class="btn-guardar"
              (click)="guardar()"
              [disabled]="saving"
            >{{ saving ? 'Guardando...' : 'Guardar Área' }}</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="areasFiltradas"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre del Área</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-area>
            <tr>
              <td><span class="id-badge">#{{ area.id_area }}</span></td>
              <td><span class="nombre-cell">{{ area.nombre }}</span></td>
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
              <td colspan="4" class="empty-message">
                <i class="pi pi-clone"></i>
                <p>No se encontraron áreas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class AreasComponent implements OnInit {
  private areaService = inject(AreaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  areas: Area[] = [];
  areasFiltradas: Area[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  area: Area = this.getNuevo();

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.areaService.getAreas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.areas = d;
        this.areasFiltradas = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.areas = [];
        this.areasFiltradas = [];
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase().trim();
    this.areasFiltradas = this.areas.filter(a =>
      a.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevo(): Area {
    return { nombre: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.area = this.getNuevo();
    this.displayDialog = true;
  }

  editar(a: Area) {
    this.esNuevo = false;
    this.area = { ...a };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.area.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El nombre del área es requerido' });
      return;
    }

    const payload = {
      nombre: this.area.nombre.trim(),
      estado: this.area.estado !== false
    };

    this.saving = true;

    if (this.esNuevo) {
      this.areaService.crearArea(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Área creada correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: (err: any) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'No se pudo crear el área. Verifique que no exista.'
          });
        }
      });
    } else {
      this.areaService.actualizarArea(this.area.id_area!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Área actualizada correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: (err: any) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'No se pudo actualizar el área'
          });
        }
      });
    }
  }

  eliminar(a: Area) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el área "${a.nombre}"? Esto podría eliminar los programas asociados.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.areaService.eliminarArea(a.id_area!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Área eliminada correctamente' });
            this.cargar();
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'No se pudo eliminar el área'
            });
          }
        });
      }
    });
  }
}
