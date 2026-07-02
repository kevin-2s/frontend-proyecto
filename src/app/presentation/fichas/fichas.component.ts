import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { NotificationService } from '../../core/services/notification.service';
import { FichaService } from '../../infrastructure/services/ficha.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService } from '../../infrastructure/services/rol.service';
import { ProgramaService } from '../../infrastructure/services/programa.service';
import { AsignacionService } from '../../infrastructure/services/asignacion.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { forkJoin } from 'rxjs';

interface Ficha {
  id_ficha?: number;
  numero_ficha: string;
  id_programa?: number;
  programa?: {
    id_programa: number;
    nombre: string;
    codigo: string;
  };
  id_responsable?: number;
  responsable?: any;
  ambiente?: string;
  estado?: boolean;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast position="top-right"></p-toast>
    
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
          <button pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="fichasFiltradas"
          [paginator]="true"
          [rows]="15"
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
              <th>Ambiente</th>
              <th style="width:90px" class="text-center">Ítems</th>
              <th style="width:120px">Estado</th>
              <th style="width:130px">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-ficha>
            <tr>
              <td><span class="id-badge">#{{ ficha.id_ficha }}</span></td>
              <td><span class="nombre-cell font-bold text-slate-800">{{ ficha.numero_ficha }}</span></td>
              <td>
                <span class="correo-cell text-slate-600 font-medium">
                  {{ ficha.programa?.nombre || 'Sin programa' }}
                  <span class="text-xs font-mono text-slate-400" *ngIf="ficha.programa?.codigo">
                    ({{ ficha.programa?.codigo }})
                  </span>
                </span>
              </td>
              <td>
                <span class="flex items-center gap-1.5 text-slate-500">
                  <i class="pi pi-user text-slate-400 text-xs"></i>
                  {{ getResponsableNombre(ficha) }}
                </span>
              </td>
              <td>
                <span class="text-slate-600 font-medium">
                  {{ ficha.ambiente || 'Sin ambiente' }}
                </span>
              </td>
              <td class="text-center">
                <span *ngIf="contarItemsFicha(ficha.id_ficha) > 0"
                  style="display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;border-radius:20px;padding:2px 10px;font-size:12px;font-weight:700">
                  <i class="pi pi-box" style="font-size:11px"></i>
                  {{ contarItemsFicha(ficha.id_ficha) }}
                </span>
                <span *ngIf="contarItemsFicha(ficha.id_ficha) === 0"
                  style="color:#94a3b8;font-size:12px">—</span>
              </td>
              <td>
                <div class="flex items-center gap-2.5">
                  <label class="custom-switch" pTooltip="Cambiar estado" tooltipPosition="top">
                    <input
                      type="checkbox"
                      [checked]="ficha.estado !== false"
                      (change)="cambiarEstado(ficha)"
                    />
                    <span class="custom-switch-slider"></span>
                  </label>
                  <span class="font-bold text-xs" [class.text-green-600]="ficha.estado !== false" [class.text-red-600]="ficha.estado === false">
                    {{ ficha.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="action-buttons justify-center gap-2 flex">
                  <button
                    pButton type="button" icon="pi pi-eye"
                    class="btn-table-action btn-ver"
                    pTooltip="Ver asignaciones" tooltipPosition="top"
                    (click)="verAsignacionesFicha(ficha)">
                  </button>
                  <button
                    pButton type="button" icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    pTooltip="Editar ficha" tooltipPosition="top"
                    (click)="editarFicha(ficha)">
                  </button>
                  <button
                    pButton type="button" icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    pTooltip="Eliminar ficha" tooltipPosition="top"
                    (click)="eliminarFicha(ficha)">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-message py-20 text-center">
                <i class="pi pi-id-card text-5xl text-slate-300 opacity-50 mb-3 block"></i>
                <p class="text-slate-400 font-bold text-lg">No se encontraron fichas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Diálogo detalle de asignaciones de la ficha -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      [header]="'📋 Detalle de Ficha — ' + (fichaVista?.numero_ficha ?? '')"
      [(visible)]="displayAsignacionesDialog" [modal]="true"
      [style]="{ width: '95vw', maxWidth: '780px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">

      <!-- Selector de Pestañas (Tabs) -->
      <div class="flex gap-2 border-b border-slate-100 pb-3 mb-4">
        <button type="button" 
                class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer outline-none border-none"
                [class.bg-[#39A900]]="tabActiva === 'asignaciones'"
                [class.text-white]="tabActiva === 'asignaciones'"
                [class.bg-slate-100]="tabActiva !== 'asignaciones'"
                [class.text-slate-600]="tabActiva !== 'asignaciones'"
                (click)="tabActiva = 'asignaciones'">
          <i class="pi pi-box mr-1.5"></i> Materiales Asignados ({{ asignacionesDeFichaVista.length }})
        </button>
        <button type="button" 
                class="px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer outline-none border-none"
                [class.bg-[#39A900]]="tabActiva === 'aprendices'"
                [class.text-white]="tabActiva === 'aprendices'"
                [class.bg-slate-100]="tabActiva !== 'aprendices'"
                [class.text-slate-600]="tabActiva !== 'aprendices'"
                (click)="tabActiva = 'aprendices'">
          <i class="pi pi-users mr-1.5"></i> Aprendices Registrados ({{ aprendicesDeFichaVista.length }})
        </button>
      </div>

      <!-- Pestaña: Materiales Asignados -->
      <ng-container *ngIf="tabActiva === 'asignaciones'">
        <div *ngIf="asignacionesDeFichaVista.length === 0"
          style="text-align:center;padding:2.5rem 0;color:#94a3b8">
          <i class="pi pi-inbox" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
          <p style="font-weight:600">Esta ficha no tiene asignaciones registradas</p>
        </div>

        <p-table *ngIf="asignacionesDeFichaVista.length > 0"
          [value]="asignacionesDeFichaVista"
          [paginator]="asignacionesDeFichaVista.length > 10" [rows]="10"
          styleClass="modern-table" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:70px">ID</th>
              <th>Producto</th>
              <th style="width:90px" class="text-center">Cantidad</th>
              <th>Observación</th>
              <th style="width:110px" class="text-center">Estado</th>
              <th style="width:130px">Fecha</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr>
              <td><span class="id-badge">#{{ a.id_asignacion }}</span></td>
              <td>
                <span style="font-weight:600;color:#1e293b;font-size:13px">{{ a.producto?.nombre || '—' }}</span>
                <small *ngIf="a.producto?.SKU" style="display:block;font-family:monospace;color:#94a3b8;font-size:11px">
                  {{ a.producto.SKU }}
                </small>
              </td>
              <td class="text-center">
                <span style="font-weight:700;font-size:15px;color:#1d4ed8">{{ a.cantidad }}</span>
              </td>
              <td>
                <span style="font-size:12px;color:#64748b">{{ a.observacion || '—' }}</span>
              </td>
              <td class="text-center">
                <p-tag [value]="a.estado"
                  [severity]="getEstadoAsignacionSeverity(a.estado)"
                  styleClass="px-2 py-1 text-xs font-bold rounded-lg">
                </p-tag>
              </td>
              <td>
                <span style="font-size:12px;color:#64748b">
                  {{ a.fecha_asignacion ? (a.fecha_asignacion | date:'dd/MM/yyyy') : '—' }}
                </span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </ng-container>

      <!-- Pestaña: Aprendices Registrados -->
      <ng-container *ngIf="tabActiva === 'aprendices'">
        <div *ngIf="aprendicesDeFichaVista.length === 0"
          style="text-align:center;padding:2.5rem 0;color:#94a3b8">
          <i class="pi pi-users" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
          <p style="font-weight:600">No hay aprendices registrados en esta ficha</p>
        </div>

        <p-table *ngIf="aprendicesDeFichaVista.length > 0"
          [value]="aprendicesDeFichaVista"
          [paginator]="aprendicesDeFichaVista.length > 10" [rows]="10"
          styleClass="modern-table" [rowHover]="true">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:70px">ID</th>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Información de Contacto</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-ap>
            <tr>
              <td><span class="id-badge">#{{ ap.id_usuario }}</span></td>
              <td>
                <span style="font-weight:700;color:#1e293b;font-size:13px">{{ ap.nombre }} {{ ap.apellidos || '' }}</span>
              </td>
              <td>
                <span style="font-size:12px;color:#64748b;font-weight:600">{{ formatDocumento(ap.documento) }}</span>
              </td>
              <td>
                <div class="flex flex-col text-xs text-slate-500">
                  <span class="font-semibold text-slate-600">{{ ap.correo }}</span>
                  <small class="text-[10px] text-slate-400 font-bold" *ngIf="ap.telefono">Tel: {{ ap.telefono }}</small>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </ng-container>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cerrar" class="btn-cancelar" (click)="displayAsignacionesDialog = false"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Dialog para crear/editar ficha -->
    <p-dialog [dismissableMask]="true"
      [header]="esEditando ? '✏️ Editar Ficha de Formación' : '✨ Registrar Nueva Ficha de Formación'"
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
          <label for="numero_ficha">Número de Ficha / Código *</label>
          <input
            pInputText
            id="numero_ficha"
            [(ngModel)]="ficha.numero_ficha"
            placeholder="Ej: 2711854"
          />
        </div>
        
        <div class="form-field">
          <label for="id_programa">Programa de Formación *</label>
          <p-select
            id="id_programa"
            [options]="programas"
            [(ngModel)]="ficha.id_programa"
            optionLabel="nombre"
            optionValue="id_programa"
            placeholder="Selecciona un programa"
            [filter]="true"
            filterBy="nombre,codigo"
            styleClass="w-full"
            appendTo="body"
          >
            <ng-template let-prog pTemplate="item">
              <div class="flex flex-col">
                <span class="font-bold text-sm text-slate-800">{{ prog.nombre }}</span>
                <span class="text-xs text-slate-400 font-mono">{{ prog.codigo }}</span>
              </div>
            </ng-template>
          </p-select>
        </div>
        
        <div class="form-field">
          <label for="id_responsable">Instructor Responsable *</label>
          <p-select
            id="id_responsable"
            [options]="instructores"
            [(ngModel)]="ficha.id_responsable"
            optionLabel="nombre"
            optionValue="id_usuario"
            placeholder="Selecciona un responsable"
            [filter]="true"
            filterBy="nombre"
            styleClass="w-full"
            appendTo="body"
          ></p-select>
        </div>

        <div class="form-field">
          <label for="ambiente">Ambiente de Formación</label>
          <input
            pInputText
            id="ambiente"
            [(ngModel)]="ficha.ambiente"
            placeholder="Ej: 102"
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
          [label]="saving ? 'Guardando...' : (esEditando ? 'Actualizar Ficha' : 'Registrar Ficha')"
          class="btn-guardar"
          (click)="guardar()"
          [disabled]="saving"
        ></button>
      </div>
    </p-dialog>
  `
})
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private programaService = inject(ProgramaService);
  private asignacionService = inject(AsignacionService);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  fichas: Ficha[] = [];
  fichasFiltradas: Ficha[] = [];
  instructores: any[] = [];
  programas: any[] = [];
  todasLasAsignaciones: any[] = [];
  displayAsignacionesDialog = false;
  fichaVista: Ficha | null = null;
  asignacionesDeFichaVista: any[] = [];
  aprendicesDeFichaVista: any[] = [];
  tabActiva: 'asignaciones' | 'aprendices' = 'asignaciones';

  formatDocumento(doc: string | undefined): string {
    if (!doc) return '---';
    const docClean = doc.trim();
    const tipos = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.', 'CC', 'TI', 'CE', 'PEP', 'PPT', 'PAS'];
    for (const t of tipos) {
      if (docClean.toUpperCase().startsWith(t.toUpperCase())) {
        return docClean;
      }
    }
    return `C.C. ${docClean}`;
  }
  filtro = '';
  displayDialog = false;
  esEditando = false;
  fichaEditandoId: number | null = null;
  saving = false;
  loading = false;
  ficha: Ficha = this.getNuevaFiscal();

  ngOnInit() {
    this.cargarFichas();
    this.cargarInstructores();
    this.cargarProgramas();
    this.cargarAsignaciones();
  }

  cargarFichas() {
    this.loading = true;
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        let list = d.map((f: any) => ({ ...f, estado: f.estado !== false }));

        const role = this.authService.getUserRole()?.toUpperCase() || '';
        const currentUserId = Number(this.authService.getUserId());

        if (role === 'INSTRUCTOR') {
          // Filtrar para mostrar solo las fichas asignadas a este instructor
          list = list.filter((f: any) => Number(f.id_responsable) === currentUserId || Number(f.responsable?.id_usuario) === currentUserId);
        }

        this.fichas = list;
        this.fichasFiltradas = [...this.fichas];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.fichas = [];
        this.fichasFiltradas = [];
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  cargarInstructores() {
    const role = this.authService.getUserRole()?.toUpperCase();
    const isSedeAdmin = role === 'ADMINISTRADOR';
    const isSuperAdmin = role === 'SUPER ADMINISTRADOR';

    if (!isSedeAdmin && !isSuperAdmin) {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.instructores = [{
          id_usuario: currentUser.id_usuario || currentUser.id,
          nombre: currentUser.nombre,
          apellidos: currentUser.apellidos || ''
        }];
      } else {
        this.instructores = [];
      }
      this.cdr.markForCheck();
      return;
    }

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
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn('No se pudieron cargar los usuarios/roles:', err);
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.instructores = [{
            id_usuario: currentUser.id_usuario || currentUser.id,
            nombre: currentUser.nombre,
            apellidos: currentUser.apellidos || ''
          }];
        } else {
          this.instructores = [];
        }
        this.cdr.markForCheck();
      }
    });
  }

  cargarProgramas() {
    this.programaService.getProgramas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.programas = d;
        this.cdr.markForCheck();
      },
      error: () => {
        this.programas = [];
        this.cdr.markForCheck();
      },
    });
  }

  cargarAsignaciones() {
    this.asignacionService.getAsignaciones().subscribe({
      next: (res: any) => {
        this.todasLasAsignaciones = res?.data ?? res ?? [];
        this.cdr.markForCheck();
      },
      error: () => { this.todasLasAsignaciones = []; },
    });
  }

  contarItemsFicha(idFicha: number | undefined): number {
    if (!idFicha) return 0;
    return this.todasLasAsignaciones
      .filter(a => a.id_ficha === idFicha && a.estado?.toUpperCase() === 'ACTIVA')
      .reduce((sum: number, a: any) => sum + (a.cantidad ?? 0), 0);
  }

  verAsignacionesFicha(f: Ficha) {
    this.fichaVista = f;
    this.tabActiva = 'asignaciones';
    this.asignacionesDeFichaVista = this.todasLasAsignaciones
      .filter(a => a.id_ficha === f.id_ficha);
    
    // Obtener los aprendices pertenecientes a esta ficha
    this.aprendicesDeFichaVista = [];
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const usuarios = res?.data || res || [];
        this.aprendicesDeFichaVista = usuarios.filter((u: any) => 
          Number(u.id_ficha) === Number(f.id_ficha) && 
          (u.rolNombre?.toUpperCase().includes('APRENDIZ') || u.rol?.nombre?.toUpperCase().includes('APRENDIZ'))
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.aprendicesDeFichaVista = [];
        this.cdr.markForCheck();
      }
    });

    this.displayAsignacionesDialog = true;
  }

  getEstadoAsignacionSeverity(estado: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (estado?.toUpperCase() === 'ACTIVA') return 'success';
    if (estado?.toUpperCase() === 'ANULADA') return 'danger';
    return 'secondary';
  }

  getResponsableNombre(ficha: any): string {
    return ficha.responsable?.nombre || 'Sin responsable';
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (fi) => 
        fi.numero_ficha?.toLowerCase().includes(f) || 
        fi.programa?.nombre?.toLowerCase().includes(f) ||
        fi.programa?.codigo?.toLowerCase().includes(f) ||
        fi.responsable?.nombre?.toLowerCase().includes(f) ||
        fi.ambiente?.toLowerCase().includes(f)
    );
  }

  getNuevaFiscal(): Ficha {
    return { numero_ficha: '', id_programa: undefined, id_responsable: undefined, ambiente: '' };
  }

  openNew() {
    this.ficha = this.getNuevaFiscal();
    this.esEditando = false;
    this.fichaEditandoId = null;
    this.displayDialog = true;
  }

  editarFicha(f: Ficha) {
    this.ficha = {
      numero_ficha: f.numero_ficha,
      id_programa: f.id_programa ?? (f as any).programa?.id_programa,
      id_responsable: f.id_responsable ?? (f as any).responsable?.id_usuario,
      ambiente: f.ambiente ?? '',
    };
    this.esEditando = true;
    this.fichaEditandoId = f.id_ficha ?? null;
    this.displayDialog = true;
  }

  guardar() {
    if (!this.ficha.numero_ficha || !this.ficha.id_programa) {
      this.notification.add({ module: 'Fichas', severity: 'warn', summary: 'Advertencia', detail: 'El número de ficha y el programa son requeridos' });
      return;
    }
    if (!this.ficha.id_responsable) {
      this.notification.add({ module: 'Fichas', severity: 'warn', summary: 'Advertencia', detail: 'Debe seleccionar un instructor responsable' });
      return;
    }

    this.saving = true;
    const payload = {
      numero_ficha: this.ficha.numero_ficha,
      id_programa: Number(this.ficha.id_programa),
      id_responsable: Number(this.ficha.id_responsable),
      ...(this.ficha.ambiente ? { ambiente: this.ficha.ambiente } : {}),
    };

    const request$ = this.esEditando && this.fichaEditandoId
      ? this.fichaService.actualizarFiscal(this.fichaEditandoId, payload)
      : this.fichaService.crearFiscal(payload);

    request$.subscribe({
      next: () => {
        this.notification.add({ module: 'Fichas', severity: 'success', summary: 'Éxito', detail: this.esEditando ? 'Ficha actualizada correctamente' : 'Ficha creada correctamente' });
        this.saving = false;
        this.displayDialog = false;
        this.cargarFichas();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.saving = false;
        this.cdr.markForCheck();
        this.notification.add({ module: 'Fichas', severity: 'error', summary: 'Error', detail: err.error?.message || (this.esEditando ? 'No se pudo actualizar la ficha' : 'No se pudo crear la ficha') });
      },
    });
  }

  eliminarFicha(ficha: Ficha) {
    if (!ficha.id_ficha) {
      return;
    }

    const confirmado = window.confirm(`¿Está seguro de eliminar la ficha ${ficha.numero_ficha}?`);
    if (!confirmado) {
      return;
    }

    this.fichaService.eliminarFiscal(ficha.id_ficha).subscribe({
      next: () => {
        this.notification.add({ module: 'Fichas',
          severity: 'success',
          summary: 'Éxito',
          detail: 'Ficha eliminada correctamente',
        });
        this.cargarFichas();
      },
      error: () => {
        this.notification.add({ module: 'Fichas',
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la ficha',
        });
      },
    });
  }

  cambiarEstado(ficha: Ficha) {
    if (!ficha.id_ficha) return;
    const nuevoEstado = ficha.estado === false;
    const accion = nuevoEstado ? 'activada' : 'inactivada';
    
    this.fichaService.actualizarFiscal(ficha.id_ficha, { estado: nuevoEstado }).subscribe({
      next: () => {
        ficha.estado = nuevoEstado;
        this.notification.add({ 
          module: 'Fichas', 
          severity: 'success', 
          summary: 'Éxito', 
          detail: `Ficha ${accion} correctamente` 
        });
        this.cargarFichas();
      },
      error: () => {
        this.notification.add({ 
          module: 'Fichas', 
          severity: 'error', 
          summary: 'Error', 
          detail: `No se pudo cambiar el estado de la ficha` 
        });
        this.cargarFichas();
      }
    });
  }
}
