import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosService, Prestamo, CreatePrestamoDto } from '../../services/prestamos/prestamos.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="module-container">
      <!-- Header -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <i class="pi pi-send text-[#39A900] text-3xl"></i>
          <div>
            <h3 class="page-title m-0">Préstamos y Devoluciones</h3>
            <p class="text-gray-400 text-[11px] m-0">Gestión de equipos prestados y registro de devoluciones</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="flex gap-2">
            <button 
              type="button"
              (click)="vistaActual.set('todos')"
              [class]="vistaActual() === 'todos' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            >
              Todos
            </button>
            <button 
              type="button"
              (click)="vistaActual.set('activos')"
              [class]="vistaActual() === 'activos' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            >
              Activos
            </button>
          </div>
          <button pButton label="Nuevo Préstamo" icon="pi pi-plus"
            class="btn-agregar" (click)="abrirModal()"></button>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-800">Lista de Préstamos</h2>
          <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ prestamosFiltrados().length }} registros</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-5 py-3 text-left font-semibold">ID</th>
                <th class="px-5 py-3 text-left font-semibold">Item</th>
                <th class="px-5 py-3 text-left font-semibold">Solicitante</th>
                <th class="px-5 py-3 text-left font-semibold">F. Préstamo</th>
                <th class="px-5 py-3 text-left font-semibold">F. Dev. Esperada</th>
                <th class="px-5 py-3 text-left font-semibold">F. Dev. Real</th>
                <th class="px-5 py-3 text-left font-semibold">Estado</th>
                <th class="px-5 py-3 text-left font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of prestamosFiltrados()" class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-5 py-3 text-gray-500 font-mono">{{ p.id_prestamo }}</td>
                <td class="px-5 py-3 font-semibold text-gray-800">
                  {{ p.item?.producto?.nombre ?? ('Item #' + p.id_item) }}
                </td>
                <td class="px-5 py-3 text-gray-600">{{ p.usuario_solicitante?.nombre ?? ('Usuario #' + p.id_usuario_solicitante) }}</td>
                <td class="px-5 py-3 text-gray-500">{{ p.fecha_prestamo | date:'dd/MM/yyyy' }}</td>
                <td class="px-5 py-3 text-gray-500">{{ p.fecha_devolucion_esperada | date:'dd/MM/yyyy' }}</td>
                <td class="px-5 py-3 text-gray-500">
                  {{ p.fecha_devolucion_real ? (p.fecha_devolucion_real | date:'dd/MM/yyyy') : '—' }}
                </td>
                <td class="px-5 py-3">
                  <span [class]="getBadgeClass(p.estado)" class="px-3 py-1 rounded-full text-xs font-semibold">
                    {{ p.estado }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <button *ngIf="p.estado === 'ACTIVO'"
                    (click)="registrarDevolucion(p)"
                    class="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    <i class="pi pi-check-circle"></i> Devolver
                  </button>
                </td>
              </tr>
              <tr *ngIf="prestamosFiltrados().length === 0">
                <td colspan="8" class="px-5 py-10 text-center text-gray-400">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  No hay préstamos registrados
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Nuevo Préstamo (Estilo Formulario de Productos) -->
      <p-dialog
        maskStyleClass="transparent-mask"
        [dismissableMask]="true"
        header="✨ Registrar Nuevo Préstamo"
        [(visible)]="mostrarModal"
        [modal]="true"
        [style]="{ width: '94vw', maxWidth: '660px' }"
        [draggable]="true"
        [resizable]="false"
        styleClass="form-dialog shadow-2xl border border-slate-200"
        appendTo="body"
      >
        <div class="form-grid mt-2" *ngIf="mostrarModal">
          <!-- Ítem -->
          <div class="form-field">
            <label>Ítem <span class="text-red-500">*</span></label>
            <p-select 
              [options]="items" 
              [(ngModel)]="nuevoDto.id_item" 
              optionLabel="displayLabel" 
              optionValue="id_item" 
              placeholder="Seleccione un ítem" 
              [filter]="true" 
              filterPlaceholder="Buscar ítem..." 
              styleClass="w-full flex items-center" 
              appendTo="body"
              [style]="{'width':'100%'}"
            ></p-select>
          </div>

          <!-- Usuario Solicitante -->
          <div class="form-field">
            <label>Usuario Solicitante <span class="text-red-500">*</span></label>
            <p-select 
              [options]="usuarios" 
              [(ngModel)]="nuevoDto.id_usuario_solicitante" 
              optionLabel="displayLabel" 
              optionValue="id_usuario" 
              placeholder="Seleccione usuario solicitante" 
              [filter]="true" 
              filterPlaceholder="Buscar usuario..." 
              styleClass="w-full flex items-center" 
              appendTo="body"
              [style]="{'width':'100%'}"
            ></p-select>
          </div>

          <!-- Usuario Responsable -->
          <div class="form-field">
            <label>Usuario Responsable <span class="text-red-500">*</span></label>
            <p-select 
              [options]="usuarios" 
              [(ngModel)]="nuevoDto.id_usuario_responsable" 
              optionLabel="displayLabel" 
              optionValue="id_usuario" 
              placeholder="Seleccione usuario responsable" 
              [filter]="true" 
              filterPlaceholder="Buscar usuario..." 
              styleClass="w-full flex items-center" 
              appendTo="body"
              [style]="{'width':'100%'}"
            ></p-select>
          </div>

          <!-- Fecha Devolución Esperada -->
          <div class="form-field">
            <label for="fecha-dev">Fecha Devolución Esperada <span class="text-red-500">*</span></label>
            <input 
              pInputText 
              id="fecha-dev" 
              type="date" 
              [(ngModel)]="nuevoDto.fecha_devolucion_esperada"
              class="w-full"
            />
          </div>

          <!-- Observación -->
          <div class="form-field">
            <label for="observacion">Observación</label>
            <textarea 
              pInputText
              id="observacion"
              [(ngModel)]="nuevoDto.observacion" 
              rows="3"
              placeholder="Observaciones opcionales..."
              class="w-full" 
              style="resize:vertical; min-height:68px; width:100%; border:2px solid #1e293b; border-radius:8px; padding:8px 10px; font-size:0.875rem; background:#fff; color:#1e293b; outline:none; box-sizing:border-box;"
            ></textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button pButton label="Cancelar" class="btn-cancelar" (click)="cerrarModal()"></button>
            <button pButton label="Registrar Préstamo" class="btn-guardar"
              [disabled]="!nuevoDto.id_item || !nuevoDto.id_usuario_solicitante || !nuevoDto.id_usuario_responsable || !nuevoDto.fecha_devolucion_esperada || guardando"
              (click)="guardarPrestamo()"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
})
export class PrestamosComponent implements OnInit {
  private readonly http = inject(HttpClient);

