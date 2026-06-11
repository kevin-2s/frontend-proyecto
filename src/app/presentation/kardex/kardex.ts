import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface KardexEntry {
  id_kardex: number;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  saldo_anterior: number;
  saldo_actual: number;
  fecha: string;
  observacion: string | null;
  id_item: number;
  item?: any;
  usuario?: any;
}

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 min-h-screen bg-[#f0fdf4]">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Kardex / Auditoría</h1>
        <p class="text-gray-500 text-sm mt-1">Historial de movimientos y trazabilidad del inventario</p>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5 flex gap-4 items-center flex-wrap">
        <div class="flex items-center gap-2 flex-1 min-w-[200px]">
          <i class="pi pi-search text-gray-400"></i>
          <input type="text" [(ngModel)]="busqueda" placeholder="Buscar por item o tipo..."
            class="w-full text-sm focus:outline-none text-gray-700 bg-transparent placeholder-gray-400">
        </div>
        <div>
          <select [(ngModel)]="filtroTipo"
            class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none text-gray-700 bg-white cursor-pointer">
            <option value="">Todos los tipos</option>
            <option value="ENTRADA">ENTRADA</option>
            <option value="SALIDA">SALIDA</option>
          </select>
        </div>
        <button (click)="filtrarPorItem()" class="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
          <i class="pi pi-filter"></i> Filtrar por Item
        </button>
      </div>

      <!-- Tarjetas de resumen -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Movimientos</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i class="pi pi-list text-emerald-500 text-sm"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ kardex().length }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Entradas</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <i class="pi pi-arrow-down text-emerald-500 text-sm"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-emerald-600">{{ contarTipo('ENTRADA') }}</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Salidas</span>
            <div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <i class="pi pi-arrow-up text-red-500 text-sm"></i>
            </div>
          </div>
          <p class="text-2xl font-bold text-red-600">{{ contarTipo('SALIDA') }}</p>
        </div>
      </div>

      <!-- Tabla -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 class="font-semibold text-gray-800">Historial de Movimientos</h2>
          <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{{ kardexFiltrado().length }} registros</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th class="px-5 py-3 text-left font-semibold">ID</th>
                <th class="px-5 py-3 text-left font-semibold">Item</th>
                <th class="px-5 py-3 text-left font-semibold">Tipo</th>
                <th class="px-5 py-3 text-left font-semibold">Cantidad</th>
                <th class="px-5 py-3 text-left font-semibold">Saldo Anterior</th>
                <th class="px-5 py-3 text-left font-semibold">Saldo Actual</th>
                <th class="px-5 py-3 text-left font-semibold">Fecha</th>
                <th class="px-5 py-3 text-left font-semibold">Observación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let k of kardexFiltrado()" class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="px-5 py-3 text-gray-500 font-mono text-xs">{{ k.id_kardex }}</td>
                <td class="px-5 py-3 font-semibold text-gray-800">
                  {{ k.item?.producto?.nombre ?? ('Item #' + k.id_item) }}
                </td>
                <td class="px-5 py-3">
                  <span [class]="k.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                    class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ k.tipo }}
                  </span>
                </td>
                <td class="px-5 py-3 font-bold" [class.text-emerald-600]="k.tipo==='ENTRADA'" [class.text-red-600]="k.tipo==='SALIDA'">
                  {{ k.tipo === 'ENTRADA' ? '+' : '-' }}{{ k.cantidad }}
                </td>
                <td class="px-5 py-3 text-gray-500">{{ k.saldo_anterior }}</td>
                <td class="px-5 py-3 font-semibold text-gray-800">{{ k.saldo_actual }}</td>
                <td class="px-5 py-3 text-gray-500 text-xs">{{ k.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="px-5 py-3 text-gray-500 text-xs max-w-[200px] truncate">{{ k.observacion ?? '—' }}</td>
              </tr>
              <tr *ngIf="kardexFiltrado().length === 0">
                <td colspan="8" class="px-5 py-10 text-center text-gray-400">
                  <i class="pi pi-inbox text-3xl mb-2 block"></i>
                  No hay registros en el kardex
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class Kardex implements OnInit {
  kardex = signal<KardexEntry[]>([]);
  busqueda = '';
  filtroTipo = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.http.get<{ data: KardexEntry[] }>(`${environment.apiUrl}/kardex`).subscribe({
      next: (res) => this.kardex.set(res.data ?? []),
      error: () => this.kardex.set([]),
    });
  }

  kardexFiltrado(): KardexEntry[] {
    return this.kardex().filter(k => {
      const termino = this.busqueda.toLowerCase();
      const coincideBusqueda = !termino ||
        k.tipo.toLowerCase().includes(termino) ||
        (k.item?.producto?.nombre ?? '').toLowerCase().includes(termino) ||
        String(k.id_item).includes(termino);
      const coincideTipo = !this.filtroTipo || k.tipo === this.filtroTipo;
      return coincideBusqueda && coincideTipo;
    });
  }

  contarTipo(tipo: string): number {
    return this.kardex().filter(k => k.tipo === tipo).length;
  }

  filtrarPorItem() {
    const id = prompt('Ingresa el ID del item a filtrar:');
    if (id) {
      this.busqueda = id;
    }
  }
}
