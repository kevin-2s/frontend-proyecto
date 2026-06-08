import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ApiService } from '../../core/services/api.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonModule, ChartModule],
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

        <!-- Mini KPIs en el hero -->
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

      <!-- ══════════ STAT CARDS ══════════ -->
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

      <!-- ══════════ GRÁFICAS ══════════ -->
      <p class="db-section-title"> Análisis de Inventario y Solicitudes</p>
      <div class="db-charts-grid">

        <!-- Gráfica 1: Stock por productos -->
        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Items Registrados por Producto
          </p>
          <ng-container *ngIf="loading(); else chart1">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart1>
            <div *ngIf="chartStockData(); else noData1">
              <p-chart type="bar" [data]="chartStockData()" [options]="chartStockOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData1>
              <div class="db-empty"><i class="pi pi-chart-bar"></i><span>Sin datos de inventario disponibles</span></div>
            </ng-template>
          </ng-template>
        </div>

        <!-- Gráfica 2: Distribución por sitio -->
        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Materiales por Sitio / Ambiente
          </p>
          <ng-container *ngIf="loading(); else chart2">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart2>
            <div *ngIf="chartSitiosData(); else noData2">
              <p-chart type="doughnut" [data]="chartSitiosData()" [options]="chartSitiosOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData2>
              <div class="db-empty"><i class="pi pi-pie-chart"></i><span>Sin datos de sitios disponibles</span></div>
            </ng-template>
          </ng-template>
        </div>

        <!-- Gráfica 3: Estado solicitudes -->
        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Estado de Solicitudes
          </p>
          <ng-container *ngIf="loading(); else chart3">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart3>
            <div *ngIf="chartSolicitudesData(); else noData3">
              <p-chart type="pie" [data]="chartSolicitudesData()" [options]="chartSolicitudesOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData3>
              <div class="db-empty"><i class="pi pi-inbox"></i><span>Sin solicitudes registradas</span></div>
            </ng-template>
          </ng-template>
        </div>

        <!-- Gráfica 4: Próximos a vencer -->
        <div class="db-chart-card">
          <p style="font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.07em; margin:0 0 1.25rem;">
            Productos Próximos a Vencer (90 días)
          </p>
          <ng-container *ngIf="loading(); else chart4">
            <p-skeleton width="100%" height="240px"></p-skeleton>
          </ng-container>
          <ng-template #chart4>
            <div *ngIf="chartVencimientoData(); else noData4">
              <p-chart type="bar" [data]="chartVencimientoData()" [options]="chartVencimientoOptions()" height="240px"></p-chart>
            </div>
            <ng-template #noData4>
              <div class="db-empty"><i class="pi pi-calendar"></i><span>Sin productos próximos a vencer</span></div>
            </ng-template>
          </ng-template>
        </div>

      </div>

      <!-- ══════════ ACCESOS RÁPIDOS ══════════ -->
      <p class="db-section-title" style="margin-top:0.5rem;">Accesos Rápidos</p>
      <div class="db-bottom-grid">

        <!-- Módulos del sistema -->
        <div class="db-quick-card">
          <p style="font-size:0.8rem; font-weight:800; color:#1e293b; margin:0 0 1rem;">
            Módulos del Sistema
          </p>
          <div class="quick-item" *ngFor="let mod of modulos">
            <div class="quick-left">
              <div class="quick-icon" [style.background]="mod.bg" [style.color]="mod.color">
                <i [class]="'pi ' + mod.icon"></i>
              </div>
              <div>
                <p class="quick-label">{{ mod.label }}</p>
                <p class="quick-sub">{{ mod.desc }}</p>
              </div>
            </div>
            <a [routerLink]="mod.path"
              style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.3rem 0.75rem; font-size:0.72rem; font-weight:700; color:#475569; text-decoration:none; white-space:nowrap;">
              Ir al módulo →
            </a>
          </div>
        </div>

        <!-- Estado general del sistema -->
        <div class="db-quick-card">
          <p style="font-size:0.8rem; font-weight:800; color:#1e293b; margin:0 0 1rem;">
            Estado General del Sistema
          </p>
          <div class="quick-item" *ngFor="let stat of estadoSistema">
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

  // Contadores
  totalUsuarios = signal<number>(0);
  totalProductos = signal<number>(0);
  totalSolicitudes = signal<number>(0);
  solicitudesPendientes = signal<number>(0);
  totalInventario = signal<number>(0);
  totalSitios = signal<number>(0);
  totalFichas = signal<number>(0);
  totalCategorias = signal<number>(0);

  // Charts
  chartStockData = signal<any>(null);
  chartStockOptions = signal<any>(null);
  chartVencimientoData = signal<any>(null);
  chartVencimientoOptions = signal<any>(null);
  chartSitiosData = signal<any>(null);
  chartSitiosOptions = signal<any>(null);
  chartSolicitudesData = signal<any>(null);
  chartSolicitudesOptions = signal<any>(null);

  // ─── Hero Mini KPIs ──────────────────────────────────────────────────────
  heroKpis = [
    { label: 'Usuarios', value: this.totalUsuarios, sub: 'Activos en el sistema' },
    { label: 'Productos', value: this.totalProductos, sub: 'Tipos de material' },
    { label: 'Solicitudes', value: this.totalSolicitudes, sub: 'Total registradas' },
    { label: 'Fichas', value: this.totalFichas, sub: 'Fichas de formación' },
  ];

  // ─── Stat Cards ──────────────────────────────────────────────────────────
  statCards = [
    {
      label: 'Total Inventario', value: this.totalInventario, limit: 100,
      icon: 'pi-database', iconColor: '#6366f1', iconBg: '#ede9fe',
      valueColor: '#3730a3',
      trend: 'Activo', trendBg: '#ede9fe', trendColor: '#6366f1', trendIcon: 'pi pi-check',
    },
    {
      label: 'Solicitudes Pendientes', value: this.solicitudesPendientes, limit: 20,
      icon: 'pi-clock', iconColor: '#f59e0b', iconBg: '#fffbeb',
      valueColor: '#b45309',
      trend: 'Pendiente', trendBg: '#fffbeb', trendColor: '#d97706', trendIcon: 'pi pi-exclamation-circle',
    },
    {
      label: 'Sitios / Ambientes', value: this.totalSitios, limit: 10,
      icon: 'pi-map-marker', iconColor: '#10b981', iconBg: '#d1fae5',
      valueColor: '#065f46',
      trend: 'Activos', trendBg: '#d1fae5', trendColor: '#059669', trendIcon: 'pi pi-check-circle',
    },
    {
      label: 'Categorías', value: this.totalCategorias, limit: 15,
      icon: 'pi-tag', iconColor: '#ec4899', iconBg: '#fce7f3',
      valueColor: '#9d174d',
      trend: 'Registradas', trendBg: '#fce7f3', trendColor: '#be185d', trendIcon: 'pi pi-tags',
    },
  ];

  // ─── Módulos de acceso rápido ─────────────────────────────────────────────
  modulos = [
    { label: 'Inventario', desc: 'Control de stock y materiales', path: '/inventario', icon: 'pi-warehouse', bg: '#d1fae5', color: '#059669' },
    { label: 'Solicitudes', desc: 'Gestión de pedidos de material', path: '/solicitudes', icon: 'pi-inbox', bg: '#fef3c7', color: '#d97706' },
    { label: 'Fichas', desc: 'Fichas de formación registradas', path: '/fichas', icon: 'pi-id-card', bg: '#e0e7ff', color: '#6366f1' },
    { label: 'Usuarios', desc: 'Administración de participantes', path: '/usuarios', icon: 'pi-users', bg: '#fce7f3', color: '#ec4899' },
    { label: 'Centros', desc: 'Centros de formación SENA', path: '/centros', icon: 'pi-briefcase', bg: '#dbeafe', color: '#3b82f6' },
    { label: 'Sedes', desc: 'Sedes físicas del sistema', path: '/sedes', icon: 'pi-building', bg: '#f3e8ff', color: '#8b5cf6' },
  ];

  // ─── Estado general del sistema ──────────────────────────────────────────
  estadoSistema = [
    { label: 'Materiales en Inventario', desc: 'Ítems totales registrados', icon: 'pi-box', bg: '#f0fdf4', color: '#16a34a', value: this.totalInventario },
    { label: 'Usuarios Registrados', desc: 'Total instructores y aprendices', icon: 'pi-users', bg: '#eff6ff', color: '#2563eb', value: this.totalUsuarios },
    { label: 'Productos Catalogados', desc: 'Tipos de material disponible', icon: 'pi-list', bg: '#fdf4ff', color: '#9333ea', value: this.totalProductos },
    { label: 'Sitios Habilitados', desc: 'Bodegas y ambientes activos', icon: 'pi-map', bg: '#fff7ed', color: '#ea580c', value: this.totalSitios },
    { label: 'Fichas de Formación', desc: 'Grupos activos de aprendizaje', icon: 'pi-id-card', bg: '#f0fdfa', color: '#0d9488', value: this.totalFichas },
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
      usuarios:   req('/usuarios'),
      productos:  req('/productos'),
      solicitudes:req('/solicitudes'),
      inventario: req('/inventario'),
      items:      req('/items'),
      sitios:     req('/sitios'),
      fichas:     req('/fichas'),
      categorias: req('/categorias'),
    }).subscribe({
      next: ({ usuarios, productos, solicitudes, inventario, items, sitios, fichas, categorias }) => {

        // ── Contadores ────────────────────────────────────────────────────
        this.totalUsuarios.set(usuarios.length);
        this.totalProductos.set(productos.length);
        this.totalSolicitudes.set(solicitudes.length);
        this.totalSitios.set(sitios.length);
        this.totalFichas.set(fichas.length);
        this.totalCategorias.set(categorias.length);

        const pendientes = solicitudes.filter((s: any) => {
          const e = (s.estadoSol || s.estado || '').toUpperCase();
          return e === 'PENDIENTE';
        }).length;
        this.solicitudesPendientes.set(pendientes);

        const totalInv = inventario.reduce((acc: number, cur: any) =>
          acc + (Number(cur.cantidadActual) || Number(cur.cantidad) || Number(cur.stock) || 0), 0);
        this.totalInventario.set(totalInv);

        this.ultimaActualizacion = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

        // ── Gráfica 1: Items por producto ────────────────────────────────
        const itemsAgg: any = {};
        items.forEach((item: any) => {
          const pid = item.id_producto ?? item.producto?.id ?? item.productoId;
          if (pid != null) {
            itemsAgg[pid] = (itemsAgg[pid] || 0) + 1;
          }
        });

        const stockArr = Object.keys(itemsAgg).map(pid => {
          const p = productos.find((pr: any) => String(pr.id_producto ?? pr.id) === String(pid));
          return { nombre: p?.nombre || ('Producto #' + pid), count: itemsAgg[pid] };
        }).sort((a, b) => b.count - a.count).slice(0, 8);

        if (stockArr.length) {
          this.chartStockData.set({
            labels: stockArr.map(i => i.nombre),
            datasets: [{
              label: 'Cantidad de ítems',
              data: stockArr.map(i => i.count),
              backgroundColor: 'rgba(57,169,0,0.8)',
              borderRadius: 8,
              hoverBackgroundColor: '#39A900',
            }]
          });
        } else {
          // MOCK DATA (Fallback)
          this.chartStockData.set({
            labels: ['Computadores', 'Monitores', 'Teclados', 'Mouse', 'Cables Red'],
            datasets: [{
              label: 'Cantidad de ítems (Demostración)',
              data: [120, 85, 140, 150, 300],
              backgroundColor: 'rgba(57,169,0,0.6)',
              borderRadius: 8,
              hoverBackgroundColor: '#39A900',
            }]
          });
        }
        
        // Options are the same for real or mock data
        this.chartStockOptions.set({
          indexAxis: 'y',
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} ítems` } }
          },
          scales: {
            x: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 50 } },
            y: { grid: { display: false } }
          }
        });

        // ── Gráfica 2: Materiales por sitio ─────────────────────────────
        const sitiosMap: any = {};
        sitios.forEach((s: any) => { sitiosMap[s.id_sitio ?? s.id] = s.nombre; });

        const invSitio: any = {};
        inventario.forEach((inv: any) => {
          const sId = inv.id_sitio ?? inv.sitio?.id;
          if (sId != null) {
            invSitio[sId] = (invSitio[sId] || 0) + (Number(inv.cantidadActual) || Number(inv.cantidad) || 1);
          }
        });

        const sitiosLabels = Object.keys(invSitio).map(id => sitiosMap[id] || 'Sitio #' + id);
        const sitiosVals = Object.values(invSitio);
        const PALETTE = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6','#f97316','#3b82f6','#84cc16'];

        if (sitiosLabels.length) {
          this.chartSitiosData.set({
            labels: sitiosLabels,
            datasets: [{ data: sitiosVals, backgroundColor: PALETTE.slice(0, sitiosLabels.length), borderWidth: 2, borderColor: '#fff' }]
          });
        } else {
          // MOCK DATA (Fallback)
          this.chartSitiosData.set({
            labels: ['Bodega Principal', 'Sede Norte', 'Laboratorio A', 'Sala Sistemas'],
            datasets: [{ data: [450, 200, 120, 80], backgroundColor: PALETTE.slice(0, 4), borderWidth: 2, borderColor: '#fff' }]
          });
        }
        
        this.chartSitiosOptions.set({
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } },
          cutout: '65%'
        });

        // ── Gráfica 3: Estado solicitudes ────────────────────────────────
        const solEstados: any = {};
        solicitudes.forEach((s: any) => {
          const st = (s.estadoSol || s.estado || 'PENDIENTE').toUpperCase();
          solEstados[st] = (solEstados[st] || 0) + 1;
        });

        const colorMap: any = {
          PENDIENTE: '#f59e0b', APROBADA: '#10b981', RECHAZADA: '#ef4444',
          ENTREGADO: '#3b82f6', CANCELADO: '#6b7280', APROBADO: '#10b981', RECHAZADO: '#ef4444'
        };

        const solKeys = Object.keys(solEstados);
        if (solKeys.length) {
          this.chartSolicitudesData.set({
            labels: solKeys,
            datasets: [{
              data: solKeys.map(k => solEstados[k]),
              backgroundColor: solKeys.map(k => colorMap[k] || '#94a3b8'),
              borderWidth: 2, borderColor: '#fff'
            }]
          });
        } else {
          // MOCK DATA (Fallback)
          const mockKeys = ['APROBADA', 'PENDIENTE', 'ENTREGADO', 'RECHAZADA'];
          this.chartSolicitudesData.set({
            labels: mockKeys,
            datasets: [{
              data: [45, 25, 20, 10],
              backgroundColor: mockKeys.map(k => colorMap[k] || '#94a3b8'),
              borderWidth: 2, borderColor: '#fff'
            }]
          });
        }

        this.chartSolicitudesOptions.set({
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } }
        });

        // ── Gráfica 4: Próximos a vencer ────────────────────────────────
        const hoy = new Date();
        const limite = new Date(); limite.setDate(limite.getDate() + 90);

        const aVencer = productos.filter((p: any) => {
          if (!p.fecha_vencimiento) return false;
          const fv = new Date(p.fecha_vencimiento);
          return fv >= hoy && fv <= limite;
        }).sort((a: any, b: any) =>
          new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
        ).slice(0, 8);

        if (aVencer.length) {
          const dias = aVencer.map((p: any) =>
            Math.ceil((new Date(p.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000));
          this.chartVencimientoData.set({
            labels: aVencer.map((p: any) => p.nombre),
            datasets: [{
              label: 'Días restantes',
              data: dias,
              backgroundColor: dias.map((d: number) => d < 30 ? '#ef4444' : d < 60 ? '#f59e0b' : '#10b981'),
              borderRadius: 8,
            }]
          });
        } else {
          // MOCK DATA (Fallback)
          const mockDias = [15, 28, 45, 70];
          this.chartVencimientoData.set({
            labels: ['Licencia Software', 'Reactivos Lab.', 'Tinta Impresora', 'Material Papelería'],
            datasets: [{
              label: 'Días restantes (Demostración)',
              data: mockDias,
              backgroundColor: mockDias.map((d: number) => d < 30 ? '#ef4444' : d < 60 ? '#f59e0b' : '#10b981'),
              borderRadius: 8,
            }]
          });
        }
        
        this.chartVencimientoOptions.set({
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.raw} días` } } },
          scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
