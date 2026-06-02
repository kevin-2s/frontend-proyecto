import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { FichaService } from '../../infrastructure/services/ficha.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService } from '../../infrastructure/services/rol.service';
import { forkJoin } from 'rxjs';

interface Ficha {
  id_ficha?: number;
  numero_ficha: string;
  programa: string;
  id_responsable?: number;
  responsable?: any;
}

@Component({
  selector: 'app-fichas',
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
    SelectModule,
    TooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    
    <div class="module-container">
      <div class="module-header">
        <div class="flex items-center gap-3">
          <i class="pi pi-id-card text-[#39A900] text-3xl"></i>
          <h3 class="page-title m-0">Fichas de Formación</h3>
        </div>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar ficha..." class="search-input" />
          </div>
          <button
            *ngIf="!displayDialog"
            type="button"
            class="btn-add"
            (click)="openNew()"
          >
            <i class="pi pi-plus"></i>
            Nueva Ficha
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
            <i class="pi pi-id-card text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">Registrar Nueva Ficha de Formación</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para la ficha de formación en el sistema</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <!-- Número de Ficha / Código -->
            <div class="form-field">
              <input
                pInputText
                id="f-numero"
                [(ngModel)]="ficha.numero_ficha"
                placeholder="Ej: 2711854"
              />
              <label for="f-numero">Número de Ficha / Código *</label>
            </div>

            <!-- Programa de Formación -->
            <div class="form-field">
              <input
                pInputText
                id="f-programa"
                [(ngModel)]="ficha.programa"
                placeholder="Ej: ADSO"
              />
              <label for="f-programa">Programa de Formación *</label>
            </div>

            <!-- Instructor Responsable -->
            <div class="form-field">
              <p-select
                id="f-responsable"
                [options]="instructores"
                [(ngModel)]="ficha.id_responsable"
                optionLabel="nombre"
                optionValue="id_usuario"
                placeholder=" "
                [filter]="true"
                filterBy="nombre"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
              <label for="f-responsable">Instructor Responsable</label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button type="button" class="btn-cancelar" (click)="displayDialog = false">Cancelar</button>
            <button
              type="button"
              class="btn-guardar"
              (click)="guardar()"
              [disabled]="saving"
            >{{ saving ? 'Guardando...' : 'Registrar Ficha' }}</button>
          </div>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="fichasFiltradas"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
          [loading]="loading"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:120px">ID</th>
              <th>Número de Ficha / Código</th>
              <th>Programa de Formación</th>
              <th>Instructor Responsable</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-ficha>
            <tr>
              <td><span class="id-badge">#{{ ficha.id_ficha }}</span></td>
              <td><span class="nombre-cell font-bold text-slate-800">{{ ficha.numero_ficha }}</span></td>
              <td><span class="correo-cell text-slate-600 font-medium">{{ ficha.programa }}</span></td>
              <td>
                <span class="flex items-center gap-1.5 text-slate-500">
                  <i class="pi pi-user text-slate-400 text-xs"></i>
                  {{ getResponsableNombre(ficha) }}
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="empty-message py-20 text-center">
                <i class="pi pi-id-card text-5xl text-slate-300 opacity-50 mb-3 block"></i>
                <p class="text-slate-400 font-bold text-lg">No se encontraron fichas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

  `
})
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  fichas: Ficha[] = [];
  fichasFiltradas: Ficha[] = [];
  instructores: any[] = [];
  filtro = '';
  displayDialog = false;
  saving = false;
  loading = false;
  ficha: Ficha = this.getNuevaFiscal();

  ngOnInit() {
    this.cargarFichas();
    this.cargarInstructores();
  }

  cargarFichas() {
    this.loading = true;
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.fichas = d;
        this.fichasFiltradas = d;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.fichas = [];
        this.fichasFiltradas = [];
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cargarInstructores() {
    forkJoin({
      roles: this.rolService.getAll(),
      usuarios: this.usuarioService.getAll()
    }).subscribe({
      next: ({ roles, usuarios }) => {
        const rolesData = Array.isArray(roles) ? roles : (roles as any).data || [];
        const usuariosData = Array.isArray(usuarios) ? usuarios : (usuarios as any).data || [];
        
        // Find instructor role
        const instructorRol = rolesData.find((r: any) => r.nombre?.toUpperCase().includes('INSTRUCT'));
        const instructorRolId = instructorRol ? instructorRol.id_rol : null;
        
        if (instructorRolId) {
          this.instructores = usuariosData.filter((u: any) => Number(u.id_rol) === Number(instructorRolId));
        } else {
          this.instructores = usuariosData;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.usuarioService.getAll().subscribe({
          next: (res: any) => {
            this.instructores = Array.isArray(res) ? res : res.data || [];
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  getResponsableNombre(ficha: any): string {
    return ficha.responsable?.nombre || 'Sin responsable';
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (fi) => 
        fi.numero_ficha?.toLowerCase().includes(f) || 
        fi.programa?.toLowerCase().includes(f) ||
        fi.responsable?.nombre?.toLowerCase().includes(f)
    );
  }

  getNuevaFiscal(): Ficha {
    return { numero_ficha: '', programa: '', id_responsable: undefined };
  }

  openNew() {
    this.ficha = this.getNuevaFiscal();
    this.displayDialog = true;
  }

  guardar() {
    if (!this.ficha.numero_ficha || !this.ficha.programa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'El número de ficha y el programa son requeridos',
      });
      return;
    }

    this.saving = true;
    const payload = {
      numero_ficha: this.ficha.numero_ficha,
      programa: this.ficha.programa,
      id_responsable: this.ficha.id_responsable ? Number(this.ficha.id_responsable) : undefined
    };

    this.fichaService.crearFiscal(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ficha creada correctamente',
        });
        this.saving = false;
        this.displayDialog = false;
        this.cargarFichas();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'No se pudo crear la ficha',
        });
      },
    });
  }
}
