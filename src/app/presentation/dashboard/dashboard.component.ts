import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule, SkeletonModule, TagModule],
  template: `
    <div class="animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Resumen</h2>

      <!-- Tarjetas de Resumen (Sin PrimeNG para control total de colores y borde custom) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Usuarios</p>
              <ng-container *ngIf="loading(); else uTemplate">
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              </ng-container>
              <ng-template #uTemplate>
                <h3 class="text-3xl font-bold text-gray-800">{{ totalUsuarios() }}</h3>
              </ng-template>
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
              <ng-container *ngIf="loading(); else pTemplate">
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              </ng-container>
              <ng-template #pTemplate>
                <h3 class="text-3xl font-bold text-gray-800">{{ totalProductos() }}</h3>
              </ng-template>
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
              <ng-container *ngIf="loading(); else spTemplate">
                <p-skeleton width="3rem" height="2rem"></p-skeleton>
              </ng-container>
              <ng-template #spTemplate>
                <h3 class="text-3xl font-bold text-[#FD7E14]">{{ solicitudesPendientes() }}</h3>
              </ng-template>
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
              <ng-container *ngIf="loading(); else invTemplate">
                <p-skeleton width="4rem" height="2rem"></p-skeleton>
              </ng-container>
              <ng-template #invTemplate>
                <h3 class="text-3xl font-bold text-[#28A745]">{{ totalInventario() | number }}</h3>
              </ng-template>
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

      <!-- Tabla Últimas Solicitudes con PrimeNG Table -->
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
  styles: [
    `
      .dashboard-container {
        padding: 24px;
        background-color: #f8f9fa;
        min-height: 100vh;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .dashboard-title {
        font-size: 24px;
        font-weight: 700;
        color: #333;
        margin: 0;
      }

      .header-btn {
        border-color: #39a900;
        color: #39a900;
      }

      .header-btn:hover {
        background-color: #39a900;
        color: white;
      }

      /* SECCIÓN 1: TARJETAS DE ESTADÍSTICAS */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 1024px) {
        .stats-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 576px) {
        .stats-row {
          grid-template-columns: 1fr;
        }
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        padding: 20px;
      }

      .stat-card-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-left {
        display: flex;
        flex-direction: column;
      }

      .stat-label {
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #1f2937;
      }

      .pending-value {
        color: #fd7e14;
      }

      .inventory-value {
        color: #0d6efd;
      }

      .stat-badge {
        display: inline-block;
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        margin-top: 4px;
      }

      .stat-badge.positive {
        background-color: #d1fae5;
        color: #059669;
      }

      .stat-badge.negative {
        background-color: #fee2e2;
        color: #dc2626;
      }

      .stat-right {
        width: 80px;
        height: 50px;
      }

      /* SECCIÓN 2: GRÁFICAS PRINCIPALES */
      .charts-row {
        display: grid;
        grid-template-columns: 65% 35%;
        gap: 20px;
        margin-bottom: 24px;
      }

      @media (max-width: 1024px) {
        .charts-row {
          grid-template-columns: 1fr;
        }
      }

      .chart-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        padding: 20px;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .card-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin: 0;
      }

      .year-select {
        width: 120px;
      }

      .chart-values {
        display: flex;
        gap: 32px;
        margin-bottom: 16px;
      }

      .chart-value {
        display: flex;
        flex-direction: column;
      }

      .value-label {
        font-size: 12px;
        color: #6b7280;
      }

      .value-number {
        font-size: 24px;
        font-weight: 700;
      }

      .value-number.green {
        color: #39a900;
      }

      .value-number.red {
        color: #dc3545;
      }

      .chart-container {
        height: 250px;
      }

      .chart-skeleton {
        height: 250px;
      }

      .no-data {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 40px;
        color: #6b7280;
      }

      /* Activity List */
      .activity-list {
        max-height: 320px;
        overflow-y: auto;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid #f3f4f6;
      }

      .activity-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .activity-dot.green {
        background-color: #39a900;
      }

      .activity-dot.orange {
        background-color: #fd7e14;
      }

      .activity-dot.red {
        background-color: #dc3545;
      }

      .activity-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }

      .activity-text {
        font-size: 13px;
        color: #374151;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .activity-date {
        font-size: 11px;
        color: #9ca3af;
      }

      .activity-skeleton {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .view-all-btn {
        width: 100%;
        margin-top: 16px;
        background-color: #39a900;
        border-color: #39a900;
      }

      .view-all-btn:hover {
        background-color: #2d8600;
        border-color: #2d8600;
      }

      /* SECCIÓN 3: FILA INFERIOR */
      .bottom-row {
        display: grid;
        grid-template-columns: 40% 60%;
        gap: 20px;
      }

      @media (max-width: 1024px) {
        .bottom-row {
          grid-template-columns: 1fr;
        }
      }

      .left-col-40 {
        grid-column: 1;
      }

      .right-col-60 {
        grid-column: 2;
      }

      @media (max-width: 1024px) {
        .left-col-40,
        .right-col-60 {
          grid-column: 1;
        }
      }

      .doughnut-container {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }

      .doughnut-skeleton {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
      }

      .category-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .category-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .category-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
      }

      .category-name {
        flex: 1;
        font-size: 13px;
        color: #374151;
      }

      .category-percent {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
      }

      /* Table */
      .view-btn {
        background-color: #39a900;
        border-color: #39a900;
      }

      .view-btn:hover {
        background-color: #2d8600;
        border-color: #2d8600;
      }

      :host ::ng-deep .custom-table .p-datatable-thead > tr > th {
        background: #f8f9fa;
        color: #495057;
        font-weight: 600;
        font-size: 13px;
        padding: 12px;
        border-bottom: 2px solid #39a900;
      }

      :host ::ng-deep .custom-table .p-datatable-tbody > tr > td {
        padding: 12px;
        font-size: 13px;
        color: #374151;
      }

      .table-cell.id-cell {
        font-weight: 600;
        color: #1f2937;
      }

      .empty-message {
        text-align: center;
        padding: 30px;
        color: #6b7280;
      }

      .empty-message i {
        display: block;
        font-size: 32px;
        margin-bottom: 8px;
        color: #9ca3af;
      }

      /* Status Badges */
      .status-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-pending {
        background-color: #fef3c7;
        color: #d97706;
      }

      .status-aprobada {
        background-color: #d1fae5;
        color: #059669;
      }

      .status-rechazada {
        background-color: #fee2e2;
        color: #dc2626;
      }

      :host ::ng-deep .p-skeleton {
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  totalUsuarios = signal<number>(0);
  totalProductos = signal<number>(0);
  solicitudesPendientes = signal<number>(0);
  totalInventario = signal<number>(0);
  ultimasSolicitudes = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading.set(true);

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

    forkJoin({
      usuarios: reqUsuarios,
      productos: reqProductos,
      solicitudes: reqSolicitudes,
      inventario: reqInventario
    }).subscribe({
      next: ({ usuarios, productos, solicitudes, inventario }) => {
        this.totalUsuarios.set(usuarios.length);
        this.totalProductos.set(productos.length);
        
        // Filtrar solicitudes pendientes
        const pendientes = solicitudes.filter((s: any) => {
          const estado = s.estadoSol || s.estado;
          return estado === 'PENDIENTE';
        }).length;
        this.solicitudesPendientes.set(pendientes);
        
        // Últimas 5 solicitudes
        const sorted = [...solicitudes].sort((a: any, b: any) => {
          const dateA = new Date(a.fechaSol || a.fecha || a.createdAt || 0).getTime();
          const dateB = new Date(b.fechaSol || b.fecha || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        this.ultimasSolicitudes.set(sorted.slice(0, 5));

        // Sumar cantidades de inventario (asumimos campo cantidad)
        const totalInv = inventario.reduce((acc: number, curr: any) => acc + (Number(curr.cantidad) || Number(curr.stock) || 0), 0);
        this.totalInventario.set(totalInv);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' {
    if (!estado) return 'info';
    const st = estado.toUpperCase();
    if (st === 'APROBADA' || st === 'APROBADO' || st === 'ENTREGADO') return 'success';
    if (st === 'PENDIENTE') return 'warn';
    if (st === 'RECHAZADA' || st === 'RECHAZADO' || st === 'CANCELADO') return 'danger';
    return 'info';
  }
}
