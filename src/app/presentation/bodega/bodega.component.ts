import { Component, OnInit, OnDestroy, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Subscription, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SedeService } from '../../infrastructure/services/sede.service';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ProductoService } from '../../infrastructure/services/producto.service';

interface Bodega {
  id_sitio?: number;
  nombre: string;
  tipo?: string;
  tipo_personalizado?: string | null;
  codigo_lugar?: string | null;
  id_responsable?: number | null;
  responsable?: { id_usuario: number; nombre?: string; correo: string };
  estado?: boolean;
}

@Component({
  selector: 'app-bodega',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule,
    TagModule, ToastModule, ConfirmDialogModule, TooltipModule, SelectModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title"><i class="pi pi-home"></i> Bodegas de Almacenamiento</h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar bodega o responsable..." class="search-input" />
          </div>
          <button *ngIf="esAdmin()" pButton label="Nueva Bodega" icon="pi pi-plus"
            class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="bodegasFiltradas" [paginator]="true" [rows]="15"
          [rowsPerPageOptions]="[5,15,20]" styleClass="modern-table" [rowHover]="true"
          dataKey="id_sitio">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th style="min-width:180px">Nombre de la Bodega</th>
              <th style="min-width:130px">Tipo de Lugar</th>
              <th style="min-width:180px">Responsable</th>
              <th style="width:90px" class="text-center">Ítems</th>
              <th style="min-width:100px" class="text-center">Estado</th>
              <th style="width:140px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-bodega>
            <tr>
              <td><span class="id-badge">#{{ bodega.id_sitio }}</span></td>
              <td>
                <div class="flex items-center gap-2">
                  <i class="pi pi-home text-indigo-500 text-base"></i>
                  <span class="nombre-cell font-semibold text-slate-700">{{ bodega.nombre }}</span>
                </div>
              </td>
              <td>
                <p-tag [value]="getTipoLabel(bodega)" severity="secondary"
                  styleClass="px-2 py-1 text-xs font-bold rounded-lg"></p-tag>
                <span *ngIf="bodega.codigo_lugar" class="block text-xs text-slate-400 font-mono mt-1">{{ bodega.codigo_lugar }}</span>
              </td>
              <td>
                <div *ngIf="bodega.responsable || bodega.id_responsable; else sinResponsable">
                  <span class="text-sm font-semibold text-slate-700">
                    {{ bodega.responsable?.nombre || getResponsableNombre(bodega.id_responsable) }}
                  </span>
                  <small class="block text-xs text-slate-400">{{ bodega.responsable?.correo || '' }}</small>
                </div>
                <ng-template #sinResponsable>
                  <span class="text-slate-400 text-sm">Sin responsable</span>
                </ng-template>
              </td>
              <td class="text-center">
                <span *ngIf="contarItemsBodega(bodega.id_sitio) > 0"
                  style="display:inline-flex;align-items:center;gap:4px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:20px;padding:2px 10px;font-size:12px;font-weight:700">
                  <i class="pi pi-box" style="font-size:11px"></i>
                  {{ contarItemsBodega(bodega.id_sitio) }}
                </span>
                <span *ngIf="contarItemsBodega(bodega.id_sitio) === 0"
                  style="color:#94a3b8;font-size:12px">—</span>
              </td>
              <td class="text-center">
                <p-tag [value]="bodega.estado !== false ? 'Activa' : 'Inactiva'"
                  [severity]="bodega.estado !== false ? 'success' : 'danger'"
                  styleClass="px-2 py-1 text-xs font-bold rounded-lg"></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button pButton icon="pi pi-eye"
                    class="btn-table-action btn-ver"
                    pTooltip="Ver ítems en esta bodega" tooltipPosition="top"
                    (click)="verItemsBodega(bodega)"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(bodega)" pTooltip="Editar bodega"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(bodega)" pTooltip="Eliminar bodega"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="empty-message">
                <i class="pi pi-home"></i>
                <p>No hay bodegas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Diálogo ítems de la bodega -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      [header]="'📦 Ítems en: ' + (bodegaVista?.nombre ?? '')"
      [(visible)]="displayItemsDialog" [modal]="true"
      [style]="{ width: '95vw', maxWidth: '720px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">

      <div *ngIf="itemsDeBodegaVista.length === 0" style="text-align:center;padding:2.5rem 0;color:#94a3b8">
        <i class="pi pi-box" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
        <p style="font-weight:600">Esta bodega no tiene ítems registrados</p>
      </div>

      <p-table *ngIf="itemsDeBodegaVista.length > 0"
        [value]="itemsDeBodegaVista" [paginator]="itemsDeBodegaVista.length > 10"
        [rows]="10" styleClass="modern-table" [rowHover]="true">
        <ng-template pTemplate="header">
          <tr>
            <th style="width:70px">ID</th>
            <th>SKU</th>
            <th>Placa SENA</th>
            <th>Producto</th>
            <th class="text-center">Estado</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-item>
          <tr>
            <td><span class="id-badge">#{{ item.id_item }}</span></td>
            <td><span style="font-family:monospace;font-size:12px;color:#475569">{{ item.codigo_sku || '—' }}</span></td>
            <td>
              <span *ngIf="item.placa_sena"
                style="font-family:monospace;font-size:12px;background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;border-radius:6px;padding:2px 8px">
                {{ item.placa_sena }}
              </span>
              <span *ngIf="!item.placa_sena" style="color:#94a3b8;font-size:12px">Sin placa</span>
            </td>
            <td>
              <span style="font-weight:600;color:#1e293b;font-size:13px">
                {{ item.producto?.nombre || '—' }}
              </span>
            </td>
            <td class="text-center">
              <p-tag
                [value]="item.estado"
                [severity]="item.estado === 'DISPONIBLE' ? 'success' : item.estado === 'PRESTADO' ? 'warn' : 'danger'"
                styleClass="px-2 py-1 text-xs font-bold rounded-lg">
              </p-tag>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cerrar" class="btn-cancelar" (click)="displayItemsDialog = false"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Diálogo Crear / Editar -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      [header]="esNueva ? 'Nueva Bodega' : 'Editar Bodega'"
      [(visible)]="displayDialog" [modal]="true"
      [style]="{ width: '90vw', maxWidth: '520px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">

      <div class="form-grid mt-2">
        <!-- Nombre -->
        <div class="form-field">
          <label for="nombre">Nombre de la Bodega *</label>
          <input pInputText id="nombre" [(ngModel)]="bodega.nombre"
            placeholder="Ej: Bodega Principal Gastronomía" />
        </div>

        <!-- Tipo de lugar -->
        <div class="form-field">
          <label for="tipo">Tipo de Lugar *</label>
          <p-select id="tipo"
            [ngModel]="bodega.tipo"
            (ngModelChange)="onTipoChange($event)"
            [options]="tiposLugar" optionLabel="label" optionValue="value"
            placeholder="Seleccione el tipo de lugar"
            [filter]="true" filterPlaceholder="Buscar tipo..."
            appendTo="body" styleClass="w-full">
          </p-select>
        </div>

        <!-- Tipo personalizado (solo si tipo = OTRO) -->
        <div class="form-field" *ngIf="bodega.tipo === 'OTRO'">
          <label for="tipo_personalizado">Especifica el tipo de lugar *</label>
          <input pInputText id="tipo_personalizado" [(ngModel)]="bodega.tipo_personalizado"
            placeholder="Ej: Auditorio, Cafetería, Taller..." />
        </div>

        <!-- Código / identificador del lugar (siempre que haya un tipo seleccionado) -->
        <div class="form-field" *ngIf="bodega.tipo">
          <label for="codigo_lugar">Código del lugar</label>
          <input pInputText id="codigo_lugar" [(ngModel)]="bodega.codigo_lugar"
            placeholder="Ej: Y-14, A-201..." />
          <small class="text-slate-400 text-xs mt-1 block">
            Identifica este lugar específico (útil cuando hay varios del mismo tipo, ej. varios ambientes en TIC).
          </small>
        </div>

        <!-- Responsable -->
        <div class="form-field">
          <label for="responsable">Responsable *</label>
          <p-select id="responsable" [(ngModel)]="bodega.id_responsable"
            [options]="usuariosResponsables" optionLabel="displayName" optionValue="id_usuario"
            placeholder="Seleccione el responsable" [filter]="true" filterBy="displayName"
            appendTo="body" styleClass="w-full" [showClear]="true">
            <ng-template let-user pTemplate="selectedItem">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-indigo-500 text-sm"></i>
                <div>
                  <span class="font-semibold text-sm">{{ user.nombre }}</span>
                  <small class="block text-xs text-slate-400">{{ user.rolNombre }}</small>
                </div>
              </div>
            </ng-template>
            <ng-template let-user pTemplate="item">
              <div class="flex items-center gap-2">
                <i class="pi pi-user text-slate-400 text-sm"></i>
                <div>
                  <span class="text-sm font-semibold">{{ user.nombre }}</span>
                  <small class="block text-xs text-slate-400">{{ user.rolNombre }} · {{ user.correo }}</small>
                </div>
              </div>
            </ng-template>
          </p-select>
          <small class="text-slate-400 text-xs mt-1 block">
            Administrador, Responsable de Bodega o Instructor
          </small>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar"
            (click)="displayDialog = false"></button>
          <button pButton [label]="saving ? 'Guardando...' : (esNueva ? 'Crear Bodega' : 'Guardar Cambios')"
            class="btn-guardar" (click)="guardar()" [disabled]="saving"></button>
        </div>
      </ng-template>
    </p-dialog>
  `
})
export class BodegaComponent implements OnInit, OnDestroy {
  private sitioService = inject(SitioService);
  private usuarioService = inject(UsuarioService);
  private productoService = inject(ProductoService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private apiService = inject(ApiService);
  private sedeService = inject(SedeService);
  private changesSub!: Subscription;

  currentIdCentro: number | null = null;

  bodegas: Bodega[] = [];
  bodegasFiltradas: Bodega[] = [];
  usuariosResponsables: any[] = [];
  todosLosItems: any[] = [];
  displayItemsDialog = false;
  bodegaVista: Bodega | null = null;
  itemsDeBodegaVista: any[] = [];
  filtro = '';
  displayDialog = false;
  esNueva = true;
  saving = false;
  bodega: Bodega = this.nuevaBodega();

  readonly tiposLugar = [
    { label: 'Bodega', value: 'BODEGA' },
    { label: 'Ambiente', value: 'AMBIENTE' },
    { label: 'Laboratorio', value: 'LABORATORIO' },
    { label: 'Otro', value: 'OTRO' },
  ];

  onTipoChange(value: string) {
    this.bodega.tipo = value;
    if (value !== 'OTRO') this.bodega.tipo_personalizado = null;
  }

  getTipoLabel(b: Bodega): string {
    if (b.tipo === 'OTRO') return b.tipo_personalizado || 'Otro';
    const found = this.tiposLugar.find(t => t.value === b.tipo);
    return found ? found.label : (b.tipo || '—');
  }

  esAdmin(): boolean {
    const role = this.authService.getUserRole()?.toUpperCase();
    return role === 'ADMINISTRADOR' || role === 'RESPONSABLE DE BODEGA';
  }

  ngOnInit() {
    this.cargarBodegas();
    this.cargarUsuarios();
    this.cargarItems();
    this.changesSub = this.apiService.changes.subscribe(() => {
      this.cargarBodegas();
      this.cargarItems();
    });
  }

  ngOnDestroy() {
    this.changesSub.unsubscribe();
  }

  private readonly TIPOS_VALIDOS = ['BODEGA', 'AMBIENTE', 'LABORATORIO', 'OTRO'];

  cargarBodegas() {
    const token = this.authService.getAccessToken();
    let tenantId: string | null = null;
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        tenantId = decoded.tenantId || decoded.tenant_id || null;
      } catch {}
    }

    const loadSedeObs$ = (tenantId && tenantId !== 'default')
      ? this.sedeService.getSedePorId(Number(tenantId))
      : of(null);

    loadSedeObs$.subscribe({
      next: (sedeRes: any) => {
        const sedeObj = sedeRes?.data || sedeRes;
        this.currentIdCentro = sedeObj ? Number(sedeObj.id_centro) : null;

        this.sitioService.getSitios().subscribe({
          next: (res: any) => {
            const all: any[] = res?.data || res || [];
            let filtered = all.filter(s => this.TIPOS_VALIDOS.includes(s.tipo));
            if (this.currentIdCentro) {
              filtered = filtered.filter(s => Number(s.id_centro) === this.currentIdCentro);
            }

            const role = this.authService.getUserRole()?.toUpperCase();
            if (role !== 'ADMINISTRADOR' && role !== 'SUPER ADMINISTRADOR') {
              const userId = this.authService.getUserId();
              filtered = filtered.filter(b =>
                Number(b.id_responsable) === userId || Number(b.responsable?.id_usuario) === userId
              );
            }

            this.bodegas = filtered;
            this.bodegasFiltradas = [...this.bodegas];
            this.cdr.markForCheck();
          },
          error: () => {
            this.bodegas = [];
            this.bodegasFiltradas = [];
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.sitioService.getSitios().subscribe({
          next: (res: any) => {
            const all: any[] = res?.data || res || [];
            this.bodegas = all.filter(s => this.TIPOS_VALIDOS.includes(s.tipo));
            this.bodegasFiltradas = [...this.bodegas];
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  cargarUsuarios() {
    const role = this.authService.getUserRole()?.toUpperCase();
    const isSedeAdmin = role === 'ADMINISTRADOR';
    const isSuperAdmin = role === 'SUPER ADMINISTRADOR';

    if (!isSedeAdmin && !isSuperAdmin) {
      this.usuariosResponsables = [];
      return;
    }

    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const todos: any[] = res?.data || res || [];
        // Pueden ser responsables: Administrador, Responsable de Bodega e Instructor
        const rolesPermitidos = ['administrador', 'responsable', 'instructor'];
        const filtrados = todos.filter((u: any) => {
          const rol = (u.rolNombre || u.rol?.nombre || '').toLowerCase();
          return rolesPermitidos.some(r => rol.includes(r));
        });
        this.usuariosResponsables = (filtrados.length > 0 ? filtrados : todos).map((u: any) => ({
          ...u,
          displayName: `${u.nombre || ''} ${u.apellidos || ''}`.trim() || u.correo,
          rolNombre: u.rolNombre || u.rol?.nombre || '',
        }));
        this.cdr.markForCheck();
      },
      error: () => { this.usuariosResponsables = []; },
    });
  }

  cargarItems() {
    this.productoService.getAllItems().subscribe({
      next: (res: any) => {
        this.todosLosItems = res?.data ?? res ?? [];
        this.cdr.markForCheck();
      },
      error: () => { this.todosLosItems = []; },
    });
  }

  contarItemsBodega(idSitio: number | undefined): number {
    if (!idSitio) return 0;
    return this.todosLosItems.filter(i => i.id_sitio === idSitio).length;
  }

  verItemsBodega(b: Bodega) {
    this.bodegaVista = b;
    this.itemsDeBodegaVista = this.todosLosItems.filter(i => i.id_sitio === b.id_sitio);
    this.displayItemsDialog = true;
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.bodegasFiltradas = this.bodegas.filter(b =>
      b.nombre?.toLowerCase().includes(f) ||
      this.getTipoLabel(b).toLowerCase().includes(f) ||
      b.codigo_lugar?.toLowerCase().includes(f) ||
      b.responsable?.nombre?.toLowerCase().includes(f) ||
      b.responsable?.correo?.toLowerCase().includes(f)
    );
  }

  getResponsableNombre(id: number | null | undefined): string {
    if (!id) return '';
    const u = this.usuariosResponsables.find(u => u.id_usuario === id);
    return u ? (u.nombre || u.displayName || '') : '';
  }

  nuevaBodega(): Bodega {
    return { nombre: '', tipo: 'BODEGA', tipo_personalizado: null, codigo_lugar: null, id_responsable: null, estado: true };
  }

  openNew() {
    this.esNueva = true;
    this.bodega = this.nuevaBodega();
    this.displayDialog = true;
  }

  editar(b: Bodega) {
    this.esNueva = false;
    this.bodega = { ...b };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.bodega.nombre?.trim()) {
      this.notification.warn('El nombre de la bodega es requerido', 'Bodegas');
      return;
    }
    if (!this.bodega.tipo) {
      this.notification.warn('Debe seleccionar el tipo de lugar', 'Bodegas');
      return;
    }
    if (this.bodega.tipo === 'OTRO' && !this.bodega.tipo_personalizado?.trim()) {
      this.notification.warn('Debe especificar el tipo de lugar', 'Bodegas');
      return;
    }
    if (!this.bodega.id_responsable) {
      this.notification.warn('Debe seleccionar un responsable', 'Bodegas');
      return;
    }

    const payload = {
      nombre: this.bodega.nombre.trim(),
      tipo: this.bodega.tipo,
      tipo_personalizado: this.bodega.tipo === 'OTRO' ? this.bodega.tipo_personalizado!.trim() : null,
      codigo_lugar: this.bodega.codigo_lugar?.trim() || null,
      id_responsable: this.bodega.id_responsable,
      id_centro: this.currentIdCentro,
      estado: true,
    };

    this.saving = true;

    if (this.esNueva) {
      this.sitioService.crearSitio(payload).subscribe({
        next: () => {
          this.notification.success('Bodega creada correctamente', 'Bodegas');
          this.displayDialog = false;
          this.saving = false;
          this.cargarBodegas();
        },
        error: () => {
          this.saving = false;
          this.notification.error('No se pudo crear la bodega', 'Bodegas');
        },
      });
    } else {
      this.sitioService.actualizarSitio(this.bodega.id_sitio!, payload).subscribe({
        next: () => {
          this.notification.success('Bodega actualizada correctamente', 'Bodegas');
          this.displayDialog = false;
          this.saving = false;
          this.cargarBodegas();
        },
        error: () => {
          this.saving = false;
          this.notification.error('No se pudo actualizar la bodega', 'Bodegas');
        },
      });
    }
  }

  eliminar(b: Bodega) {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la bodega "${b.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.sitioService.eliminarSitio(b.id_sitio!).subscribe({
          next: () => {
            this.notification.success('Bodega eliminada', 'Bodegas');
            this.cargarBodegas();
          },
          error: () => {
            this.notification.error('No se pudo eliminar (puede tener productos asignados)', 'Bodegas');
          },
        });
      },
    });
  }
}
