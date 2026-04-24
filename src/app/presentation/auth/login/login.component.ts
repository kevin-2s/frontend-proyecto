import { Component, inject, signal } from '@angular/core';
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
  template: `
    <p-toast></p-toast>
    
    <!-- Contenedor Principal -->
    <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
      <!-- Fondo borroso con la imagen -->
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm" style="background-image: url('sena.jpg');"></div>
      <div class="absolute inset-0 bg-black/30"></div>

      <!-- Tarjeta central (AQUÍ ES DONDE SE MODIFICA EL TAMAÑO) -->
      <!-- Cambié max-w-[900px] a max-w-[1000px] y h-[550px] a min-h-[600px] -->
      <div class="relative z-10 w-full max-w-[1000px] flex rounded-3xl shadow-2xl overflow-hidden mx-4 min-h-[600px]">
        
        <!-- Lado Izquierdo: Imagen nítida -->
        <div class="hidden md:block w-1/2 bg-cover bg-center relative" style="background-image: url('sena.jpg');">
        </div>

        <!-- Lado Derecho: Formulario de Login -->
        <div class="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-[#F4F6F5]">
          <div class="text-center mb-8">
            <!-- Icono y Logo -->
            <div class="flex justify-center mb-2">
              <div class="relative flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-[#39A900]">
                <i class="pi pi-box text-3xl text-[#39A900]"></i>
                <!-- Pequeñas flechas decorativas imitando el logo de la imagen -->
                <i class="pi pi-arrow-right absolute -right-2 top-1/2 -translate-y-1/2 text-[#39A900] text-xs bg-[#F4F6F5]"></i>
              </div>
            </div>
            <h1 class="text-2xl font-bold text-surface-900 tracking-tight">logitma</h1>
            <p class="text-xs text-surface-500 mt-3 mx-2 leading-relaxed">
              Accede al sistema de gestión de inventario LOGITMA con tus credenciales asignadas
            </p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            
            <div class="flex flex-col gap-1">
              <input 
                pInputText
                id="correo" 
                type="email" 
                formControlName="correo"
                class="w-full !bg-surface-0 !border-surface-200 !p-3 text-sm !rounded-xl focus:!border-[#39A900] transition-colors"
                placeholder="Usuario o correo"
              >
            </div>

            <div class="flex flex-col gap-1">
              <!-- Para arreglar el ojito, se debe asegurar que el contenedor padre del input tome todo el ancho con [style]="{'width':'100%'}" -->
              <p-password 
                id="contrasena" 
                formControlName="contrasena"
                [feedback]="false"
                styleClass="w-full flex"
                [style]="{'width':'100%', 'position': 'relative'}"
                [inputStyle]="{'width':'100%', 'background-color': '#ffffff', 'border-color': '#e2e8f0', 'padding': '0.75rem', 'font-size': '0.875rem', 'border-radius': '0.75rem'}"
                placeholder="Contraseña"
                [toggleMask]="true"
              ></p-password>
            </div>

            <div class="flex items-center justify-between mt-2 mb-3 px-1">
              <div class="flex items-center gap-2">
                <p-checkbox [binary]="true" inputId="recordarme" styleClass="text-xs"></p-checkbox>
                <label for="recordarme" class="text-xs text-surface-500 cursor-pointer">Recordarme</label>
              </div>
              <a href="#" class="text-xs text-surface-400 hover:text-[#39A900] transition-colors" (click)="$event.preventDefault()">¿Olvidó su contraseña?</a>
            </div>

            <p-button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()"
              [loading]="isLoading()"
              label="INGRESAR"
              styleClass="w-full"
              [style]="{'background-color': '#39A900', 'border-color': '#39A900', 'padding': '0.85rem', 'font-weight': '700', 'border-radius': '0.75rem', 'letter-spacing': '0.05em'}"
            ></p-button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]]
  });

  isLoading = signal(false);

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
