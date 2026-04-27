import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, SkeletonModule, TagModule, ChartModule],
  template: `
    <div class="animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Resumen</h2>

      <!-- Tarjetas de Resumen -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Usuarios</p>
              @if (loading()) {
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              } @else {
                <h3 class="text-3xl font-bold text-gray-800">{{ totalUsuarios() }}</h3>
              }
            </div>
            <div class="stat-right">
              <canvas
                baseChart
                [data]="sparklineSolicitudesData"
                [options]="sparklineOptions"
                [type]="'line'"
                height="50"
              ></canvas>
            </div>
          </div>
        </div>

        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Productos</p>
              @if (loading()) {
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              } @else {
                <h3 class="text-3xl font-bold text-gray-800">{{ totalProductos() }}</h3>
              }
            </div>
            <div class="stat-right">
              <canvas
                baseChart
                [data]="sparklinePendientesData"
                [options]="sparklineOptions"
                [type]="'line'"
                height="50"
              ></canvas>
            </div>
          </div>
        </div>

        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Solicitudes Pendientes</p>
              @if (loading()) {
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              } @else {
                <h3 class="text-3xl font-bold text-[#FD7E14]">{{ solicitudesPendientes() }}</h3>
              }
            </div>
            <div class="stat-right">
              <canvas
                baseChart
                [data]="sparklineInventarioData"
                [options]="sparklineOptions"
                [type]="'line'"
                height="50"
              ></canvas>
            </div>
          </div>
        </div>
      </div>

        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Inventario</p>
              @if (loading()) {
                <p-skeleton width="4rem" height="2rem"></p-skeleton>
              } @else {
                <h3 class="text-3xl font-bold text-[#28A745]">{{ totalInventario() | number }}</h3>
              }
            </div>
            <div class="chart-value">
              <span class="value-label">Total Salidas</span>
              <span class="value-number red">{{ totalSalidas }}</span>
            </div>
          </div>
          <div class="chart-container" *ngIf="!cargando && movimientosData.length > 0">
            <canvas
              baseChart
              [data]="barLineChartData"
              [options]="barLineChartOptions"
              [type]="'bar'"
            ></canvas>
          </div>
          <div class="chart-skeleton" *ngIf="cargando">
            <p-skeleton width="100%" height="250px"></p-skeleton>
          </div>
          <div class="no-data" *ngIf="!cargando && movimientosData.length === 0">
            <i class="pi pi-info-circle"></i>
            <span>No hay datos de movimientos disponibles</span>
          </div>
        </div>

        <!-- Columna Derecha 35% -->
        <div class="chart-card right-col">
          <div class="card-header">
            <h3 class="card-title">Historial de Actividad</h3>
          </div>
          <div class="activity-list">
            <div class="activity-item" *ngFor="let actividad of ultimasActividades; let i = index">
              <div class="activity-dot" [ngClass]="getActivityColor(actividad.estadoSol)"></div>
              <div class="activity-content">
                <span class="activity-text">{{ actividad.justificacion }}</span>
                <span class="activity-date">{{ actividad.fechaSol | date: 'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="activity-skeleton" *ngIf="cargando">
              <p-skeleton
                width="100%"
                height="50px"
                *ngFor="let _ of [1, 2, 3, 4, 5, 6, 7, 8]"
              ></p-skeleton>
            </div>
          </div>
          <button
            pButton
            label="Ver todas las transacciones"
            icon="pi pi-arrow-right"
            iconPos="right"
            class="view-all-btn"
          ></button>
        </div>
      </div>

      <!-- Gráficas Dashboard (Grid 2x2) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        <!-- Gráfica 1: Stock bajo -->
        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 min-h-[24rem] flex flex-col">
          @if (loading()) {
            <p-skeleton width="100%" height="20rem"></p-skeleton>
          } @else {
            @if (chartError() || !chartStockData()?.labels?.length) {
              <div class="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[20rem]">
                <i class="pi pi-chart-bar text-4xl mb-3 text-gray-300"></i>
                <p>No hay datos de stock bajo</p>
              </div>
            } @else {
              <div class="relative w-full h-[20rem]">
                <p-chart type="bar" [data]="chartStockData()" [options]="chartStockOptions()"></p-chart>
              </div>
            }
          }
        </div>

        <!-- Gráfica 2: Próximos a vencer -->
        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 min-h-[24rem] flex flex-col">
          @if (loading()) {
            <p-skeleton width="100%" height="20rem"></p-skeleton>
          } @else {
            @if (chartError() || !chartVencimientoData()?.labels?.length) {
              <div class="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[20rem]">
                <i class="pi pi-calendar-times text-4xl mb-3 text-gray-300"></i>
                <p>No hay productos próximos a vencer</p>
              </div>
            } @else {
              <div class="relative w-full h-[20rem]">
                <p-chart type="bar" [data]="chartVencimientoData()" [options]="chartVencimientoOptions()"></p-chart>
              </div>
            }
          }
        </div>

        <!-- Gráfica 3: Materiales por sitio/bodega -->
        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 min-h-[24rem] flex flex-col">
          @if (loading()) {
            <p-skeleton width="100%" height="20rem"></p-skeleton>
          } @else {
            @if (chartError() || !chartSitiosData()?.labels?.length) {
              <div class="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[20rem]">
                <i class="pi pi-chart-pie text-4xl mb-3 text-gray-300"></i>
                <p>No hay distribución de sitios para mostrar</p>
              </div>
            } @else {
              <div class="relative flex items-center justify-center w-full h-[20rem]">
                <p-chart type="doughnut" [data]="chartSitiosData()" [options]="chartSitiosOptions()"></p-chart>
              </div>
            }
          }
        </div>

        <!-- Gráfica 4: Estado de solicitudes -->
        <div class="bg-white rounded-lg shadow border border-gray-200 p-4 min-h-[24rem] flex flex-col">
          @if (loading()) {
            <p-skeleton width="100%" height="20rem"></p-skeleton>
          } @else {
            @if (chartError() || !chartSolicitudesData()?.labels?.length) {
              <div class="flex-1 flex flex-col items-center justify-center text-gray-500 min-h-[20rem]">
                <i class="pi pi-file text-4xl mb-3 text-gray-300"></i>
                <p>No hay solicitudes registradas</p>
              </div>
            } @else {
              <div class="relative flex items-center justify-center w-full h-[20rem]">
                <p-chart type="pie" [data]="chartSolicitudesData()" [options]="chartSolicitudesOptions()"></p-chart>
              </div>
            }
          }
        </div>

      </div>

      <!-- Tabla Últimas Solicitudes -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 bg-[#F8F9FA] flex justify-between items-center rounded-t-lg">
          <h3 class="text-lg font-semibold text-gray-800">Últimas 5 Solicitudes</h3>
        </div>
        
        <p-table [value]="ultimasSolicitudes()" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-striped" [loading]="loading()">
            <ng-template pTemplate="header">
              <tr>
                <th class="table-header">ID</th>
                <th class="table-header">Justificación</th>
                <th class="table-header">Fecha</th>
                <th class="table-header">Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-sol>
                <tr>
                    <td class="font-medium text-gray-900">#{{ sol.id }}</td>
                    <td>{{ sol.justificacion || 'Sin justificación' }}</td>
                    <td>{{ sol.fechaSol || sol.fecha | date:'mediumDate' }}</td>
                    <td>
                      <p-tag [value]="sol.estadoSol || sol.estado" [severity]="getSeverity(sol.estadoSol || sol.estado)"></p-tag>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="4" class="text-center py-8 text-gray-500">
                        {{ loading() ? 'Cargando datos...' : 'No hay solicitudes recientes.' }}
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="empty-message">
                  <i class="pi pi-inbox"></i>
                  <span>No hay solicitudes disponibles</span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Asegurar que el canvas tome el contenedor completo para el resize responsive */
    p-chart {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
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
