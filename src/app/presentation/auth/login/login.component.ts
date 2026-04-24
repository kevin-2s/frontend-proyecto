import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, InputTextModule, PasswordModule, ButtonModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-surface-200">
        <div class="text-center mb-8">
          <h1 class="text-5xl font-extrabold text-[#39A900] mb-3 tracking-tight drop-shadow-sm">Logitma</h1>
          <h2 class="text-lg text-surface-600 font-medium">Gestión de Materiales de Formación</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
          <div class="flex flex-col gap-2">
            <label for="correo" class="text-sm font-semibold text-surface-700">Correo electrónico</label>
            <input 
              pInputText
              id="correo" 
              type="email" 
              formControlName="correo"
              class="w-full"
              placeholder="usuario@sena.edu.co"
            >
            <small *ngIf="loginForm.get('correo')?.touched && loginForm.get('correo')?.invalid" class="text-red-500 font-medium">
              El correo es requerido y debe ser válido
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="contrasena" class="text-sm font-semibold text-surface-700">Contraseña</label>
            <p-password 
              id="contrasena" 
              formControlName="contrasena"
              [feedback]="false"
              styleClass="w-full"
              [inputStyle]="{'width':'100%'}"
              placeholder="••••••••"
              [toggleMask]="true"
            ></p-password>
            <small *ngIf="loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid" class="text-red-500 font-medium">
              La contraseña es requerida
            </small>
          </div>

          <div class="mt-4">
            <p-button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading()"
              [loading]="isLoading()"
              label="Ingresar al sistema"
              styleClass="w-full"
              [style]="{'background-color': '#39A900', 'border-color': '#39A900', 'padding': '0.75rem'}"
            ></p-button>
          </div>
        </form>
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
