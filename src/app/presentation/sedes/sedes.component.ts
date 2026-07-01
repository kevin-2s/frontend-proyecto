import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { SedeService } from '../../infrastructure/services/sede.service';
import { CentroService } from '../../infrastructure/services/centro.service';
import { Sede } from '../../domain/models/sede.model';
import { Centro } from '../../domain/models/centro.model';
import { UsuarioService } from '../../infrastructure/services/usuario.service';

@Component({
  selector: 'app-sedes',
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-map"></i> Sedes Físicas
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar sede..."
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
            Nueva Sede
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
            <i class="pi pi-map text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Registrar Nueva Sede' : 'Editar Sede' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para la sede en el sistema</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Nombre de la Sede -->
            <div class="form-field">
              <input
                pInputText
                id="s-nombre"
                [(ngModel)]="sede.nombre"
                placeholder="Ej: Sede Principal (Paloquemao)"
              />
              <label for="s-nombre">Nombre de la Sede *</label>
            </div>

            <!-- Dirección Física -->
            <div class="form-field">
              <input
                pInputText
                id="s-direccion"
                [(ngModel)]="sede.direccion"
                placeholder="Ej: Calle 15 No. 31-42"
              />
              <label for="s-direccion">Dirección Física *</label>
            </div>

            <!-- Centro de Formación -->
            <div class="form-field">
              <p-select
                id="s-centro"
                [(ngModel)]="sede.id_centro"
                [options]="centros"
                optionLabel="nombre"
                optionValue="id_centro"
                placeholder=" "
                [filter]="true"
                filterBy="nombre,codigo"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
              <label for="s-centro">Centro de Formación *</label>
            </div>

            <!-- Administrador de la Sede -->
            <div class="form-field">
              <p-select
                id="s-admin"
                [(ngModel)]="sede.id_administrador"
                [options]="administradores"
                optionLabel="nombreCompleto"
                optionValue="id_usuario"
                placeholder=" "
                [filter]="true"
                filterBy="nombreCompleto"
                styleClass="w-full"
                appendTo="body"
                emptyMessage="No hay administradores disponibles"
              ></p-select>
              <label for="s-admin">Administrador de la Sede *</label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button type="button" class="btn-cancelar" (click)="displayDialog = false">Cancelar</button>
            <button
              type="button"
              class="btn-guardar"
              (click)="guardar()"
              [disabled]="saving"
            >{{ saving ? 'Guardando...' : 'Guardar Sede' }}</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="sedesFiltradas"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Nombre de la Sede</th>
              <th>Dirección</th>
              <th>Centro de Formación</th>
              <th>Administrador</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sede>
            <tr>
              <td><span class="id-badge">#{{ sede.id_sede }}</span></td>
              <td><span class="nombre-cell">{{ sede.nombre }}</span></td>
              <td><span class="text-slate-600 text-sm">{{ sede.direccion }}</span></td>
              <td>
                <span class="text-slate-800 text-sm font-semibold">
                  {{ sede.centro?.nombre || 'Sin centro asociado' }}
                </span>
                <span *ngIf="sede.centro?.codigo" class="text-xs text-slate-400 block">
                  Cód: {{ sede.centro.codigo }}
                </span>
              </td>
              <td>
                <span class="text-slate-700 text-sm">
                  <i class="pi pi-user mr-1 text-[#39A900]"></i>
                  {{ sede.administrador?.nombre || 'No asignado' }}
                </span>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(sede)"
                    pTooltip="Editar sede"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="empty-message">
                <i class="pi pi-map"></i>
                <p>No se encontraron sedes físicas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

  `
})
export class SedesComponent implements OnInit {
  private sedeService = inject(SedeService);
  private centroService = inject(CentroService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private usuarioService = inject(UsuarioService);

  sedes: Sede[] = [];
  sedesFiltradas: Sede[] = [];
  centros: Centro[] = [];
  administradores: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  saving = false;
  sede: Sede = this.getNuevo();

  ngOnInit() {
    this.cargar();
    this.cargarCentros();
    this.cargarAdministradores();
  }

  cargar() {
    this.sedeService.getSedes().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.sedes = d;
        this.sedesFiltradas = d;
        this.cdr.markForCheck();
      },
      error: () => {
        this.sedes = [];
        this.sedesFiltradas = [];
        this.cdr.markForCheck();
      }
    });
  }

  cargarCentros() {
    this.centroService.getCentros().subscribe({
      next: (res: any) => {
        this.centros = res?.data || res || [];
        this.cdr.markForCheck();
      },
      error: () => { 
        this.centros = []; 
        this.cdr.markForCheck();
      }
    });
  }

  cargarAdministradores() {
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const users = res?.data || res || [];
        this.administradores = users.filter((u: any) => {
          const rol = u.rol?.nombreRol || u.rol?.nombre || '';
          return rol.toUpperCase() === 'ADMINISTRADOR';
        }).map((u: any) => {
          const nombre = u.nombre || u.nombres || '';
          const doc = u.documento || u.numero_documento || '';
          return {
            id_usuario: u.id_usuario || u.id,
            nombreCompleto: `${nombre} ${doc ? '- ' + doc : ''}`.trim()
          };
        });
        this.cdr.markForCheck();
      },
      error: () => { 
        this.administradores = []; 
        this.cdr.markForCheck();
      }
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.sedesFiltradas = this.sedes.filter(s =>
      s.nombre?.toLowerCase().includes(f) ||
      s.direccion?.toLowerCase().includes(f) ||
      s.centro?.nombre?.toLowerCase().includes(f) ||
      s.centro?.codigo?.toLowerCase().includes(f)
    );
  }

  getNuevo(): Sede {
    return { nombre: '', direccion: '', id_centro: null as any, id_administrador: null as any };
  }

  openNew() {
    this.esNuevo = true;
    this.sede = this.getNuevo();
    this.displayDialog = true;
  }

  editar(s: Sede) {
    this.esNuevo = false;
    this.sede = { ...s };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.sede.nombre || !this.sede.direccion || !this.sede.id_centro || !this.sede.id_administrador) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Todos los campos (*) son requeridos' });
      return;
    }

    const payload = {
      nombre: this.sede.nombre.trim(),
      direccion: this.sede.direccion.trim(),
      id_centro: Number(this.sede.id_centro),
      id_administrador: Number(this.sede.id_administrador)
    };

    this.saving = true;

    if (this.esNuevo) {
      this.sedeService.crearSede(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sede creada correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.cargar();
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la sede' });
        }
      });
    } else {
      this.sedeService.actualizarSede(this.sede.id_sede!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sede actualizada correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cdr.markForCheck();
          this.cargar();
        },
        error: () => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar la sede' });
        }
      });
    }
  }

}
