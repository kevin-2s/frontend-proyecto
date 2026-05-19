import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Taiga UI
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';

import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule, 
    TableModule, 
    SkeletonModule, 
    TagModule, 
    ChartModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    TuiButton,
    TuiBadge,
    TuiIcon
  ],
  template: `
    <div class="animate-fade-in px-2">
      
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <!-- Angular Material Icon -->
          <mat-icon class="text-[#39A900] scale-150 mr-2">dashboard</mat-icon>
          <h2 class="text-[28px] font-black text-gray-900 tracking-tight m-0">Dashboard Resumen</h2>
          <!-- Taiga UI Badge -->
          <span tuiBadge size="m" appearance="info" class="ml-2">Live v2.0</span>
        </div>
        
        <!-- Taiga UI Button -->
        <button
          tuiButton
          type="button"
          appearance="secondary"
          size="m"
          class="rounded-xl"
          (click)="cargarDatos()"
        >
          <tui-icon icon="@tui.refresh-cw" class="mr-2"></tui-icon>
          Actualizar Datos
        </button>
      </div>

      <!-- Tarjetas de Resumen (Stat Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        <!-- Total Usuarios -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative overflow-hidden">
          <p class="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-widest">Total Usuarios</p>
          <div class="flex items-center justify-between mb-4">
            @if (loading()) {
              <p-skeleton width="4rem" height="3rem"></p-skeleton>
            } @else {
              <h3 class="text-[40px] font-black text-slate-900 leading-none">{{ totalUsuarios() }}</h3>
              <mat-icon class="text-blue-500 opacity-20 scale-[2.5]">groups</mat-icon>
            }
          </div>
          <!-- Angular Material Progress Bar -->
          <mat-progress-bar mode="determinate" value="70" color="primary" class="rounded-full"></mat-progress-bar>
        </div>

        <!-- Total Productos -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative overflow-hidden">
          <p class="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-widest">Total Productos</p>
          <div class="flex items-center justify-between mb-4">
            @if (loading()) {
              <p-skeleton width="4rem" height="3rem"></p-skeleton>
            } @else {
              <h3 class="text-[40px] font-black text-slate-900 leading-none">{{ totalProductos() }}</h3>
              <mat-icon class="text-[#39A900] opacity-20 scale-[2.5]">inventory_2</mat-icon>
            }
          </div>
          <mat-progress-bar mode="determinate" value="85" class="rounded-full"></mat-progress-bar>
        </div>

        <!-- Solicitudes Pendientes -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative overflow-hidden">
          <p class="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-widest">Pendientes</p>
          <div class="flex items-center justify-between mb-4">
            @if (loading()) {
              <p-skeleton width="4rem" height="3rem"></p-skeleton>
            } @else {
              <h3 class="text-[40px] font-black text-orange-500 leading-none">{{ solicitudesPendientes() }}</h3>
              <mat-icon class="text-orange-500 opacity-20 scale-[2.5]">pending_actions</mat-icon>
            }
          </div>
          <mat-progress-bar mode="determinate" value="40" color="warn" class="rounded-full"></mat-progress-bar>
        </div>

        <!-- Total Inventario -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all relative overflow-hidden">
          <p class="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-widest">Items Globales</p>
          <div class="flex items-center justify-between mb-4">
            @if (loading()) {
              <p-skeleton width="4rem" height="3rem"></p-skeleton>
            } @else {
              <h3 class="text-[40px] font-black text-emerald-600 leading-none">{{ totalInventario() }}</h3>
              <mat-icon class="text-emerald-500 opacity-20 scale-[2.5]">layers</mat-icon>
            }
          </div>
          <mat-progress-bar mode="determinate" value="65" color="accent" class="rounded-full"></mat-progress-bar>
        </div>

      </div>

      <!-- Gráficas Dashboard (PrimeNG ChartModule) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        <!-- Stock Card (PrimeNG) -->
        <div class="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 min-h-[400px]">
          @if (loading()) {
            <p-skeleton width="100%" height="320px"></p-skeleton>
          } @else {
            <p-chart type="bar" [data]="chartStockData()" [options]="chartStockOptions()" height="320px"></p-chart>
          }
        </div>

        <!-- Donut Card (PrimeNG) -->
        <div class="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 min-h-[400px]">
          @if (loading()) {
            <p-skeleton width="100%" height="320px"></p-skeleton>
          } @else {
            <p-chart type="doughnut" [data]="chartSitiosData()" [options]="chartSitiosOptions()" height="320px"></p-chart>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  totalUsuarios = signal<number>(0);
  totalProductos = signal<number>(0);
  solicitudesPendientes = signal<number>(0);
  totalInventario = signal<number>(0);
  ultimasSolicitudes = signal<any[]>([]);
  loading = signal<boolean>(true);
  chartError = signal<boolean>(false);

  // Señales para las Gráficas
  chartStockData = signal<any>(null);
  chartStockOptions = signal<any>(null);

  chartVencimientoData = signal<any>(null);
  chartVencimientoOptions = signal<any>(null);

  chartSitiosData = signal<any>(null);
  chartSitiosOptions = signal<any>(null);

  chartSolicitudesData = signal<any>(null);
  chartSolicitudesOptions = signal<any>(null);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);
    this.chartError.set(false);

    const reqUsuarios = this.apiService.get<any>('/usuarios').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    const reqProductos = this.apiService.get<any>('/productos').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    const reqSolicitudes = this.apiService.get<any>('/solicitudes').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    const reqInventario = this.apiService.get<any>('/inventario').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    const reqItems = this.apiService.get<any>('/items').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    const reqSitios = this.apiService.get<any>('/sitios').pipe(
      map(res => Array.isArray(res) ? res : (res?.data || [])),
      catchError(() => of([]))
    );

    forkJoin({
      usuarios: reqUsuarios,
      productos: reqProductos,
      solicitudes: reqSolicitudes,
      inventario: reqInventario,
      items: reqItems,
      sitios: reqSitios
    }).subscribe({
      next: ({ usuarios, productos, solicitudes, inventario, items, sitios }) => {
        // --- MÉTRICAS GENERALES ---
        this.totalUsuarios.set(usuarios.length);
        this.totalProductos.set(productos.length);
        
        const pendientes = solicitudes.filter((s: any) => {
          const estado = s.estadoSol || s.estado;
          return estado === 'PENDIENTE';
        }).length;
        this.solicitudesPendientes.set(pendientes);
        
        const sorted = [...solicitudes].sort((a: any, b: any) => {
          const dateA = new Date(a.fechaSol || a.fecha || a.createdAt || 0).getTime();
          const dateB = new Date(b.fechaSol || b.fecha || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        this.ultimasSolicitudes.set(sorted.slice(0, 5));

        const totalInv = inventario.reduce((acc: number, curr: any) => acc + (Number(curr.cantidad) || Number(curr.stock) || 0), 0);
        this.totalInventario.set(totalInv);

        // --- GRÁFICA 1: Productos con Stock Bajo (Items) ---
        const itemsAgrupados = items.reduce((acc: any, item: any) => {
          const prodId = item.id_producto || (item.producto && item.producto.id);
          if(prodId) {
            if (!acc[prodId]) acc[prodId] = 0;
            acc[prodId]++;
          }
          return acc;
        }, {});

        const stockArray = Object.keys(itemsAgrupados).map(prodId => {
          const p = productos.find((prod: any) => String(prod.id_producto || prod.id) === String(prodId));
          return {
            nombre: p ? p.nombre : 'Producto #' + prodId,
            count: itemsAgrupados[prodId]
          };
        }).sort((a, b) => a.count - b.count).slice(0, 5);

        const stockLabels = stockArray.map(i => i.nombre);
        const stockCounts = stockArray.map(i => i.count);
        const stockColors = stockCounts.map(c => c < 3 ? '#ef4444' : c < 5 ? '#eab308' : '#22c55e'); // rojo < 3, amarillo < 5, verde resto

        this.chartStockData.set({
          labels: stockLabels,
          datasets: [
            {
              label: 'Cantidad de Items',
              data: stockCounts,
              backgroundColor: stockColors,
              borderRadius: 4
            }
          ]
        });
        this.chartStockOptions.set({
          indexAxis: 'y', // Barra horizontal
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          plugins: {
            legend: { display: false },
            title: { display: true, text: '⚠️ Productos con Stock Bajo', font: { size: 16 } }
          },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        });

        // --- GRÁFICA 2: Productos próximos a vencer ---
        const hoy = new Date();
        const limite90 = new Date();
        limite90.setDate(limite90.getDate() + 90);

        const aVencer = productos.filter((p: any) => {
          if (!p.fecha_vencimiento) return false;
          const fv = new Date(p.fecha_vencimiento);
          return fv >= hoy && fv <= limite90;
        }).sort((a: any, b: any) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());

        const vencimientoLabels = aVencer.map((p: any) => p.nombre);
        const vencimientoDias = aVencer.map((p: any) => {
          const diff = new Date(p.fecha_vencimiento).getTime() - hoy.getTime();
          return Math.ceil(diff / (1000 * 3600 * 24));
        });
        
        // rojo < 30, amarillo < 60, verde < 90
        const vencimientoColors = vencimientoDias.map((d: number) => d < 30 ? '#ef4444' : d < 60 ? '#eab308' : '#22c55e');

        this.chartVencimientoData.set({
          labels: vencimientoLabels,
          datasets: [
            {
              label: 'Días restantes para vencer',
              data: vencimientoDias,
              backgroundColor: vencimientoColors,
              borderRadius: 4
            }
          ]
        });
        this.chartVencimientoOptions.set({
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          plugins: {
            legend: { display: false },
            title: { display: true, text: '📅 Productos Próximos a Vencer', font: { size: 16 } }
          },
          scales: {
            y: { beginAtZero: true }
          }
        });

        // --- GRÁFICA 3: Materiales por sitio/bodega ---
        const sitiosMap = sitios.reduce((acc: any, s: any) => {
          acc[s.id_sitio || s.id] = s.nombre;
          return acc;
        }, {});

        const invSitio = inventario.reduce((acc: any, inv: any) => {
          const sId = inv.id_sitio || (inv.sitio && inv.sitio.id);
          if (sId) {
            if (!acc[sId]) acc[sId] = 0;
            acc[sId] += (Number(inv.cantidad) || Number(inv.stock) || 1);
          }
          return acc;
        }, {});

        const sitiosLabels = Object.keys(invSitio).map(id => sitiosMap[id] || 'Sitio #' + id);
        const sitiosData = Object.values(invSitio);
        const bgColorsDoughnut = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        this.chartSitiosData.set({
          labels: sitiosLabels,
          datasets: [
            {
              data: sitiosData,
              backgroundColor: bgColorsDoughnut.slice(0, sitiosLabels.length),
              borderWidth: 0
            }
          ]
        });
        this.chartSitiosOptions.set({
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: '🏭 Distribución de Materiales por Sitio', font: { size: 16 } }
          }
        });

        // --- GRÁFICA 4: Estado de solicitudes ---
        const estadosSol = solicitudes.reduce((acc: any, sol: any) => {
          const st = (sol.estadoSol || sol.estado || 'PENDIENTE').toUpperCase();
          if (!acc[st]) acc[st] = 0;
          acc[st]++;
          return acc;
        }, {});

        const keysSol = Object.keys(estadosSol);
        const dataSol = Object.values(estadosSol);
        
        const getColorEstado = (estado: string) => {
          if (estado === 'PENDIENTE') return '#f97316'; // naranja
          if (estado === 'APROBADA' || estado === 'APROBADO' || estado === 'ENTREGADO') return '#22c55e'; // verde
          if (estado === 'RECHAZADA' || estado === 'RECHAZADO' || estado === 'CANCELADO') return '#ef4444'; // rojo
          return '#64748b'; // gris fallback
        };

        this.chartSolicitudesData.set({
          labels: keysSol,
          datasets: [
            {
              data: dataSol,
              backgroundColor: keysSol.map(getColorEstado),
              borderWidth: 0
            }
          ]
        });
        this.chartSolicitudesOptions.set({
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: '📋 Estado de Solicitudes', font: { size: 16 } }
          }
        });

        this.loading.set(false);
      },
      error: () => {
        this.chartError.set(true);
        this.loading.set(false);
      }
    });
  }

  getSeverity(estado: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch(estado) {
      case 'PENDIENTE': return 'warn';
      case 'APROBADA': return 'success';
      case 'RECHAZADA': return 'danger';
      default: return 'info';
    }
  }
}
