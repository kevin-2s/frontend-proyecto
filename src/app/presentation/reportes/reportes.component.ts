import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <!-- Header -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <i class="pi pi-chart-bar text-[#39A900] text-3xl"></i>
          <div>
            <h3 class="page-title m-0">Reportes</h3>
            <p class="text-gray-400 text-[11px] m-0">Genera y descarga reportes del sistema en PDF o Excel</p>
          </div>
        </div>
      </div>

      <!-- Cards de reportes -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Inventario PDF -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
              <i class="pi pi-file-pdf text-red-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Inventario Completo</h3>
              <p class="text-gray-400 text-xs">Formato PDF</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Exporta el estado actual del inventario con todos los productos, categorías y cantidades disponibles.
          </p>
          <button (click)="descargar('inventario', 'pdf')" [disabled]="cargando()"
            class="w-full py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar PDF
          </button>
        </div>

        <!-- Inventario Excel -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <i class="pi pi-file-excel text-emerald-600 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Inventario Completo</h3>
              <p class="text-gray-400 text-xs">Formato Excel</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Exporta el inventario en formato Excel para análisis y procesamiento de datos avanzado.
          </p>
          <button (click)="descargar('inventario', 'excel')" [disabled]="cargando()"
            class="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar Excel
          </button>
        </div>

        <!-- Solicitudes PDF -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <i class="pi pi-inbox text-emerald-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Solicitudes del Sistema</h3>
              <p class="text-gray-400 text-xs">Formato PDF</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Historial completo de solicitudes de materiales procesadas, aprobadas y rechazadas.
          </p>
          <button (click)="descargar('solicitudes', 'pdf')" [disabled]="cargando()"
            class="w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar PDF
          </button>
        </div>

        <!-- Préstamos Excel -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <i class="pi pi-send text-amber-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Préstamos y Devoluciones</h3>
              <p class="text-gray-400 text-xs">Formato Excel</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Reporte de equipos prestados, fechas de devolución y estado actual de los préstamos activos.
          </p>
          <button (click)="descargar('prestamos', 'excel')" [disabled]="cargando()"
            class="w-full py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar Excel
          </button>
        </div>

        <!-- Kardex PDF -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center">
              <i class="pi pi-history text-purple-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Kardex / Auditoría</h3>
              <p class="text-gray-400 text-xs">Formato PDF</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Historial completo de entradas y salidas del inventario para auditoría y trazabilidad.
          </p>
          <button (click)="descargar('kardex', 'pdf')" [disabled]="cargando()"
            class="w-full py-2.5 bg-purple-50 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar PDF
          </button>
        </div>

        <!-- Usuarios Excel -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <i class="pi pi-users text-slate-500 text-2xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 text-sm">Usuarios del Sistema</h3>
              <p class="text-gray-400 text-xs">Formato Excel</p>
            </div>
          </div>
          <p class="text-gray-500 text-xs mb-5 leading-relaxed">
            Lista de todos los usuarios registrados, roles asignados y estado de la cuenta.
          </p>
          <button (click)="descargar('usuarios', 'excel')" [disabled]="cargando()"
            class="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            <i class="pi pi-download"></i> Descargar Excel
          </button>
        </div>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="cargando()" class="fixed bottom-6 right-6 bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <i class="pi pi-spin pi-spinner"></i>
        <span class="text-sm font-medium">Generando reporte...</span>
      </div>

      <!-- Error -->
      <div *ngIf="mensajeError()" class="fixed bottom-6 right-6 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <i class="pi pi-exclamation-triangle"></i>
        <span class="text-sm font-medium">{{ mensajeError() }}</span>
      </div>
    </div>
  `,
})
export class ReportesComponent implements OnInit {
  cargando = signal(false);
  mensajeError = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  descargar(tipo: string, formato: string) {
    this.cargando.set(true);
    this.mensajeError.set(null);

    const url = formato === 'pdf'
      ? `${environment.apiUrl}/reportes/${tipo}`
      : `${environment.apiUrl}/reportes/${tipo}/excel`;

    const mimeType = formato === 'pdf' ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const extension = formato === 'pdf' ? 'pdf' : 'xlsx';

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `reporte-${tipo}.${extension}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('Error al generar el reporte. Verifique que el servidor esté en línea.');
        this.cargando.set(false);
        setTimeout(() => this.mensajeError.set(null), 4000);
      },
    });
  }
}
