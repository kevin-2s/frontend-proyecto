import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrestamosService, Prestamo, CreatePrestamoDto } from '../../services/prestamos/prestamos.service';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 min-h-screen bg-[#F1F5F9]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Préstamos y Devoluciones</h1>
          <p class="text-gray-500 text-sm mt-1">Gestión de equipos prestados y registro de devoluciones</p>
        </div>
        <button (click)="abrirModal()"
          class="flex items-center gap-2 bg-[#39A900] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#2e8a00] transition-colors shadow-md">
          <i class="pi pi-plus"></i> Nuevo Préstamo
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-5">
        <button (click)="vistaActual.set('todos')"
          [class.bg-[#111827]]="vistaActual() === 'todos'"
          [class.text-white]="vistaActual() === 'todos'"
          [class.bg-white]="vistaActual() !== 'todos'"
          [class.text-gray-600]="vistaActual() !== 'todos'"
          class="px-5 py-2 rounded-xl text-sm font-semibold transition-all border border-gray-200">
          Todos
        </button>
        <button (click)="vistaActual.set('activos')"
          [class.bg-[#111827]]="vistaActual() === 'activos'"
          [class.text-white]="vistaActual() === 'activos'"
          [class.bg-white]="vistaActual() !== 'activos'"
          [class.text-gray-600]="vistaActual() !== 'activos'"
          class="px-5 py-2 rounded-xl text-sm font-semibold transition-all border border-gray-200">
          Activos
        </button>
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

      <!-- Modal Nuevo Préstamo -->
      <div *ngIf="mostrarModal()" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-900">Registrar Nuevo Préstamo</h3>
            <p class="text-gray-500 text-sm mt-1">Ingresa la información del equipo a prestar</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">ID del Item *</label>
              <input type="number" [(ngModel)]="nuevoDto.id_item"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]"
                placeholder="Ingresa el ID del item">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">ID Usuario Solicitante *</label>
              <input type="number" [(ngModel)]="nuevoDto.id_usuario_solicitante"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]"
                placeholder="ID del usuario">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">ID Usuario Responsable *</label>
              <input type="number" [(ngModel)]="nuevoDto.id_usuario_responsable"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]"
                placeholder="ID del responsable">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Fecha Devolución Esperada *</label>
              <input type="date" [(ngModel)]="nuevoDto.fecha_devolucion_esperada"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Observación</label>
              <textarea [(ngModel)]="nuevoDto.observacion" rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900] resize-none"
                placeholder="Observaciones opcionales..."></textarea>
            </div>
          </div>
          <div class="p-6 border-t border-gray-100 flex gap-3 justify-end">
            <button (click)="cerrarModal()"
              class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
              Cancelar
            </button>
            <button (click)="guardarPrestamo()" [disabled]="guardando()"
              class="px-5 py-2.5 rounded-xl bg-[#39A900] text-white font-semibold hover:bg-[#2e8a00] transition-colors text-sm disabled:opacity-60">
              {{ guardando() ? 'Guardando...' : 'Registrar Préstamo' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PrestamosComponent implements OnInit {
  prestamos = signal<Prestamo[]>([]);
  vistaActual = signal<'todos' | 'activos'>('todos');
  mostrarModal = signal(false);
  guardando = signal(false);

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
      ACTIVO: 'bg-blue-100 text-blue-700',
      DEVUELTO: 'bg-emerald-100 text-emerald-700',
      VENCIDO: 'bg-red-100 text-red-700',
    };
    return map[estado] ?? 'bg-gray-100 text-gray-600';
  }

  abrirModal() {
    this.nuevoDto = {
      id_item: 0,
      id_usuario_solicitante: 0,
      id_usuario_responsable: 0,
      fecha_devolucion_esperada: '',
      observacion: '',
    };
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  guardarPrestamo() {
    if (!this.nuevoDto.id_item || !this.nuevoDto.fecha_devolucion_esperada) return;
    this.guardando.set(true);
    this.svc.create(this.nuevoDto).subscribe({
      next: (res) => {
        this.cargarPrestamos();
        this.cerrarModal();
        this.guardando.set(false);
      },
      error: () => {
        this.guardando.set(false);
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