  prestamos = signal<Prestamo[]>([]);
  vistaActual = signal<'todos' | 'activos'>('todos');
  mostrarModal = false;
  guardando = false;

  items: any[] = [];
  usuarios: any[] = [];

  nuevoDto: CreatePrestamoDto = {
    id_item: 0,
    id_usuario_solicitante: 0,
    id_usuario_responsable: 0,
    fecha_devolucion_esperada: '',
    observacion: '',
  };

  constructor(private readonly svc: PrestamosService) {}

  ngOnInit() {
    this.cargarPrestamos();
    this.cargarItems();
    this.cargarUsuarios();
  }

  cargarItems() {
    this.http.get<any>(`${environment.apiUrl}/items`).subscribe({
      next: (res: any) => {
        const rawItems = res?.data || res || [];
        this.items = rawItems.map((item: any) => ({
          ...item,
          displayLabel: `${item.producto?.nombre ?? 'Ítem'} — SKU: ${item.codigo_sku} (${item.estado})`
        }));
      },
      error: () => { this.items = []; }
    });
  }

  cargarUsuarios() {
    this.http.get<any>(`${environment.apiUrl}/usuarios`).subscribe({
      next: (res: any) => {
        const rawUsers = res?.data || res || [];
        this.usuarios = rawUsers.map((user: any) => ({
          ...user,
          displayLabel: `${user.nombre} ${user.apellidos || ''} (${user.correo})`
        }));
      },
      error: () => { this.usuarios = []; }
    });
  }

  cargarPrestamos() {
    this.svc.getAll().subscribe({
      next: (res) => this.prestamos.set(res.data ?? []),
      error: () => this.prestamos.set([]),
    });
  }

  prestamosFiltrados() {
    if (this.vistaActual() === 'activos') {
      return this.prestamos().filter(p => p.estado === 'ACTIVO');
    }
    return this.prestamos();
  }

  getBadgeClass(estado: string): string {
    const map: Record<string, string> = {
      ACTIVO: 'bg-emerald-100 text-emerald-700',
      DEVUELTO: 'bg-emerald-100 text-emerald-700',
      VENCIDO: 'bg-red-100 text-red-700',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-600';
  }

  abrirModal() {
    this.nuevoDto = {
      id_item: null as any,
      id_usuario_solicitante: null as any,
      id_usuario_responsable: null as any,
      fecha_devolucion_esperada: '',
      observacion: '',
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarPrestamo() {
    if (!this.nuevoDto.id_item || !this.nuevoDto.id_usuario_solicitante || !this.nuevoDto.id_usuario_responsable || !this.nuevoDto.fecha_devolucion_esperada) return;
    this.guardando = true;
    this.svc.create(this.nuevoDto).subscribe({
      next: (res) => {
        this.cargarPrestamos();
        this.cerrarModal();
        this.guardando = false;
      },
      error: () => {
        this.guardando = false;
        alert('Error al registrar el préstamo');
      },
    });
  }

  registrarDevolucion(prestamo: Prestamo) {
    const obs = prompt('Observación de devolución (opcional):') ?? undefined;
    this.svc.registrarDevolucion(prestamo.id_prestamo, obs).subscribe({
      next: () => this.cargarPrestamos(),
      error: () => alert('Error al registrar devolución'),
    });
  }
}
