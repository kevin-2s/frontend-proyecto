import { Component, signal, ViewChild, ElementRef, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-container">
      <!-- Header -->
      <div class="module-header flex justify-between items-center flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
            <i class="pi pi-barcode text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h3 class="page-title m-0">Lector de Barras</h3>
            <p class="text-gray-400 text-[11px] m-0">Identifica y consulta productos usando el lector de barras físico</p>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        
        <!-- Left Side: Lector de Pistola -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <i class="pi pi-barcode text-slate-700 text-lg"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm m-0">Lector de Hardware Físico</h4>
              <p class="text-slate-400 text-xs m-0 mt-0.5">Compatible con pistolas lectoras USB y Bluetooth</p>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#39A900]/30 rounded-2xl bg-[#39A900]/5 text-center min-h-[300px] mb-4">
            <i class="pi pi-barcode text-6xl text-[#39A900] mb-4 animate-pulse"></i>
            <h4 class="font-bold text-slate-800 text-lg m-0">Lector de Pistola Activo</h4>
            <p class="text-slate-500 text-sm max-w-sm mt-2">
              Apunta y presiona el gatillo de tu escáner físico de código de barras. 
              LogiMat detectará y procesará la lectura automáticamente.
            </p>
            <input 
              type="text" 
              #pistolaInput
              [(ngModel)]="codigoManual"
              (keyup.enter)="validarCodigo(codigoManual); codigoManual = ''"
              class="mt-6 px-4 py-3 border border-slate-300 rounded-xl text-center focus:border-[#39A900] focus:ring-2 focus:ring-[#39A900]/20 focus:outline-none tracking-widest font-mono text-xl bg-white shadow-inner w-full max-w-xs"
              placeholder="Esperando lectura..."
            />
          </div>
          
          <p class="text-xs text-slate-400 text-center m-0">
            <i class="pi pi-info-circle mr-1"></i> Asegúrate de mantener el cursor sobre la caja de lectura o simplemente escanea.
          </p>
        </div>

        <!-- Right Side: Manual Search + Result + History -->
        <div class="flex flex-col gap-4">
          <!-- Manual Search -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h4 class="font-bold text-slate-800 text-sm mb-4 mt-0 flex items-center gap-2">
              <i class="pi pi-pencil text-slate-400"></i> Búsqueda por Texto
            </h4>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="codigoManualBusqueda"
                (keyup.enter)="validarCodigo(codigoManualBusqueda); codigoManualBusqueda = ''"
                placeholder="Escribe el código SKU o ID manualmente..."
                class="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
              <button (click)="validarCodigo(codigoManualBusqueda); codigoManualBusqueda = ''"
                class="px-4 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors border-none cursor-pointer outline-none flex items-center justify-center">
                <i class="pi pi-search"></i>
              </button>
            </div>
          </div>

          <!-- Resultado -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
            <h4 class="font-bold text-slate-800 text-sm mb-4 mt-0 flex items-center gap-2">
              <i class="pi pi-info-circle text-slate-400"></i> Resultado de la Consulta
            </h4>

            <div *ngIf="!resultado() && !error() && !cargando()" class="flex flex-col items-center justify-center py-8 text-center">
              <i class="pi pi-barcode text-5xl text-slate-200 mb-3"></i>
              <p class="text-slate-400 text-sm">Escanea o ingresa un código para consultar la información del ítem</p>
            </div>

            <div *ngIf="cargando()" class="flex flex-col items-center justify-center py-8 text-center">
              <i class="pi pi-spin pi-spinner text-3xl text-[#39A900] mb-3"></i>
              <p class="text-slate-400 text-sm">Buscando en el inventario...</p>
            </div>

            <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              <i class="pi pi-times-circle mr-2"></i> {{ error() }}
            </div>

            <div *ngIf="resultado()" class="space-y-4">
              <div class="flex items-center gap-2 text-emerald-600 mb-2">
                <i class="pi pi-check-circle text-xl"></i>
                <span class="font-bold text-sm">Producto identificado</span>
              </div>
              
              <!-- Custom designed Premium Product Card -->
              <div class="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                <div class="bg-white border-b border-slate-100 p-4 flex justify-between items-start">
                  <div>
                    <h5 class="text-slate-800 font-extrabold text-base m-0">
                      {{ resultado().producto?.nombre ?? resultado().nombre ?? 'Nombre no disponible' }}
                    </h5>
                    <span class="text-xs text-slate-400 font-mono mt-1 block">SKU: {{ resultado().codigo_sku ?? codigoEscaneado() }}</span>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#39A900]/10 text-[#39A900]">
                    {{ resultado().estado ?? 'DISPONIBLE' }}
                  </span>
                </div>
                
                <div class="p-4 space-y-2 text-sm text-slate-600">
                  <div class="flex justify-between" *ngIf="resultado().producto?.descripcion || resultado().descripcion">
                    <span class="text-slate-400 font-medium">Descripción:</span>
                    <span class="text-slate-700 font-semibold max-w-[200px] text-right">{{ resultado().producto?.descripcion ?? resultado().descripcion }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="resultado().bodega?.nombre">
                    <span class="text-slate-400 font-medium">Bodega:</span>
                    <span class="text-slate-700 font-semibold">{{ resultado().bodega?.nombre }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="resultado().categoria?.nombre">
                    <span class="text-slate-400 font-medium">Categoría:</span>
                    <span class="text-slate-700 font-semibold">{{ resultado().categoria?.nombre }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="resultado().precio">
                    <span class="text-slate-400 font-medium">Precio:</span>
                    <span class="text-slate-700 font-semibold">{{ resultado().precio | currency }}</span>
                  </div>
                  <div class="flex justify-between" *ngIf="resultado().cantidad_disponible">
                    <span class="text-slate-400 font-medium">Stock Disponible:</span>
                    <span class="text-slate-700 font-semibold">{{ resultado().cantidad_disponible }} unidades</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Historial -->
          <div *ngIf="historial().length > 0" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h4 class="font-bold text-slate-800 text-sm mb-3 mt-0 flex items-center justify-between">
              <span>Historial de Consultas</span>
              <button (click)="limpiarHistorial()" class="text-xs text-red-500 hover:text-red-700 transition border-none bg-transparent cursor-pointer font-semibold">Limpiar</button>
            </h4>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div *ngFor="let h of historial()"
                class="flex items-center justify-between text-xs bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 hover:bg-slate-100 transition cursor-pointer"
                (click)="validarCodigo(h.codigo)">
                <span class="font-mono text-slate-700 font-semibold">{{ h.codigo }}</span>
                <span class="text-slate-400">{{ h.fecha }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
})
export class QrScannerComponent implements OnInit {
  private readonly http = inject(HttpClient);

  resultado = signal<any>(null);
  error = signal<string | null>(null);
  cargando = signal(false);
  codigoManual = '';
  codigoManualBusqueda = '';
  codigoEscaneado = signal('');
  historial = signal<{ codigo: string; fecha: string }[]>([]);

  @ViewChild('pistolaInput') pistolaInput!: ElementRef;

  ngOnInit() {
    setTimeout(() => {
      this.pistolaInput?.nativeElement?.focus();
    }, 300);
  }

  // Captura global de pulsaciones de teclado para pistolas lectoras
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Si están escribiendo en el buscador manual por texto, ignoramos
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' && target !== this.pistolaInput?.nativeElement) {
      return;
    }

    if (event.key === 'Enter') {
      if (this.codigoManual.trim()) {
        this.validarCodigo(this.codigoManual);
        this.codigoManual = '';
      }
    } else {
      if (document.activeElement !== this.pistolaInput?.nativeElement) {
        this.pistolaInput?.nativeElement?.focus();
      }
    }
  }

  validarCodigo(code: string) {
    if (!code?.trim()) return;
    this.error.set(null);
    this.resultado.set(null);
    this.codigoEscaneado.set(code);
    this.cargando.set(true);

    this.http.post<any>(`${environment.apiUrl}/qr/validate`, { code }).subscribe({
      next: (res) => {
        this.resultado.set(res?.data || res);
        this.agregarHistorial(code);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(`No se encontró información en el inventario para el código: ${code}`);
        this.agregarHistorial(code);
        this.cargando.set(false);
      },
    });
  }

  agregarHistorial(codigo: string) {
    const ahora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.historial.update(h => {
      // Evitar duplicados consecutivos en la lista
      const list = h.filter(x => x.codigo !== codigo);
      return [{ codigo, fecha: ahora }, ...list].slice(0, 10);
    });
  }

  limpiarHistorial() {
    this.historial.set([]);
  }
}
