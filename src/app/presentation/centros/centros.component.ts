import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { CentroService } from '../../infrastructure/services/centro.service';

interface Centro {
  id_centro?: number;
  nombre: string;
  codigo?: string;
  regional?: string;
}

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
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title flex items-center gap-2">
          <i class="pi pi-map text-2xl text-[#39A900] inline-block flex-shrink-0"></i>
          Centros
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar centro..." class="search-input" />
          </div>
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="centrosFiltrados"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th style="width:120px">Código</th>
              <th>Nombre del Centro</th>
              <th>Regional</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-centro>
            <tr>
              <td><span class="id-badge">#{{ centro.id_centro }}</span></td>
              <td><span class="font-mono text-sm font-semibold text-slate-700">{{ centro.codigo }}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-map text-slate-500 text-base"></i>
                  <span class="nombre-cell font-semibold">{{ centro.nombre }}</span>
                </div>
              </td>
              <td><span class="text-slate-600 text-sm">{{ centro.regional }}</span></td>
              <td>
                <div class="action-buttons justify-center">
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
              <td colspan="3" class="empty-message">
                <i class="pi pi-home"></i>
                <p>No se encontraron centros registrados</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [dismissableMask]="true"
      header="✨ Registrar Nuevo Centro"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '550px' }"
      [draggable]="true"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <div class="form-grid mt-2 flex flex-col gap-4">
        <div class="form-field">
          <label for="nombre">Nombre del Centro *</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="centro.nombre"
            placeholder="Ej: Centro De Gestion Y Desarrollo Sostenible Sur Colombiano"
            class="w-full"
          />
        </div>
        <div class="form-field">
          <label for="codigo">Código del Centro *</label>
          <input
            pInputText
            id="codigo"
            [(ngModel)]="centro.codigo"
            placeholder="Ej: 9201"
            class="w-full"
          />
        </div>
        <div class="form-field">
          <label for="regional">Regional *</label>
          <input
            pInputText
            id="regional"
            [(ngModel)]="centro.regional"
            placeholder="Ej: Distrito Capital"
            class="w-full"
          />
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
          [label]="saving ? 'Guardando...' : 'Guardar Centro'"
          class="btn-guardar"
          (click)="guardar()"
          [disabled]="saving"
        ></button>
      </div>
    </p-dialog>
  `
})
export class CentrosComponent implements OnInit {
  private centroService = inject(CentroService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);

  centros: Centro[] = [];
  centrosFiltrados: Centro[] = [];
  filtro = '';
  displayDialog = false;
  saving = false;
  centro: Centro = this.getNuevoCentro();


  ngOnInit() {
    this.cargarCentros();
  }

  cargarCentros() {
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
      },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.centrosFiltrados = this.centros.filter(
      (c) => c.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevoCentro(): Centro {
    return { nombre: '', codigo: '', regional: '' };
  }

  openNew() {
    this.centro = this.getNuevoCentro();
    this.displayDialog = true;
  }

  guardar() {
    if (!this.centro.nombre || !this.centro.codigo || !this.centro.regional) {
      this.notification.add({
        module: 'Centros',
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos (*) son requeridos',
      });
      return;
    }

    const payload = {
      nombre: this.centro.nombre,
      codigo: this.centro.codigo,
      regional: this.centro.regional,
      estado: true,
    };

    this.saving = true;

    this.centroService.crearCentro(payload).subscribe({
      next: () => {
        this.notification.add({
          module: 'Centros',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Centro registrado correctamente',
        });
        this.displayDialog = false;
        this.saving = false;
        this.cargarCentros();
      },
      error: () => {
        this.saving = false;
        this.notification.add({
          module: 'Centros',
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar el centro',
        });
      },
    });
  }

  eliminar(c: Centro) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el centro ' + c.nombre + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.centroService.eliminarCentro(c.id_centro!).subscribe({
          next: () => {
            this.notification.add({
              module: 'Centros',
              severity: 'success',
              summary: 'Éxito',
              detail: 'Centro eliminado correctamente',
            });
            this.cargarCentros();
          },
          error: () => {
            this.notification.add({
              module: 'Centros',
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el centro (puede tener dependencias)',
            });
          },
        });
      },
    });
  }
}
