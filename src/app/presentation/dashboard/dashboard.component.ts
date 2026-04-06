import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, TableModule],
  template: `
    <div class="animate-fade-in">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Dashboard Resumen</h2>

      <!-- Tarjetas de Resumen (Sin PrimeNG para control total de colores y borde custom) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <p-card styleClass="shadow border-t-4 border-[#39A900] hover:shadow-lg transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Usuarios</p>
              <h3 class="text-3xl font-bold text-gray-800">45</h3>
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
              <h3 class="text-3xl font-bold text-gray-800">128</h3>
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
              <h3 class="text-3xl font-bold text-[#FD7E14]">12</h3>
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
              <h3 class="text-3xl font-bold text-[#28A745]">3,450</h3>
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
          <button class="text-[#39A900] hover:underline text-sm font-medium"><i class="pi pi-arrow-right mr-1"></i>Ver todas</button>
        </div>
        
        <p-table [value]="solicitudes" [tableStyle]="{ 'min-width': '50rem' }" styleClass="p-datatable-striped">
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
                    <td class="font-medium text-gray-900">{{ sol.id }}</td>
                    <td>{{ sol.justificacion }}</td>
                    <td>{{ sol.fechaSol }}</td>
                    <td>
                      <span *ngIf="sol.estadoSol === 'PENDIENTE'" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{{ sol.estadoSol }}</span>
                      <span *ngIf="sol.estadoSol === 'APROBADA'" class="px-2 py-1 bg-green-100 text-[#28A745] rounded-full text-xs font-semibold">{{ sol.estadoSol }}</span>
                      <span *ngIf="sol.estadoSol === 'RECHAZADA'" class="px-2 py-1 bg-red-100 text-[#DC3545] rounded-full text-xs font-semibold">{{ sol.estadoSol }}</span>
                    </td>
                </tr>
            </ng-template>
        </p-table>
      </div>
    </div>
  `
})
export class DashboardComponent {
  solicitudes = [
    { id: 101, justificacion: 'Material para curso robótica', fechaSol: '2026-04-05', estadoSol: 'PENDIENTE' },
    { id: 100, justificacion: 'Suministros oficina coordinación', fechaSol: '2026-04-04', estadoSol: 'APROBADA' },
    { id: 99, justificacion: 'Resmas de papel para impresoras', fechaSol: '2026-04-02', estadoSol: 'RECHAZADA' },
    { id: 98, justificacion: 'Herramientas agrícolas granja SENA', fechaSol: '2026-04-01', estadoSol: 'APROBADA' },
    { id: 97, justificacion: 'Insumos para laboratorio', fechaSol: '2026-03-30', estadoSol: 'APROBADA' }
  ];
}
