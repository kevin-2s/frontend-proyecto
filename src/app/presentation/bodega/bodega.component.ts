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
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { AuthService } from '../../infrastructure/services/auth.service';

interface Bodega {
  id_sitio?: number;
  nombre: string;
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
              <th style="min-width:180px">Responsable</th>
              <th style="min-width:100px" class="text-center">Estado</th>
              <th style="width:130px" class="text-center">Acciones</th>
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
                <p-tag [value]="bodega.estado !== false ? 'Activa' : 'Inactiva'"
                  [severity]="bodega.estado !== false ? 'success' : 'danger'"
                  styleClass="px-2 py-1 text-xs font-bold rounded-lg"></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
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
              <td colspan="5" class="empty-message">
                <i class="pi pi-home"></i>
                <p>No hay bodegas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Diálogo Crear / Editar -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      [header]="esNueva ? '✨ Nueva Bodega' : '📝 Editar Bodega'"
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
            Solo usuarios con rol Responsable o Administrador
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
export class BodegaComponent implements OnInit {
  private sitioService = inject(SitioService);
  private usuarioService = inject(UsuarioService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  bodegas: Bodega[] = [];
  bodegasFiltradas: Bodega[] = [];
  usuariosResponsables: any[] = [];
  filtro = '';
  displayDialog = false;
  esNueva = true;
  saving = false;
  bodega: Bodega = this.nuevaBodega();

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  ngOnInit() {
    this.cargarBodegas();
    this.cargarUsuarios();
  }

  cargarBodegas() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        this.bodegas = all.filter(s => s.tipo === 'BODEGA');
        this.bodegasFiltradas = [...this.bodegas];
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => {
        this.bodegas = [];
        this.bodegasFiltradas = [];
      },
    });
  }

  cargarUsuarios() {
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const todos: any[] = res?.data || res || [];
        // Filtrar usuarios con rol Responsable o Administrador
        const filtrados = todos.filter((u: any) => {
          const rol = (u.rolNombre || u.rol?.nombre || '').toLowerCase();
          return rol.includes('responsable') || rol.includes('administrador');
        });
        this.usuariosResponsables = (filtrados.length > 0 ? filtrados : todos).map((u: any) => ({
          ...u,
          displayName: `${u.nombre || ''} ${u.apellidos || ''}`.trim() || u.correo,
          rolNombre: u.rolNombre || u.rol?.nombre || '',
        }));
        setTimeout(() => this.cdr.detectChanges());
      },
      error: () => { this.usuariosResponsables = []; },
    });
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.bodegasFiltradas = this.bodegas.filter(b =>
      b.nombre?.toLowerCase().includes(f) ||
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
    return { nombre: '', id_responsable: null, estado: true };
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
    if (!this.bodega.id_responsable) {
      this.notification.warn('Debe seleccionar un responsable', 'Bodegas');
      return;
    }

    const payload = {
      nombre: this.bodega.nombre.trim(),
      tipo: 'BODEGA',
      id_responsable: this.bodega.id_responsable,
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
