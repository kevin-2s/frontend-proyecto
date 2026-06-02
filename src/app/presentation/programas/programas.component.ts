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
import { ProgramaService } from '../../infrastructure/services/programa.service';
import { AreaService } from '../../infrastructure/services/area.service';
import { Programa } from '../../domain/models/programa.model';
import { Area } from '../../domain/models/area.model';

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
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-bookmark"></i> Programas de Formación
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar programa..."
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
            Nuevo Programa
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
            <i class="pi pi-bookmark text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Registrar Nuevo Programa' : 'Editar Programa' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el programa de formación</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Código del Programa -->
            <div class="form-field">
              <input
                pInputText
                id="p-codigo"
                [(ngModel)]="programa.codigo"
                placeholder="Ej: 228118"
              />
              <label for="p-codigo">Código del Programa *</label>
            </div>

            <!-- Nombre del Programa -->
            <div class="form-field">
              <input
                pInputText
                id="p-nombre"
                [(ngModel)]="programa.nombre"
                placeholder="Ej: Análisis y Desarrollo de Software"
              />
              <label for="p-nombre">Nombre del Programa *</label>
            </div>

            <!-- Área de Formación -->
            <div class="form-field">
              <p-select
                id="p-area"
                [(ngModel)]="programa.id_area"
                [options]="areas"
                optionLabel="nombre"
                optionValue="id_area"
                placeholder=" "
                [filter]="true"
                filterBy="nombre"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
              <label for="p-area">Área de Formación *</label>
            </div>

            <!-- Estado Switch -->
            <div class="form-field">
              <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 h-[46px]">
                <p-toggleSwitch [(ngModel)]="programa.estado"></p-toggleSwitch>
                <span class="font-bold text-sm"
                  [class.text-green-600]="programa.estado !== false"
                  [class.text-red-600]="programa.estado === false">
                  {{ programa.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
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
            >{{ saving ? 'Guardando...' : 'Guardar Programa' }}</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="programasFiltrados"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th style="width:120px">Código</th>
              <th>Nombre del Programa</th>
              <th>Área de Formación</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-programa>
            <tr>
              <td><span class="id-badge">#{{ programa.id_programa }}</span></td>
              <td><span class="font-bold text-slate-800">{{ programa.codigo }}</span></td>
              <td><span class="nombre-cell">{{ programa.nombre }}</span></td>
              <td>
                <span class="text-slate-800 text-sm font-semibold">
                  {{ programa.area?.nombre || 'Sin área asociada' }}
                </span>
              </td>
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
              <td colspan="6" class="empty-message">
                <i class="pi pi-bookmark"></i>
                <p>No se encontraron programas registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class ProgramasComponent implements OnInit {
  private programaService = inject(ProgramaService);
  private areaService = inject(AreaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  programas: Programa[] = [];
  programasFiltrados: Programa[] = [];
  areas: Area[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  programa: Programa = this.getNuevo();

  ngOnInit() {
    this.cargar();
    this.cargarAreas();
  }

  cargar() {
    this.programaService.getProgramas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.programas = d;
        this.programasFiltrados = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.programas = [];
        this.programasFiltrados = [];
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  cargarAreas() {
    this.areaService.getAreas().subscribe({
      next: (res: any) => {
        this.areas = res?.data || res || [];
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.areas = [];
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase().trim();
    this.programasFiltrados = this.programas.filter(p =>
      p.nombre?.toLowerCase().includes(f) ||
      p.codigo?.toLowerCase().includes(f) ||
      p.area?.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevo(): Programa {
    return { nombre: '', codigo: '', id_area: null as any, estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.programa = this.getNuevo();
    this.displayDialog = true;
  }

  editar(p: Programa) {
    this.esNuevo = false;
    this.programa = { ...p };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.programa.nombre.trim() || !this.programa.codigo.trim() || !this.programa.id_area) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos (*) son requeridos' });
      return;
    }

    const payload = {
      nombre: this.programa.nombre.trim(),
      codigo: this.programa.codigo.trim(),
      id_area: Number(this.programa.id_area),
      estado: this.programa.estado !== false
    };

    this.saving = true;

    if (this.esNuevo) {
      this.programaService.crearPrograma(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Programa creado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: (err: any) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'No se pudo crear el programa. Verifique que el código no exista.'
          });
        }
      });
    } else {
      this.programaService.actualizarPrograma(this.programa.id_programa!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Programa actualizado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: (err: any) => {
          this.saving = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || 'No se pudo actualizar el programa'
          });
        }
      });
    }
  }

  eliminar(p: Programa) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el programa "${p.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.programaService.eliminarPrograma(p.id_programa!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Programa eliminado correctamente' });
            this.cargar();
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message || 'No se pudo eliminar el programa'
            });
          }
        });
      }
    });
  }
}
