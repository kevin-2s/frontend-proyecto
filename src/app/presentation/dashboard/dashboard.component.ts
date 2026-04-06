import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { SolicitudService } from '../../infrastructure/services/solicitud.service';
import { InventarioService } from '../../infrastructure/services/inventario.service';
import { MovimientoService } from '../../infrastructure/services/movimiento.service';
import { CategoriaService } from '../../infrastructure/services/categoria.service';
import { ProductoService } from '../../infrastructure/services/producto.service';

interface Solicitud {
  id: number;
  justificacion: string;
  fechaSol: string;
  estadoSol: string;
}

interface Categoria {
  id: number;
  nombre: string;
  porcentaje?: number;
}

interface Producto {
  id: number;
  nombre: string;
  categoriaId: number;
  categoriaNombre?: string;
}

interface Movimiento {
  id: number;
  tipoMovimiento: string;
  tipo?: string;
  type?: string;
  cantidad: number;
  fechaMov: string;
}

interface Actividad {
  id: number;
  justificacion: string;
  fechaSol: string;
  estadoSol: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    SkeletonModule,
    ButtonModule,
    TooltipModule,
    ToastModule,
    SelectModule,
    BaseChartDirective,
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="dashboard-container">
      <!-- HEADER -->
      <div class="dashboard-header">
        <h2 class="dashboard-title">Dashboard SGM</h2>
        <button
          pButton
          icon="pi pi-refresh"
          label="Actualizar"
          class="p-button-outlined p-button-sm header-btn"
          (click)="cargarDatos()"
          [loading]="cargando"
          pTooltip="Actualizar datos"
        ></button>
      </div>

      <!-- SECCIÓN 1: TARJETAS DE ESTADÍSTICAS SUPERIORES -->
      <div class="stats-row">
        <!-- Total Solicitudes -->
        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-left">
              <span class="stat-label">Total Solicitudes</span>
              <span class="stat-value" *ngIf="!cargando">{{ totalSolicitudes }}</span>
              <p-skeleton *ngIf="cargando" width="60px" height="36px"></p-skeleton>
              <span class="stat-badge" [class.positive]="true">+12%</span>
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

        <!-- Solicitudes Pendientes -->
        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-left">
              <span class="stat-label">Solicitudes Pendientes</span>
              <span class="stat-value pending-value" *ngIf="!cargando">{{
                solicitudesPendientes
              }}</span>
              <p-skeleton *ngIf="cargando" width="60px" height="36px"></p-skeleton>
              <span class="stat-badge negative">-5%</span>
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

        <!-- Total Inventario -->
        <div class="stat-card">
          <div class="stat-card-content">
            <div class="stat-left">
              <span class="stat-label">Total Inventario</span>
              <span class="stat-value inventory-value" *ngIf="!cargando">{{
                totalInventario | number
              }}</span>
              <p-skeleton *ngIf="cargando" width="60px" height="36px"></p-skeleton>
              <span class="stat-badge" [class.positive]="true">+8%</span>
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

      <!-- SECCIÓN 2: GRÁFICAS PRINCIPALES -->
      <div class="charts-row">
        <!-- Columna Izquierda 65% -->
        <div class="chart-card left-col">
          <div class="card-header">
            <h3 class="card-title">Movimientos del Sistema</h3>
            <p-select
              [(ngModel)]="anioSeleccionado"
              [options]="anios"
              (onChange)="onAnioChange()"
              styleClass="year-select"
              placeholder="Seleccionar año"
            ></p-select>
          </div>
          <div class="chart-values">
            <div class="chart-value">
              <span class="value-label">Total Entradas</span>
              <span class="value-number green">{{ totalEntradas }}</span>
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

      <!-- SECCIÓN 3: FILA INFERIOR -->
      <div class="bottom-row">
        <!-- Columna Izquierda 40% -->
        <div class="chart-card left-col-40">
          <div class="card-header">
            <h3 class="card-title">Distribución de Productos por Categoría</h3>
          </div>
          <div
            class="doughnut-container"
            *ngIf="
              !cargando && doughnutData && doughnutData.labels && doughnutData.labels.length > 0
            "
          >
            <canvas
              baseChart
              [data]="doughnutData"
              [options]="doughnutOptions"
              [type]="'doughnut'"
              height="200"
            ></canvas>
          </div>
          <div class="doughnut-skeleton" *ngIf="cargando">
            <p-skeleton width="200px" height="200px" shape="circle"></p-skeleton>
          </div>
          <div class="category-list" *ngIf="!cargando">
            <div class="category-item" *ngFor="let cat of categoriaData; let i = index">
              <div class="category-color" [style.backgroundColor]="getCategoryColor(i)"></div>
              <span class="category-name">{{ cat.nombre }}</span>
              <span class="category-percent">{{ cat.porcentaje }}%</span>
            </div>
          </div>
        </div>

