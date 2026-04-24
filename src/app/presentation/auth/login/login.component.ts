import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    InputTextModule, 
    PasswordModule, 
    ButtonModule, 
    ToastModule,
    CheckboxModule
  ],
  providers: [MessageService],
  styles: [`
    :host ::ng-deep .p-password {
      width: 100% !important;
      position: relative !important;
      display: block !important;
    }
    :host ::ng-deep .p-password-icon {
      position: absolute !important;
      right: 1.5rem !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      color: #9ca3af !important;
      margin-top: 0 !important;
      z-index: 10;
    }
    :host ::ng-deep .p-checkbox .p-checkbox-box {
      width: 1.25rem !important;
      height: 1.25rem !important;
      background-color: #f3f4f6 !important;
      border: 2px solid #d1d5db !important;
      border-radius: 0.25rem !important;
    }
    :host ::ng-deep .p-checkbox .p-checkbox-icon {
      font-size: 0.875rem !important;
    }
    :host ::ng-deep .p-checkbox:not(.p-checkbox-disabled) .p-checkbox-box:hover {
      border-color: #39A900 !important;
    }
    :host ::ng-deep .p-checkbox.p-highlight .p-checkbox-box {
      background-color: #39A900 !important;
      border-color: #39A900 !important;
    }
  `],
  template: `
    <p-toast></p-toast>
    
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
      <!-- Fondo estático detrás del contenedor -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm scale-105" style="background-image: url('sena.jpg');"></div>
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- Tarjeta central más grande (max-w-[1200px], min-h-[700px]) -->
      <div class="relative z-10 w-full max-w-[1200px] flex rounded-[2rem] bg-white shadow-2xl mx-4 min-h-[700px] overflow-hidden border border-gray-200">
        
        <!-- Lado Izquierdo: Carrusel de Imagen (Mitad de ancho) -->
        <div class="hidden md:flex w-1/2 relative p-10 flex-col justify-between overflow-hidden">
          <div *ngFor="let img of images; let i = index" 
               class="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
               [ngClass]="{'opacity-100': currentImageIndex() === i, 'opacity-0': currentImageIndex() !== i}"
               [style.background-image]="'url(' + img + ')'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
          </div>
          
          <!-- Top: Logo -->
          <div class="relative z-20 flex items-center gap-3">
            <img src="LogoLogitmat_sin_fondo.png" alt="Logitma" class="w-14 h-14 object-contain drop-shadow-lg">
            <span class="text-white font-bold text-3xl tracking-wide drop-shadow-md">logitma</span>
          </div>

          <!-- Bottom: Frase de software -->
          <div class="relative z-20 mt-auto pb-4">
            <!-- Indicadores de carrusel -->
            <div class="flex gap-2 mb-8">
              <div *ngFor="let img of images; let i = index" 
                   class="h-1.5 rounded-full transition-all duration-500 cursor-pointer"
                   (click)="setCurrentImage(i)"
                   [ngClass]="currentImageIndex() === i ? 'w-12 bg-[#39A900]' : 'w-5 bg-white/40 hover:bg-white/70'">
              </div>
            </div>
            <h2 class="text-white text-5xl font-extrabold mb-4 leading-tight drop-shadow-md">
              Control <br>Inteligente
            </h2>
            <p class="text-white/90 text-base leading-relaxed max-w-[350px] drop-shadow-md font-medium">
              Software especializado para la gestión y control de inventarios. 
              Precisión, tecnología y eficiencia en un solo lugar.
            </p>
          </div>
        </div>

        <!-- Lado Derecho: Formulario de Login (Blanco) -->
        <div class="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white">
          
          <!-- Toggle Button (Log In / Sign Up) -->
          <div class="flex justify-center mb-10">
            <div class="bg-gray-100 p-1.5 rounded-full flex shadow-inner border border-gray-200">
              <button class="px-8 py-2.5 rounded-full text-gray-500 text-sm font-semibold transition-colors hover:text-gray-700">
                Crear Cuenta
              </button>
              <button class="px-8 py-2.5 rounded-full bg-[#39A900] text-white text-sm font-bold shadow-md shadow-[#39A900]/20 transition-all">
                Iniciar Sesión
              </button>
            </div>
          </div>

          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 tracking-tight">Acceder a tu Cuenta</h1>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 w-full max-w-[420px] mx-auto">
            
            <div class="flex flex-col gap-2">
              <div class="relative flex items-center">
                <input 
                  pInputText
                  id="correo" 
                  type="email" 
                  formControlName="correo"
                  class="w-full !bg-gray-100 !border-2 !border-gray-200 !text-gray-800 !p-4 !px-6 text-[15px] !rounded-xl focus:!border-[#39A900] focus:!bg-white hover:!bg-gray-200 transition-all placeholder:!text-gray-400 outline-none"
                  placeholder="Correo o usuario"
                >
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="relative flex items-center w-full">
                <p-password 
                  id="contrasena" 
                  formControlName="contrasena"
                  [feedback]="false"
                  styleClass="w-full"
                  inputStyleClass="w-full !bg-gray-100 !border-2 !border-gray-200 !text-gray-800 !p-4 !px-6 text-[15px] !rounded-xl focus:!border-[#39A900] focus:!bg-white hover:!bg-gray-200 transition-all placeholder:!text-gray-400 outline-none !pr-12"
                  placeholder="Contraseña"
                  [toggleMask]="true"
                ></p-password>
              </div>
            </div>

            <div class="flex items-center justify-between mt-2 mb-4 px-2">
              <div class="flex items-center gap-2.5">
                <p-checkbox [binary]="true" inputId="recordarme" styleClass="text-sm"></p-checkbox>
                <label for="recordarme" class="text-sm font-medium text-gray-500 cursor-pointer select-none">Recordarme</label>
              </div>
              <a href="#" class="text-sm font-medium text-gray-500 hover:text-[#39A900] transition-colors" (click)="$event.preventDefault()">¿Olvidó su contraseña?</a>
            </div>

            <p-button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()"
              [loading]="isLoading()"
              label="Ingresar al Sistema"
              styleClass="w-full transition-all duration-300 hover:scale-[1.02]"
              [style]="{'background': '#39A900', 'border': 'none', 'padding': '1.1rem', 'font-weight': '700', 'font-size': '1.05rem', 'border-radius': '0.75rem', 'color': 'white', 'box-shadow': '0 8px 20px -6px rgba(57, 169, 0, 0.4)'}"
            ></p-button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]]
  });

  isLoading = signal(false);

  // Lógica del carrusel
  images = ['sena.jpg', 'sena1.png', 'sena2.JPG'];
  currentImageIndex = signal(0);
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentImageIndex.update(i => (i + 1) % this.images.length);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  setCurrentImage(index: number) {
    this.currentImageIndex.set(index);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.currentImageIndex.update(i => (i + 1) % this.images.length);
      }, 5000);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { correo, contrasena } = this.loginForm.getRawValue();

    this.authService.login(correo, contrasena).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Autenticación',
          detail: err.error?.message || 'Credenciales incorrectas o error en el servidor',
          life: 4000
        });
      }
    });
  }
}
