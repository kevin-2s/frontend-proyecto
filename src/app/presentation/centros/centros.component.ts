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
import { SelectModule } from 'primeng/select';
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
    SelectModule,
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
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(centro)"
                    pTooltip="Editar centro"
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
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '90vw', maxWidth: '550px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200 rounded-2xl"
      maskStyleClass="transparent-mask"
      appendTo="body"
    >
      <ng-template pTemplate="header">
        <div class="flex flex-col mt-2 ml-2">
          <h2 class="text-2xl font-bold text-slate-800">{{ centro.id_centro ? 'Editar' : 'Nuevo' }} Centro de Formación</h2>
          <p class="text-sm text-slate-500 mt-1.5">Completa la ubicación y los datos del centro.</p>
        </div>
      </ng-template>

      <div class="flex flex-col gap-6 pt-2 pb-4 px-2">
        <!-- Ubicación section -->
        <div>
          <span class="text-[12px] font-bold text-slate-500 tracking-wider uppercase mb-3 block">Ubicación</span>
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="form-field flex-1">
              <label class="text-sm font-semibold text-slate-700 mb-1.5 block">Departamento <span class="text-red-500">*</span></label>
              <p-select 
                [options]="departamentos"
                [(ngModel)]="centro.regional"
                (onChange)="onDepartamentoChange()"
                placeholder="Seleccionar..."
                [appendTo]="'body'"
                [style]="{'width':'100%'}"
                styleClass="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#00a650] focus:ring-1 focus:ring-[#00a650] transition-colors"
                [scrollHeight]="'250px'"
              ></p-select>
            </div>
            <div class="form-field flex-1">
              <label class="text-sm font-semibold text-slate-700 mb-1.5 block">Ciudad / Municipio <span class="text-red-500">*</span></label>
              <p-select 
                [options]="municipios"
                [(ngModel)]="municipioSeleccionado"
                [disabled]="!centro.regional"
                placeholder="Primero elige departamento"
                [appendTo]="'body'"
                [style]="{'width':'100%'}"
                styleClass="w-full bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-[#00a650] focus:ring-1 focus:ring-[#00a650] transition-colors"
              ></p-select>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Left side: Name -->
          <div class="form-field flex-[1.2]">
            <label class="text-sm font-semibold text-slate-700 mb-1.5 block">Nombre del Centro <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="centro.nombre"
              class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00a650] focus:ring-1 focus:ring-[#00a650]"
              placeholder="Ej: Centro de Formación..."
            />
          </div>

          <!-- Right side: Code and Button -->
          <div class="form-field flex-1 flex flex-col justify-between h-full">
            <div class="mb-4">
              <label class="text-sm font-semibold text-slate-700 mb-1.5 block">Código <span class="text-red-500">*</span></label>
              <input
                type="text"
                [(ngModel)]="centro.codigo"
                placeholder="Mín. 5 caracteres"
                class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#00a650] focus:ring-1 focus:ring-[#00a650]"
              />
            </div>
            
            <button
              class="w-full py-3 mt-auto rounded-lg font-bold text-white bg-[#00a650] hover:bg-[#008f45] transition-colors shadow-sm disabled:opacity-50"
              (click)="guardar()"
              [disabled]="saving"
            >
              {{ saving ? 'Guardando...' : (centro.id_centro ? 'Actualizar Centro' : 'Crear Centro') }}
            </button>
          </div>
        </div>
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

  municipioSeleccionado = '';
  departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 
    'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 
    'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 
    'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 
    'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 
    'Vaupés', 'Vichada'
  ];

  municipios: string[] = [];

  // Mapa de ciudades con presencia destacada del SENA por departamento
  ciudadesPorDepartamento: Record<string, string[]> = {
    'Amazonas': ['Leticia'],
    'Antioquia': ['Medellín', 'Bello', 'Rionegro', 'Apartadó', 'Caucasia', 'Itagüí', 'Caldas', 'Sabaneta', 'Puerto Berrío', 'Santa Fe de Antioquia'],
    'Arauca': ['Arauca'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga'],
    'Bolívar': ['Cartagena', 'Turbaco', 'El Carmen de Bolívar', 'Magangué'],
    'Boyacá': ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Puerto Boyacá'],
    'Caldas': ['Manizales', 'Chinchiná', 'La Dorada', 'Riosucio'],
    'Caquetá': ['Florencia'],
    'Casanare': ['Yopal', 'Paz de Ariporo'],
    'Cauca': ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'],
    'Cesar': ['Valledupar', 'Aguachica', 'Bosconia'],
    'Chocó': ['Quibdó', 'Istmina'],
    'Córdoba': ['Montería', 'Lorica', 'Sahagún'],
    'Cundinamarca': ['Bogotá', 'Soacha', 'Girardot', 'Facatativá', 'Fusagasugá', 'Mosquera', 'Chía', 'Villeta'],
    'Guainía': ['Inírida'],
    'Guaviare': ['San José del Guaviare'],
    'Huila': ['Neiva', 'Pitalito', 'Garzón', 'La Plata'],
    'La Guajira': ['Riohacha', 'Maicao', 'Fonseca'],
    'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
    'Meta': ['Villavicencio', 'Acacías', 'Granada'],
    'Nariño': ['Pasto', 'Ipiales', 'Tumaco'],
    'Norte de Santander': ['Cúcuta', 'Ocaña', 'Pamplona'],
    'Putumayo': ['Mocoa', 'Puerto Asís'],
    'Quindío': ['Armenia', 'Calarcá'],
    'Risaralda': ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal'],
    'San Andrés y Providencia': ['San Andrés'],
    'Santander': ['Bucaramanga', 'Floridablanca', 'Barrancabermeja', 'Piedecuesta', 'San Gil', 'Málaga', 'Vélez'],
    'Sucre': ['Sincelejo', 'Corozal'],
    'Tolima': ['Ibagué', 'Espinal', 'Melgar', 'Honda'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Buga', 'Tuluá', 'Cartago', 'Yumbo', 'Jamundí'],
    'Vaupés': ['Mitú'],
    'Vichada': ['Puerto Carreño']
  };

  onDepartamentoChange() {
    this.municipioSeleccionado = '';
    if (this.centro.regional && this.ciudadesPorDepartamento[this.centro.regional]) {
      this.municipios = [...this.ciudadesPorDepartamento[this.centro.regional]].sort();
    } else {
      this.municipios = [];
    }
  }

  ngOnInit() {
    this.cargarCentros();
  }

  cargarCentros() {
    this.centroService.getCentros().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        setTimeout(() => {
          this.centros = d;
          this.centrosFiltrados = d;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        setTimeout(() => {
          this.centros = [];
          this.centrosFiltrados = [];
          this.cdr.detectChanges();
        });
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
    this.municipioSeleccionado = '';
    this.displayDialog = true;
  }

  editar(c: Centro) {
    this.centro = { ...c };
    this.municipioSeleccionado = ''; // O se podría cargar la ciudad si se guardara aparte
    this.onDepartamentoChange();
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

    if (this.centro.id_centro) {
      this.centroService.actualizarCentro(this.centro.id_centro, payload).subscribe({
        next: () => {
          this.notification.add({
            module: 'Centros',
            severity: 'success',
            summary: 'Éxito',
            detail: 'Centro actualizado correctamente',
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
            detail: 'No se pudo actualizar el centro',
          });
        },
      });
    } else {
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
  }

}