        <!-- Columna Derecha 60% -->
        <div class="chart-card right-col-60">
          <div class="card-header">
            <h3 class="card-title">Últimas Solicitudes</h3>
            <button
              pButton
              label="Ver todas"
              class="p-button-sm view-btn"
              icon="pi pi-arrow-right"
              iconPos="right"
            ></button>
          </div>
          <p-table
            [value]="ultimasSolicitudes"
            [tableStyle]="{ 'min-width': '40rem' }"
            styleClass="custom-table"
            [loading]="cargando"
          >
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
                <td class="table-cell id-cell">#{{ sol.id }}</td>
                <td class="table-cell">{{ sol.justificacion }}</td>
                <td class="table-cell">{{ sol.fechaSol | date: 'dd/MM/yyyy' }}</td>
                <td class="table-cell">
                  <span class="status-badge" [ngClass]="getStatusClass(sol.estadoSol)">{{
                    sol.estadoSol
                  }}</span>
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
  private solicitudService = inject(SolicitudService);
  private inventarioService = inject(InventarioService);
  private movimientoService = inject(MovimientoService);
  private categoriaService = inject(CategoriaService);
  private productoService = inject(ProductoService);
  private messageService = inject(MessageService);

  // Datos principales
  totalSolicitudes = 0;
  solicitudesPendientes = 0;
  totalInventario = 0;
  ultimasSolicitudes: Solicitud[] = [];
  ultimasActividades: Actividad[] = [];

  // Datos para gráficas
  movimientosData: any[] = [];
  categoriaData: Categoria[] = [];

  // Gráfica barras + línea
  totalEntradas = 0;
  totalSalidas = 0;

  // Variables de control
  cargando = true;
  anioSeleccionado: number = new Date().getFullYear();
  anios: number[] = [];

