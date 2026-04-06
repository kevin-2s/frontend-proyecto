import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../infrastructure/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-[#39A900] mb-2 tracking-tight">SENA</h1>
          <h2 class="text-xl text-gray-700 font-medium">Sistema de Gestión de Materiales</h2>
        </div>

        <div *ngIf="errorMsg()" class="mb-4 p-3 bg-[#DC3545] text-white rounded text-sm text-center">
          {{ errorMsg() }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input 
              id="correo" 
              type="email" 
              formControlName="correo"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition-all"
              placeholder="usuario@sena.edu.co"
            >
            <div *ngIf="loginForm.get('correo')?.touched && loginForm.get('correo')?.invalid" class="text-[#DC3545] text-xs mt-1">
              Correo es requerido y debe ser válido
            </div>
          </div>

          <div>
            <label for="contrasena" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              id="contrasena" 
              type="password" 
              formControlName="contrasena"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#39A900] focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            >
            <div *ngIf="loginForm.get('contrasena')?.touched && loginForm.get('contrasena')?.invalid" class="text-[#DC3545] text-xs mt-1">
              Contraseña requerida
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading()"
            class="w-full bg-[#39A900] hover:bg-[#2D8600] text-white font-bold py-2.5 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            <span *ngIf="isLoading()" class="mr-2">Cargando...</span>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]]
  });

  isLoading = signal(false);
  errorMsg = signal('');

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set('');

    const { correo, contrasena } = this.loginForm.getRawValue();

    this.authService.login(correo, contrasena).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Credenciales incorrectas o error en el servidor');
      }
    });
  }
}
