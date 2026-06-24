import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonModule, ChartModule],
  styles: [`
    :host { display: block; }
  `],
  template: `
    <div class="dashboard-wrap">

      <div class="db-hero">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; position:relative; z-index:1;">
          <div>
            <h2 class="db-hero-title">Panel de Control</h2>
            <p class="db-hero-sub">Sistema de Gestión de Materiales de Formación · SENA</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-top:1.75rem; position:relative; z-index:1;">
          <div *ngFor="let kpi of heroKpis" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); border-radius:14px; padding:0.9rem 1rem;">
            <p style="color:rgba(255,255,255,0.55); font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 0.25rem;">{{ kpi.label }}</p>
            <ng-container *ngIf="loading(); else kpiVal">
              <p-skeleton width="3rem" height="1.5rem" styleClass="opacity-40"></p-skeleton>
            </ng-container>
            <ng-template #kpiVal>
              <p style="color:#fff; font-size:1.6rem; font-weight:900; margin:0; line-height:1;">{{ kpi.value() }}</p>
            </ng-template>
            <p style="color:rgba(255,255,255,0.45); font-size:0.68rem; margin:0.2rem 0 0;">{{ kpi.sub }}</p>
          </div>
        </div>
      </div>
      <div class="db-stats-grid" style="margin-bottom:2rem;">

        <div class="db-stat-card" *ngFor="let card of statCards">
          <div class="stat-trend" [style.background]="card.trendBg" [style.color]="card.trendColor">
            <i [class]="card.trendIcon" style="font-size:0.65rem;"></i> {{ card.trend }}
          </div>
          <div class="stat-icon-wrap" [style.background]="card.iconBg">
            <i [class]="'pi ' + card.icon" [style.color]="card.iconColor"></i>
          </div>
          <p class="stat-label">{{ card.label }}</p>
          <ng-container *ngIf="loading(); else statVal">
            <p-skeleton width="4rem" height="2.5rem" styleClass="mb-3"></p-skeleton>
          </ng-container>
          <ng-template #statVal>
            <h3 class="stat-value" [style.color]="card.valueColor">{{ card.value() }}</h3>
          </ng-template>
          <div class="stat-bar">
            <div class="stat-bar-fill" [style.width]="getBarWidth(card.value(), card.limit)" [style.background]="card.iconColor"></div>
          </div>
        </div>

      </div>

      <p class="db-section-title">Análisis de Inventario y Trazabilidad de Materiales</p>
      <div class="db-charts-grid">

        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Clasificación de Materiales (Consumo vs Devolutivo)
          </p>
          <ng-container *ngIf="loading(); else chart1">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart1>
            <div *ngIf="chartStockData(); else noData1">
              <p-chart type="doughnut" [data]="chartStockData()" [options]="chartStockOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData1>
              <div class="db-empty"><i class="pi pi-chart-bar"></i><span>Sin datos de inventario disponibles</span></div>
            </ng-template>
          </ng-template>
        </div>

        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Consumo de Materiales por Ficha de Formación
          </p>
          <ng-container *ngIf="loading(); else chart2">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart2>
            <div *ngIf="chartSitiosData(); else noData2">
              <p-chart type="bar" [data]="chartSitiosData()" [options]="chartSitiosOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData2>
              <div class="db-empty"><i class="pi pi-pie-chart"></i><span>Sin datos de fichas disponibles</span></div>
            </ng-template>
          </ng-template>
        </div>

        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Trazabilidad de Movimientos (Entradas vs Salidas)
          </p>
          <ng-container *ngIf="loading(); else chart3">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart3>
            <div *ngIf="chartSolicitudesData(); else noData3">
              <p-chart type="pie" [data]="chartSolicitudesData()" [options]="chartSolicitudesOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData3>
              <div class="db-empty"><i class="pi pi-inbox"></i><span>Sin movimientos registrados</span></div>
            </ng-template>
          </ng-template>
        </div>

        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Alerta de Stock Crítico (Materiales Bajo Mínimo)
          </p>
          <ng-container *ngIf="loading(); else chart4">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart4>
            <div *ngIf="chartVencimientoData(); else noData4">
              <p-chart type="bar" [data]="chartVencimientoData()" [options]="chartVencimientoOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData4>
              <div class="db-empty"><i class="pi pi-calendar"></i><span>Sin alertas de bajo stock</span></div>
            </ng-template>
          </ng-template>
        </div>

      </div>

      <p class="db-section-title" style="margin-top:2rem;">
       Historial de Trazabilidad de Materiales
      </p>
      <div class="db-recent-movements-card" style="margin-bottom:2rem;">
        <ng-container *ngIf="loading(); else recentTable">
          <p-skeleton width="100%" height="150px"></p-skeleton>
        </ng-container>
        <ng-template #recentTable>
          <div class="table-responsive" style="overflow-x:auto;">
            <table class="db-recent-table" style="width:100%; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid #f1f5f9; background:#fafafa;">
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Fecha</th>
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Material / Producto</th>
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Código/SKU</th>
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Tipo</th>
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Responsable</th>
                  <th style="padding:0.75rem 1rem; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em;">Observación</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let mov of recentMovements()" style="border-bottom:1px solid #f8fafc; transition:background 0.2s;" class="hover:bg-slate-50">
                  <td style="padding:0.9rem 1rem; font-size:12.5px; color:#475569; white-space:nowrap;">
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <i class="pi pi-calendar-times" style="font-size:11px; color:#94a3b8;"></i>
                      <span>{{ mov.fecha | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </div>
                  </td>
                  <td style="padding:0.9rem 1rem; font-size:13px; font-weight:600; color:#1e293b;">
                    {{ mov.producto }}
                  </td>
                  <td style="padding:0.9rem 1rem; font-size:12px; font-family:monospace; color:#475569;">
                    <span style="background:#f1f5f9; padding:0.15rem 0.4rem; border-radius:6px;">{{ mov.sku }}</span>
                  </td>
                  <td style="padding:0.9rem 1rem; font-size:11px; font-weight:700;">
                    <span [ngClass]="getTipoMovClass(mov.tipo)" style="display:inline-flex; align-items:center; gap:0.25rem; padding:0.2rem 0.6rem; border-radius:99px;">
                      <i [class]="getTipoMovIcon(mov.tipo)" style="font-size:10px;"></i>
                      {{ mov.tipo }}
                    </span>
                  </td>
                  <td style="padding:0.9rem 1rem; font-size:12.5px; color:#1e293b;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span style="width:24px; height:24px; border-radius:50%; background:#e2e8f0; color:#475569; display:flex; align-items:center; justify-content:center; font-size:9.5px; font-weight:700;">
                        {{ getUserInitials(mov.usuario) }}
                      </span>
                      <span>{{ mov.usuario }}</span>
                    </div>
                  </td>
                  <td style="padding:0.9rem 1rem; font-size:12px; color:#64748b; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" [title]="mov.observacion">
                    {{ mov.observacion }}
                  </td>
                </tr>
                <tr *ngIf="recentMovements().length === 0">
                  <td colspan="6" style="padding:2rem; text-align:center; color:#94a3b8; font-size:13px;">
                    <i class="pi pi-history" style="font-size:1.5rem; margin-bottom:0.5rem; display:block;"></i>
                    No hay movimientos registrados para trazabilidad.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-template>
      </div>

      <p class="db-section-title" style="margin-top:0.5rem;">Resumen de Control de Materiales</p>
      <div class="db-bottom-grid">

        <!-- Resumen de Inventario de Materiales -->
        <div class="db-quick-card">
          <p style="font-size:0.8rem; font-weight:800; color:#1e293b; margin:0 0 1rem;">
            Resumen de Inventario de Materiales
          </p>
          <div class="quick-item" *ngFor="let item of resumenInventario">
            <div class="quick-left">
              <div class="quick-icon" [style.background]="item.bg" [style.color]="item.color">
                <i [class]="'pi ' + item.icon"></i>
              </div>
              <div>
                <p class="quick-label">{{ item.label }}</p>
                <p class="quick-sub">{{ item.desc }}</p>
              </div>
            </div>
            <ng-container *ngIf="loading(); else quickVal">
              <p-skeleton width="3rem" height="1.2rem"></p-skeleton>
            </ng-container>
            <ng-template #quickVal>
              <span class="quick-value">{{ item.value() }}</span>
            </ng-template>
          </div>
        </div>

        <!-- Flujo de Trazabilidad de Materiales -->
        <div class="db-quick-card">
          <p style="font-size:0.8rem; font-weight:800; color:#1e293b; margin:0 0 1rem;">
            Flujo de Trazabilidad de Materiales
          </p>
          <div class="quick-item" *ngFor="let stat of flujoTrazabilidad">
            <div class="quick-left">
              <div class="quick-icon" [style.background]="stat.bg" [style.color]="stat.color">
                <i [class]="'pi ' + stat.icon"></i>
              </div>
              <div>
                <p class="quick-label">{{ stat.label }}</p>
                <p class="quick-sub">{{ stat.desc }}</p>
              </div>
            </div>
            <ng-container *ngIf="loading(); else statQuick">
              <p-skeleton width="3rem" height="1.2rem"></p-skeleton>
            </ng-container>
            <ng-template #statQuick>
              <span class="quick-value">{{ stat.value() }}</span>
            </ng-template>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  loading = signal<boolean>(true);
  ultimaActualizacion = '—';

  
  totalUsuarios = signal<number>(0);
  totalProductos = signal<number>(0);
  totalSolicitudes = signal<number>(0);
  solicitudesPendientes = signal<number>(0);
  totalInventario = signal<number>(0);
  totalSitios = signal<number>(0);
  totalFichas = signal<number>(0);
  totalCategorias = signal<number>(0);
  totalMovimientos = signal<number>(0);
  totalAsignaciones = signal<number>(0);
  totalBajoStock = signal<number>(0);
  totalConsumo = signal<number>(0);
  totalDevolutivo = signal<number>(0);
  totalItems = signal<number>(0);

  
  chartStockData = signal<any>(null);
  chartStockOptions = signal<any>(null);
  chartVencimientoData = signal<any>(null);
  chartVencimientoOptions = signal<any>(null);
  chartSitiosData = signal<any>(null);
  chartSitiosOptions = signal<any>(null);
  chartSolicitudesData = signal<any>(null);
  chartSolicitudesOptions = signal<any>(null);

  recentMovements = signal<any[]>([]);

  getTipoMovClass(tipo: string): string {
    const t = (tipo || '').toUpperCase();
    if (t.includes('ENTRADA') || t.includes('DEVOLU')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (t.includes('SALIDA') || t.includes('PRESTAMO')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }

  getTipoMovIcon(tipo: string): string {
    const t = (tipo || '').toUpperCase();
    if (t.includes('ENTRADA') || t.includes('DEVOLU')) return 'pi pi-arrow-down-left';
    if (t.includes('SALIDA') || t.includes('PRESTAMO')) return 'pi pi-arrow-up-right';
    return 'pi pi-info-circle';
  }

  getUserInitials(name: string): string {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  heroKpis = [
    { label: 'Materiales', value: this.totalProductos, sub: 'En catálogo' },
    { label: 'Trazabilidad', value: this.totalMovimientos, sub: 'Movimientos registrados' },
    { label: 'Solicitudes', value: this.totalSolicitudes, sub: 'Total registradas' },
    { label: 'Asignaciones', value: this.totalAsignaciones, sub: 'Entregados a fichas' },
  ];

  statCards = [
    {
      label: 'Movimientos de Trazabilidad', value: this.totalMovimientos, limit: 150,
      icon: 'pi-history', iconColor: '#6366f1', iconBg: '#ede9fe',
      valueColor: '#3730a3',
      trend: 'Registrados', trendBg: '#ede9fe', trendColor: '#6366f1', trendIcon: 'pi pi-sync',
    },
    {
      label: 'Solicitudes Pendientes', value: this.solicitudesPendientes, limit: 20,
      icon: 'pi-clock', iconColor: '#f59e0b', iconBg: '#fffbeb',
      valueColor: '#b45309',
      trend: 'Pendientes', trendBg: '#fffbeb', trendColor: '#d97706', trendIcon: 'pi pi-exclamation-circle',
    },
    {
      label: 'Alertas de Stock Crítico', value: this.totalBajoStock, limit: 10,
      icon: 'pi-exclamation-triangle', iconColor: '#ef4444', iconBg: '#fef2f2',
      valueColor: '#991b1b',
      trend: 'Alertas', trendBg: '#fef2f2', trendColor: '#dc2626', trendIcon: 'pi pi-bell',
    },
    {
      label: 'Asignaciones de Fichas', value: this.totalAsignaciones, limit: 50,
      icon: 'pi-id-card', iconColor: '#10b981', iconBg: '#d1fae5',
      valueColor: '#065f46',
      trend: 'Entregas', trendBg: '#d1fae5', trendColor: '#059669', trendIcon: 'pi pi-check-circle',
    },
  ];


  resumenInventario = [
    { label: 'Materiales de Consumo', desc: 'Insumos y materiales gastables', icon: 'pi-box', bg: '#f0fdf4', color: '#16a34a', value: this.totalConsumo },
    { label: 'Materiales Devolutivos', desc: 'Herramientas y equipos duraderos', icon: 'pi-cog', bg: '#eff6ff', color: '#2563eb', value: this.totalDevolutivo },
    { label: 'Total de Ítems Físicos', desc: 'Unidades físicas en inventario', icon: 'pi-database', bg: '#fdf4ff', color: '#9333ea', value: this.totalItems },
    { label: 'Categorías de Material', desc: 'Clasificación de productos', icon: 'pi-tag', bg: '#fff7ed', color: '#ea580c', value: this.totalCategorias },
  ];


  flujoTrazabilidad = [
    { label: 'Movimientos de Trazabilidad', desc: 'Entradas, salidas y préstamos', icon: 'pi-history', bg: '#f0fdf4', color: '#16a34a', value: this.totalMovimientos },
    { label: 'Asignaciones de Fichas', desc: 'Material asignado a grupos', icon: 'pi-id-card', bg: '#eff6ff', color: '#2563eb', value: this.totalAsignaciones },
    { label: 'Solicitudes Registradas', desc: 'Pedidos totales de materiales', icon: 'pi-inbox', bg: '#fdf4ff', color: '#9333ea', value: this.totalSolicitudes },
    { label: 'Alertas de Stock Crítico', desc: 'Materiales por debajo del mínimo', icon: 'pi-exclamation-triangle', bg: '#fff5f5', color: '#e53e3e', value: this.totalBajoStock },
    { label: 'Solicitudes Pendientes', desc: 'Requieren atención inmediata', icon: 'pi-clock', bg: '#fffbeb', color: '#d97706', value: this.solicitudesPendientes },
  ];

  ngOnInit() { this.cargarDatos(); }

  getBarWidth(val: number, limit: number): string {
    if (!val) return '0%';
    const pct = Math.min(100, (val / limit) * 100);
    return `${pct}%`;
  }

  cargarDatos() {
    this.loading.set(true);

    const req = (endpoint: string) =>
      this.apiService.get<any>(endpoint).pipe(
        map(res => Array.isArray(res) ? res : (res?.data || [])),
        catchError(() => of([]))
      );

    forkJoin({
      usuarios:    req('/usuarios'),
      productos:   req('/productos'),
      solicitudes: req('/solicitudes'),
      inventario:  req('/inventario'),
      items:       req('/items'),
      sitios:      req('/sitios'),
      fichas:      req('/fichas'),
      categorias:  req('/categorias'),
      movimientos:  req('/movimientos'),
      asignaciones: req('/asignaciones'),
    }).subscribe({
      next: ({ usuarios, productos, solicitudes, inventario, items, sitios, fichas, categorias, movimientos, asignaciones }) => {

        this.totalUsuarios.set(usuarios.length);
        this.totalProductos.set(productos.length);
        this.totalSolicitudes.set(solicitudes.length);
        this.totalSitios.set(sitios.length);
        this.totalFichas.set(fichas.length);
        this.totalCategorias.set(categorias.length);
        this.totalMovimientos.set(movimientos.length);
        this.totalAsignaciones.set(asignaciones.length);
        this.totalItems.set(items.length);

        const pendientes = solicitudes.filter((s: any) => {
          const e = (s.estadoSol || s.estado || '').toUpperCase();
          return e === 'PENDIENTE';
        }).length;
        this.solicitudesPendientes.set(pendientes);

      
        this.totalInventario.set(inventario.length);

        this.ultimaActualizacion = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });


        if (productos.length > 0) {
          let consumo = 0;
          let devolutivo = 0;
          productos.forEach((p: any) => {
            const t = (p.tipo_material || '').toUpperCase();
            if (t.includes('CONSUMO')) consumo++;
            else if (t.includes('DEVOLUTIVO')) devolutivo++;
            else consumo++;
          });
          this.totalConsumo.set(consumo);
          this.totalDevolutivo.set(devolutivo);

          this.chartStockData.set({
            labels: ['Materiales de Consumo', 'Materiales Devolutivos'],
            datasets: [{
              data: [consumo, devolutivo],
              backgroundColor: ['#39A900', '#2563eb'],
              borderWidth: 2,
              borderColor: '#fff'
            }]
          });

          this.chartStockOptions.set({
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
              tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} productos` } }
            },
            cutout: '65%'
          });
        } else {
          this.chartStockData.set(null);
        }


        const asignacionesFicha: any = {};
        asignaciones.forEach((asg: any) => {
          const fId = asg.id_ficha ?? asg.ficha?.id;
          if (fId != null) {
            asignacionesFicha[fId] = (asignacionesFicha[fId] || 0) + (Number(asg.cantidad) || 0);
          }
        });

        const fichasLabels = Object.keys(asignacionesFicha).map(id => {
          const f = fichas.find((fi: any) => String(fi.id_ficha ?? fi.id) === String(id));
          return f ? `Ficha ${f.numero_ficha || f.codigo}` : `Ficha #${id}`;
        });
        const fichasVals = Object.values(asignacionesFicha);

        if (fichasLabels.length > 0) {
          this.chartSitiosData.set({
            labels: fichasLabels.slice(0, 6),
            datasets: [{
              label: 'Cantidad entregada',
              data: fichasVals.slice(0, 6),
              backgroundColor: 'rgba(59, 130, 246, 0.85)',
              borderRadius: 8,
              hoverBackgroundColor: '#2563eb',
            }]
          });

          this.chartSitiosOptions.set({
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} unidades` } }
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#f8fafc' } },
              x: { grid: { display: false } }
            }
          });
        } else {
          this.chartSitiosData.set(null);
        }

        const movMap: any = {};
        movimientos.forEach((m: any) => {
          const name = (m.tipoMovimiento?.nombre || m.tipo || 'ENTRADA').toUpperCase();
          movMap[name] = (movMap[name] || 0) + (Number(m.cantidad) || 1);
        });

        const movLabels = Object.keys(movMap);
        const movVals = Object.values(movMap);

        if (movLabels.length > 0) {
          const movColorMap: any = {
            ENTRADA: '#10b981', ENTRADAS: '#10b981',
            SALIDA: '#ef4444', SALIDAS: '#ef4444',
            PRESTAMO: '#f59e0b', PRÉSTAMOS: '#f59e0b',
            DEVOLUCION: '#3b82f6', DEVOLUCIONES: '#3b82f6'
          };

          this.chartSolicitudesData.set({
            labels: movLabels,
            datasets: [{
              data: movVals,
              backgroundColor: movLabels.map(l => movColorMap[l.toUpperCase()] || '#6366f1'),
              borderWidth: 2,
              borderColor: '#fff'
            }]
          });

          this.chartSolicitudesOptions.set({
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } }
            }
          });
        } else {
          this.chartSolicitudesData.set(null);
        }


        const bajoStockList: any[] = [];
        productos.forEach((p: any) => {
          const itemsDeProd = items.filter((it: any) => (it.id_producto ?? it.producto?.id_producto) === p.id_producto);
          const totalActual = itemsDeProd.length;
          if (totalActual <= (p.stock_minimo || 5)) {
            bajoStockList.push({ nombre: p.nombre, actual: totalActual, minimo: p.stock_minimo || 5 });
          }
        });

        this.totalBajoStock.set(bajoStockList.length);

        const bajoStockLabels = bajoStockList.map(b => b.nombre);
        const bajoStockVals = bajoStockList.map(b => b.actual);
        const bajoStockMins = bajoStockList.map(b => b.minimo);

        if (bajoStockLabels.length > 0) {
          this.chartVencimientoData.set({
            labels: bajoStockLabels.slice(0, 6),
            datasets: [
              {
                label: 'Stock Actual',
                data: bajoStockVals.slice(0, 6),
                backgroundColor: '#ef4444',
                borderRadius: 6,
              },
              {
                label: 'Stock Mínimo',
                data: bajoStockMins.slice(0, 6),
                backgroundColor: '#cbd5e1',
                borderRadius: 6,
              }
            ]
          });

          this.chartVencimientoOptions.set({
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#f8fafc' } },
              x: { grid: { display: false } }
            }
          });
        } else {
          this.chartVencimientoData.set(null);
        }


        const sortedMovs = [...movimientos].sort((a: any, b: any) => {
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        });

        const mappedMovs = sortedMovs.slice(0, 5).map((m: any) => {
          const itemDb = items.find((it: any) => it.id_item === m.id_item || it.id_item === m.item?.id_item);
          const prodId = itemDb?.id_producto ?? itemDb?.producto?.id_producto ?? m.item?.id_producto ?? m.item?.producto?.id_producto;
          const prodDb = productos.find((p: any) => p.id_producto === prodId);
          const productName = prodDb?.nombre ?? m.item?.producto?.nombre ?? `Ítem #${m.id_item}`;
          const skuVal = itemDb?.codigo_sku ?? m.item?.codigo_sku ?? '—';

          return {
            fecha: m.fecha,
            producto: productName,
            sku: skuVal,
            tipo: m.tipoMovimiento?.nombre || m.tipo || 'Entrada',
            usuario: m.usuario?.nombre || `Usuario #${m.id_usuario}`,
            observacion: m.observacion || 'Sin observación'
          };
        });

        this.recentMovements.set(mappedMovs);

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}