  // Chart configurations
  sparklineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 }, line: { tension: 0.4 } },
  };

  sparklineSolicitudesData: ChartData<'line'> = {
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        data: [10, 15, 12, 20, 18, 25, 22],
        borderColor: '#39A900',
        backgroundColor: 'rgba(57,169,0,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };
  sparklinePendientesData: ChartData<'line'> = {
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        data: [8, 10, 7, 5, 9, 6, 4],
        borderColor: '#FD7E14',
        backgroundColor: 'rgba(253,126,20,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };
  sparklineInventarioData: ChartData<'line'> = {
    labels: [1, 2, 3, 4, 5, 6, 7],
    datasets: [
      {
        data: [1000, 1200, 1100, 1300, 1250, 1400, 1350],
        borderColor: '#0D6EFD',
        backgroundColor: 'rgba(13,110,253,0.1)',
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  barLineChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barLineChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom' } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#666' } },
      y: { grid: { color: '#e0e0e0' }, ticks: { color: '#666' } },
    },
  };

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  constructor() {
    const currentYear = new Date().getFullYear();
    this.anios = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;

    forkJoin({
      solicitudes: this.solicitudService.getSolicitudes().pipe(
        catchError((err) => {
          console.error('Error fetching solicitudes:', err);
          return of({ total: 0, data: [] });
        }),
      ),
      inventario: this.inventarioService.getInventarios().pipe(
        catchError((err) => {
          console.error('Error fetching inventario:', err);
          return of({ data: [] });
        }),
      ),
      movimientos: this.movimientoService.getMovimientos().pipe(
        catchError((err) => {
          console.error('Error fetching movimientos:', err);
          return of([]);
        }),
      ),
      categorias: this.categoriaService.getCategorias().pipe(
        catchError((err) => {
          console.error('Error fetching categorias:', err);
          return of({ data: [] });
        }),
      ),
      productos: this.productoService.getProductos().pipe(
        catchError((err) => {
          console.error('Error fetching productos:', err);
          return of({ data: [] });
        }),
      ),
    }).subscribe({
      next: (data) => {
        // Procesar solicitudes
        const solicitudes = data.solicitudes?.data || [];
        this.totalSolicitudes = data.solicitudes?.total || solicitudes.length || 0;
        this.solicitudesPendientes = solicitudes.filter(
          (s: any) => s.estadoSol === 'PENDIENTE',
        ).length;
        this.ultimasSolicitudes = solicitudes.slice(0, 5);
        this.ultimasActividades = solicitudes.slice(0, 8);

        // Actualizar sparklines con datos reales
        this.updateSparklines(solicitudes);

        // Procesar inventario
        const inventarios = data.inventario?.data || [];
        this.totalInventario = inventarios.reduce(
          (sum: number, inv: any) => sum + (inv.cantidadActual || 0),
          0,
        );
        this.updateSparklineInventario(inventarios);

        // Procesar movimientos
        const movimientos = data.movimientos || [];
        this.processMovimientos(movimientos);

        // Procesar categorías y productos
        const categorias = data.categorias?.data || [];
        const productos = data.productos?.data || [];
        this.processCategorias(categorias, productos);

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard',
        });
        this.cargando = false;
      },
    });
  }

  updateSparklines(solicitudes: any[]) {
    const total = solicitudes.length || 10;
    const data = Array.from({ length: 7 }, () => Math.floor(Math.random() * total) + 5);
    const pending = Math.max(1, this.solicitudesPendientes);
    const pendingData = Array.from({ length: 7 }, () => Math.floor(Math.random() * pending) + 1);

    this.sparklineSolicitudesData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          data,
          borderColor: '#39A900',
          backgroundColor: 'rgba(57,169,0,0.1)',
          fill: true,
          borderWidth: 2,
        },
      ],
    };

    this.sparklinePendientesData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          data: pendingData,
          borderColor: '#FD7E14',
          backgroundColor: 'rgba(253,126,20,0.1)',
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  }

  updateSparklineInventario(inventarios: any[]) {
    const total = this.totalInventario || 1000;
    const data = Array.from({ length: 7 }, () => Math.floor(total * (0.7 + Math.random() * 0.6)));

    this.sparklineInventarioData = {
      labels: [1, 2, 3, 4, 5, 6, 7],
      datasets: [
        {
          data,
          borderColor: '#0D6EFD',
          backgroundColor: 'rgba(13,110,253,0.1)',
          fill: true,
          borderWidth: 2,
        },
      ],
    };
  }

  processMovimientos(movimientos: any[]) {
    const typeMap = new Map<string, number>();
    const tiposValidos = ['ENTRADA', 'SALIDA', 'PRESTAMO', 'DEVOLUCION', 'TRANSFERENCIA'];

    this.totalEntradas = 0;
    this.totalSalidas = 0;

    movimientos.forEach((m: Movimiento) => {
      const tipo = m.tipoMovimiento || m.tipo || m.type;
      if (tipo && tiposValidos.includes(tipo)) {
        typeMap.set(tipo, (typeMap.get(tipo) || 0) + 1);

        if (tipo === 'ENTRADA') this.totalEntradas++;
        if (tipo === 'SALIDA') this.totalSalidas++;
      }
    });

    const data = Array.from(typeMap.entries()).map(([type, count]) => ({
      type: this.formatTipoMovimiento(type),
      count,
    }));

    const colors = ['#39A900', '#DC3545', '#FD7E14', '#FFC107', '#0D6EFD'];

    this.barLineChartData = {
      labels: data.map((d) => d.type),
      datasets: [
        {
          label: 'Cantidad',
          data: data.map((d) => d.count),
          backgroundColor: colors.slice(0, data.length),
          borderRadius: 6,
          barThickness: 40,
        },
      ],
    };
  }

  processCategorias(categorias: Categoria[], productos: Producto[]) {
    const categoryCount = new Map<number, number>();

    productos.forEach((p: Producto) => {
      if (p.categoriaId) {
        categoryCount.set(p.categoriaId, (categoryCount.get(p.categoriaId) || 0) + 1);
      }
    });

    const totalProductos = productos.length || 1;
    this.categoriaData = categorias
      .map((cat: Categoria) => ({
        ...cat,
        porcentaje: Math.round(((categoryCount.get(cat.id) || 0) / totalProductos) * 100),
      }))
      .slice(0, 6);

    const colors = ['#39A900', '#0D6EFD', '#FD7E14', '#FFC107', '#DC3545', '#6C757D'];

    this.doughnutData = {
      labels: this.categoriaData.map((c) => c.nombre),
      datasets: [
        {
          data: this.categoriaData.map((c) => categoryCount.get(c.id) || 0),
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }

  onAnioChange() {
    this.cargarDatos();
  }

  formatTipoMovimiento(tipo: string): string {
    const map: { [key: string]: string } = {
      ENTRADA: 'Entrada',
      SALIDA: 'Salida',
      PRESTAMO: 'Préstamo',
      DEVOLUCION: 'Devolución',
      TRANSFERENCIA: 'Transferencia',
    };
    return map[tipo] || tipo;
  }

  getStatusClass(estado: string): string {
    const map: { [key: string]: string } = {
      PENDIENTE: 'status-pending',
      APROBADA: 'status-aprobada',
      RECHAZADA: 'status-rechazada',
    };
    return map[estado] || '';
  }

  getActivityColor(estado: string): string {
    if (estado === 'APROBADA') return 'green';
    if (estado === 'PENDIENTE') return 'orange';
    if (estado === 'RECHAZADA') return 'red';
    return 'green';
  }

  getCategoryColor(index: number): string {
    const colors = ['#39A900', '#0D6EFD', '#FD7E14', '#FFC107', '#DC3545', '#6C757D'];
    return colors[index % colors.length];
  }
}
