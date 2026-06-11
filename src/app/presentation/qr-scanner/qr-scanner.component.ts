import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 min-h-screen bg-[#f0fdf4]">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Escáner de Códigos QR</h1>
        <p class="text-gray-500 text-sm mt-1">Escanea códigos QR o de barras para identificar productos del inventario</p>
      </div>

      <!-- Scanner Card -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Cámara / Scanner -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-10 h-10 rounded-xl bg-[#39A900]/10 flex items-center justify-center">
              <i class="pi pi-qrcode text-[#39A900] text-lg"></i>
            </div>
            <div>
              <h2 class="font-bold text-gray-900 text-sm">Escáner en tiempo real</h2>
              <p class="text-gray-400 text-xs">Usando la cámara del dispositivo</p>
            </div>
          </div>

          <!-- Visor -->
          <div class="bg-gray-900 rounded-xl overflow-hidden aspect-square flex items-center justify-center relative mb-4">
            <div *ngIf="!scannerActivo()" class="text-center text-white">
              <i class="pi pi-camera text-5xl mb-3 block text-gray-500"></i>
              <p class="text-gray-400 text-sm">Presiona "Iniciar Escáner" para activar la cámara</p>
            </div>
            <div id="qr-reader" class="w-full h-full" [class.hidden]="!scannerActivo()"></div>
            <!-- Overlay de scan -->
            <div *ngIf="scannerActivo()" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-48 h-48 border-2 border-[#39A900] rounded-xl relative">
                <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#39A900] rounded-tl-lg"></div>
                <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#39A900] rounded-tr-lg"></div>
                <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#39A900] rounded-bl-lg"></div>
                <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#39A900] rounded-br-lg"></div>
              </div>
            </div>
          </div>

          <div class="flex gap-3">
            <button *ngIf="!scannerActivo()" (click)="iniciarScanner()"
              class="flex-1 bg-[#39A900] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#2e8a00] transition-colors flex items-center justify-center gap-2">
              <i class="pi pi-play"></i> Iniciar Escáner
            </button>
            <button *ngIf="scannerActivo()" (click)="detenerScanner()"
              class="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
              <i class="pi pi-stop"></i> Detener
            </button>
          </div>
        </div>

        <!-- Ingreso manual + Resultado -->
        <div class="flex flex-col gap-4">
          <!-- Ingreso Manual -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 class="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <i class="pi pi-pencil text-gray-400"></i> Ingreso Manual
            </h2>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="codigoManual"
                (keyup.enter)="validarCodigo(codigoManual)"
                placeholder="Código SKU, QR o barras..."
                class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]">
              <button (click)="validarCodigo(codigoManual)"
                class="px-4 py-2.5 bg-[#111827] text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                <i class="pi pi-search"></i>
              </button>
            </div>
          </div>

          <!-- Resultado -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
            <h2 class="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <i class="pi pi-info-circle text-gray-400"></i> Resultado
            </h2>

            <div *ngIf="!resultado() && !error()" class="flex flex-col items-center justify-center py-8 text-center">
              <i class="pi pi-qrcode text-5xl text-gray-200 mb-3"></i>
              <p class="text-gray-400 text-sm">Escanea o ingresa un código para ver la información</p>
            </div>

            <div *ngIf="error()" class="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              <i class="pi pi-times-circle mr-2"></i> {{ error() }}
            </div>

            <div *ngIf="resultado()" class="space-y-3">
              <div class="flex items-center gap-2 text-emerald-600 mb-3">
                <i class="pi pi-check-circle text-xl"></i>
                <span class="font-bold text-sm">Código encontrado</span>
              </div>
              <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">Código escaneado:</span>
                  <span class="font-mono font-bold text-gray-800">{{ codigoEscaneado() }}</span>
                </div>
                <pre class="text-xs text-gray-600 bg-white rounded-lg p-3 border border-gray-100 overflow-auto">{{ resultado() | json }}</pre>
              </div>
            </div>
          </div>

          <!-- Historial de escaneos -->
          <div *ngIf="historial().length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 class="font-bold text-gray-900 text-sm mb-3">Historial de Escaneos</h2>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div *ngFor="let h of historial()"
                class="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                <span class="font-mono text-gray-700">{{ h.codigo }}</span>
                <span class="text-gray-400">{{ h.fecha }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QrScannerComponent {
  scannerActivo = signal(false);
  resultado = signal<any>(null);
  error = signal<string | null>(null);
  codigoManual = '';
  codigoEscaneado = signal('');
  historial = signal<{ codigo: string; fecha: string }[]>([]);

  private html5QrCode: any = null;

  constructor(private http: HttpClient) {}

  async iniciarScanner() {
    try {
      const html5Lib: any = await import('html5-qrcode' as any);
      const Html5Qrcode = html5Lib.Html5Qrcode;
      this.html5QrCode = new Html5Qrcode('qr-reader');
      this.scannerActivo.set(true);
      await this.html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (code: string) => this.onScanSuccess(code),
        () => {}
      );
    } catch (err) {
      this.error.set('No se pudo acceder a la cámara. Verifica los permisos.');
      this.scannerActivo.set(false);
    }
  }

  async detenerScanner() {
    try {
      await this.html5QrCode?.stop();
    } catch {}
    this.scannerActivo.set(false);
  }

  onScanSuccess(code: string) {
    this.detenerScanner();
    this.validarCodigo(code);
  }

  validarCodigo(code: string) {
    if (!code?.trim()) return;
    this.error.set(null);
    this.resultado.set(null);
    this.codigoEscaneado.set(code);

    this.http.post<any>(`${environment.apiUrl}/qr/validate`, { code }).subscribe({
      next: (res) => {
        this.resultado.set(res);
        this.agregarHistorial(code);
      },
      error: () => {
        this.error.set(`No se encontró información para el código: ${code}`);
        this.agregarHistorial(code);
      },
    });
  }

  agregarHistorial(codigo: string) {
    const ahora = new Date().toLocaleTimeString();
    this.historial.update(h => [{ codigo, fecha: ahora }, ...h].slice(0, 10));
  }
}
