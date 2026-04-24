import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
            <div class="p-3 bg-green-50 rounded-full text-[#39A900]">
              <i class="pi pi-users text-2xl"></i>
            </div>
          </div>
        </p-card>

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
            <div class="p-3 bg-green-50 rounded-full text-[#39A900]">
              <i class="pi pi-box text-2xl"></i>
            </div>
          </div>
        </p-card>

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
            <div class="p-3 bg-orange-50 rounded-full text-[#FD7E14]">
              <i class="pi pi-clock text-2xl"></i>
            </div>
          </div>
        </p-card>

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
            <div class="p-3 bg-green-50 rounded-full text-[#28A745]">
              <i class="pi pi-warehouse text-2xl"></i>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Tabla Últimas Solicitudes con PrimeNG Table -->
      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200 bg-[#F8F9FA] flex justify-between items-center rounded-t-lg">
          <h3 class="text-lg font-semibold text-gray-800">Últimas 5 Solicitudes</h3>
        </div>
        
        <p-table [value]="ultimasSolicitudes()" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-striped" [loading]="loading()">
            <ng-template pTemplate="header">
                <tr>
                    <th class="!bg-white !text-gray-600">ID</th>
                    <th class="!bg-white !text-gray-600">Justificación</th>
                    <th class="!bg-white !text-gray-600">Fecha</th>
                    <th class="!bg-white !text-gray-600">Estado</th>
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
        </p-table>
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
