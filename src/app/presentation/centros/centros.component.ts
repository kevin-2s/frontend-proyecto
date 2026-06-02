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
import { CentroService } from '../../infrastructure/services/centro.service';
import { Centro } from '../../domain/models/centro.model';

@Component({
  selector: 'app-centros',
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
          <i class="pi pi-briefcase"></i> Centros de Formación
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar centro..."
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
            Nuevo Centro
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
            <i class="pi pi-briefcase text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Registrar Centro de Formación' : 'Editar Centro de Formación' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el centro de formación en el sistema</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Código del Centro -->
            <div class="form-field">
              <input pInputText id="c-codigo" [(ngModel)]="centro.codigo" placeholder="Ej: 9201" />
              <label for="c-codigo">Código del Centro *</label>
            </div>

            <!-- Nombre del Centro -->
            <div class="form-field">
              <input pInputText id="c-nombre" [(ngModel)]="centro.nombre" placeholder="Ej: Centro de Electricidad y Electrónica" />
              <label for="c-nombre">Nombre del Centro *</label>
            </div>

            <!-- Regional -->
            <div class="form-field">
              <input pInputText id="c-regional" [(ngModel)]="centro.regional" placeholder="Ej: Distrito Capital" />
              <label for="c-regional">Regional *</label>
            </div>

            <!-- Estado Switch -->
            <div class="form-field">
              <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 h-[46px]">
                <p-toggleSwitch [(ngModel)]="centro.estado"></p-toggleSwitch>
                <span class="font-bold text-sm"
                  [class.text-green-600]="centro.estado !== false"
                  [class.text-red-600]="centro.estado === false">
                  {{ centro.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
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
            >{{ saving ? 'Guardando...' : 'Guardar Centro' }}</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="centrosFiltrados"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Código</th>
              <th>Nombre del Centro</th>
              <th>Regional</th>
              <th style="width:120px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-centro>
            <tr>
              <td><span class="id-badge">#{{ centro.id_centro }}</span></td>
              <td><span class="font-bold text-slate-800 text-sm">{{ centro.codigo }}</span></td>
              <td><span class="nombre-cell">{{ centro.nombre }}</span></td>
              <td><span class="text-slate-600 text-sm">{{ centro.regional }}</span></td>
              <td>
                <p-tag
                  [value]="centro.estado !== false ? 'ACTIVO' : 'INACTIVO'"
                  [severity]="centro.estado !== false ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(centro)"
                    pTooltip="Editar centro"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(centro)"
                    pTooltip="Eliminar centro"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-briefcase"></i>
                <p>No se encontraron centros de formación registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

  `
})
export class CentrosComponent implements OnInit {
  private centroService = inject(CentroService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  centros: Centro[] = [];
  centrosFiltrados: Centro[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  centro: Centro = this.getNuevo();

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.centroService.getCentros().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.centros = d;
        this.centrosFiltrados = d;
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.centros = [];
        this.centrosFiltrados = [];
        setTimeout(() => this.cdr.detectChanges());
      }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.centrosFiltrados = this.centros.filter(c =>
      c.nombre?.toLowerCase().includes(f) ||
      c.codigo?.toLowerCase().includes(f) ||
      c.regional?.toLowerCase().includes(f)
    );
  }

  getNuevo(): Centro {
    return { nombre: '', codigo: '', regional: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.centro = this.getNuevo();
    this.displayDialog = true;
  }

  editar(c: Centro) {
    this.esNuevo = false;
    this.centro = { ...c };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.centro.nombre || !this.centro.codigo || !this.centro.regional) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos (*) son requeridos' });
      return;
    }

    const payload = {
      nombre: this.centro.nombre.trim(),
      codigo: this.centro.codigo.trim(),
      regional: this.centro.regional.trim(),
      estado: this.centro.estado !== false
    };

    this.saving = true;

    if (this.esNuevo) {
      this.centroService.crearCentro(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Centro creado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el centro' });
        }
      });
    } else {
      this.centroService.actualizarCentro(this.centro.id_centro!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Centro actualizado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargar();
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el centro' });
        }
      });
    }
  }

  eliminar(c: Centro) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el centro "${c.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.centroService.eliminarCentro(c.id_centro!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Centro eliminado correctamente' });
            this.cargar();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el centro' });
          }
        });
      }
    });
  }
}
