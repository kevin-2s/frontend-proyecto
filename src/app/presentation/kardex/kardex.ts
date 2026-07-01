import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// PrimeNG
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

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
  imports: [
    CommonModule, 
    FormsModule,
    TableModule,
    SelectModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="module-container">
      <!-- Header -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <i class="pi pi-history text-[#39A900] text-3xl"></i>
          <div>
            <h3 class="page-title m-0">Kardex / Auditoría</h3>
            <p class="text-gray-400 text-[11px] m-0">Historial de movimientos y trazabilidad del inventario</p>
          </div>
        </div>

        <div class="header-actions flex items-center gap-3 flex-wrap">
          <!-- Búsqueda General -->
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="busqueda" placeholder="Buscar por ítem, SKU, observación..." class="search-input" />
          </div>
          
          <!-- Filtro Tipo -->
          <p-select 
            [options]="tipoOpciones" 
            [(ngModel)]="filtroTipo" 
            optionLabel="label" 
            optionValue="value" 
            styleClass="w-[160px] h-[40px] flex items-center" 
            placeholder="Todos los tipos" 
            appendTo="body"
          ></p-select>
        </div>
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

      <!-- Tabla Premium PrimeNG -->
      <div class="data-table-wrapper">
        <p-table
          [value]="kardexFiltrado()"
          [paginator]="true"
          [rows]="15"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Ítem / Producto</th>
              <th style="width:130px">Tipo</th>
              <th style="width:120px">Cantidad</th>
              <th style="width:140px">Saldo Anterior</th>
              <th style="width:140px">Saldo Actual</th>
              <th style="width:170px">Fecha</th>
              <th>Observación</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-k>
            <tr>
              <td><span class="id-badge">#{{ k.id_kardex }}</span></td>
              <td>
                <div style="display:flex;flex-direction:column">
                  <span class="nombre-cell" style="font-weight:600;">
                    {{ k.item?.producto?.nombre ?? ('Ítem #' + k.id_item) }}
                  </span>
                  <span style="font-size:11px;color:#94a3b8;margin-top:2px">SKU: {{ k.item?.codigo_sku ?? '—' }}</span>
                </div>
              </td>
              <td>
                <span class="status-badge" [ngClass]="k.tipo === 'ENTRADA' ? 'status-aprobada' : 'status-rechazada'">
                  {{ k.tipo }}
                </span>
              </td>
              <td>
                <span class="font-bold text-sm" [class.text-green-600]="k.tipo==='ENTRADA'" [class.text-red-600]="k.tipo==='SALIDA'">
                  {{ k.tipo === 'ENTRADA' ? '+' : '-' }}{{ k.cantidad }}
                </span>
              </td>
              <td>
                <span style="color:#6b7280">{{ k.saldo_anterior }}</span>
              </td>
              <td>
                <span style="font-weight:700;color:#1e293b">{{ k.saldo_actual }}</span>
              </td>
              <td>
                <span class="fecha-cell">{{ k.fecha | date: 'dd/MM/yyyy HH:mm' }}</span>
              </td>
              <td>
                <span style="font-size:12px;color:#6b7280;max-width:200px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" [title]="k.observacion ?? ''">
                  {{ k.observacion ?? '—' }}
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="empty-message py-20 text-center">
                <i class="pi pi-history text-5xl text-slate-300 opacity-50 mb-3 block"></i>
                <p class="text-slate-400 font-bold text-lg">No hay registros en el kardex</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class Kardex implements OnInit {
  private readonly http = inject(HttpClient);

  kardex = signal<KardexEntry[]>([]);
  busqueda = '';
  filtroTipo = '';

  tipoOpciones = [
    { label: 'Todos los tipos', value: '' },
    { label: 'ENTRADA', value: 'ENTRADA' },
    { label: 'SALIDA', value: 'SALIDA' }
  ];

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
      const termino = this.busqueda.trim().toLowerCase();
      const coincideBusqueda = !termino ||
        (k.item?.producto?.nombre ?? '').toLowerCase().includes(termino) ||
        (k.observacion ?? '').toLowerCase().includes(termino) ||
        String(k.id_item).includes(termino);

      const coincideTipo = !this.filtroTipo || k.tipo === this.filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }

  contarTipo(tipo: string): number {
    return this.kardex().filter(k => k.tipo === tipo).length;
  }
}
