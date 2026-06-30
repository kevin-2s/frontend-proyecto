import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../infrastructure/services/auth.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <div class="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4 sm:p-6 lg:p-8 animate-fade-in">
      <!-- Bigger Facebook-style Profile Card -->
      <div class="bg-white rounded-[32px] shadow-xl max-w-2xl w-full relative overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-2xl">
        
        <!-- Banner / Portada (Facebook style) -->
        <div class="h-44 w-full bg-gradient-to-r from-[#39A900] to-[#5cde00] relative">
          <!-- Decorative subtle pattern overlay -->
          <div class="absolute inset-0 bg-black/5 opacity-10"></div>
          <!-- Corner design elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-lg"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-lg"></div>
        </div>

        <!-- Avatar overlapping the banner -->
        <div class="flex flex-col items-center -mt-16 px-6 pb-6 relative border-b border-slate-100">
          
          <!-- Interactive Avatar Container -->
          <div class="relative group/avatar cursor-pointer animate-fade-in" (click)="fileInput.click()" title="Cambiar foto de perfil">
            <!-- Avatar picture or Initials -->
            <div class="w-32 h-32 rounded-full border-4 border-white bg-white text-[#39A900] flex items-center justify-center font-black text-4xl shadow-lg z-10 overflow-hidden relative">
              <img *ngIf="userAvatar()" [src]="userAvatar()" class="w-full h-full object-cover select-none pointer-events-none" />
              <div *ngIf="!userAvatar()" class="w-full h-full bg-slate-50 flex items-center justify-center select-none">
                {{ getUserInitials() }}
              </div>
            </div>
            
            <!-- Camera Overlay Icon on Hover -->
            <div class="absolute inset-0 bg-black/40 rounded-full border-4 border-transparent flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 z-20">
              <i class="pi pi-camera text-2xl animate-pulse"></i>
            </div>
          </div>
          
          <!-- Hidden File Input -->
          <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden" />

          <!-- Remove Photo Button -->
          <button *ngIf="userAvatar()" (click)="quitarFoto($event)"
                  class="mt-2 text-[11px] font-bold text-red-500 hover:text-red-700 transition border-none bg-transparent cursor-pointer outline-none flex items-center gap-1">
            <i class="pi pi-trash text-[10px]"></i> Quitar foto
          </button>
          
          <h2 class="text-2xl font-black text-slate-800 m-0 mt-4 text-center">
            {{ currentUser()?.nombre }}
          </h2>
          
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-4.5 py-1.5 rounded-full border border-emerald-100 shadow-sm">
              {{ getUserRoleName() }}
            </span>
            <span [class]="currentUser()?.estado ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'"
                  class="text-xs font-bold px-4.5 py-1.5 rounded-full border shadow-sm">
              {{ currentUser()?.estado ? 'Cuenta Activa' : 'Cuenta Inactiva' }}
            </span>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="loadingProfile()" class="flex flex-col items-center justify-center py-20">
          <i class="pi pi-spin pi-spinner text-3xl text-[#39A900] mb-3"></i>
          <span class="text-xs font-semibold text-slate-400">Cargando información del usuario...</span>
        </div>

        <!-- Ordered Info Grid -->
        <div *ngIf="!loadingProfile() && currentUser()" class="p-8 bg-slate-50/40 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0">
              <i class="pi pi-user text-[#39A900]"></i>
              Información Completa de la Cuenta
            </h3>
            
            <button *ngIf="!isEditing()" (click)="activarEdicion()"
                    class="flex items-center gap-2 px-4 py-1.5 bg-[#39A900] text-white hover:bg-green-700 font-bold text-xs rounded-xl transition border-none cursor-pointer shadow-sm outline-none">
              <i class="pi pi-user-edit text-xs"></i> Editar Perfil
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left">
            
            <!-- Documento -->
            <div class="flex items-center gap-4.5">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="pi pi-id-card text-base"></i>
              </div>
              <div class="flex flex-col min-w-0 w-full">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Documento de Identidad</span>
                <div *ngIf="isEditing()" class="mt-1">
                  <input type="text" [(ngModel)]="editForm.documento" 
                         class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
                <span *ngIf="!isEditing()" class="text-sm font-semibold text-slate-700 mt-1">{{ currentUser()?.documento ?? '—' }}</span>
              </div>
            </div>

            <!-- Nombre Completo -->
            <div class="flex items-center gap-4.5">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="pi pi-user text-base"></i>
              </div>
              <div class="flex flex-col min-w-0 w-full">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</span>
                <div *ngIf="isEditing()" class="mt-1">
                  <input type="text" [(ngModel)]="editForm.nombre" 
                         class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
                <span *ngIf="!isEditing()" class="text-sm font-semibold text-slate-700 mt-1">{{ currentUser()?.nombre }}</span>
              </div>
            </div>

            <!-- Correo electrónico -->
            <div class="flex items-center gap-4.5">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="pi pi-envelope text-base"></i>
              </div>
              <div class="flex flex-col min-w-0 w-full">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</span>
                <div *ngIf="isEditing()" class="mt-1">
                  <input type="email" [(ngModel)]="editForm.correo" 
                         class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
                <span *ngIf="!isEditing()" class="text-sm font-semibold text-slate-700 mt-1 truncate" [title]="currentUser()?.correo">{{ currentUser()?.correo }}</span>
              </div>
            </div>

            <!-- Rol -->
            <div class="flex items-center gap-4.5">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="pi pi-shield text-base"></i>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rol de Permisos</span>
                <span class="text-sm font-semibold text-slate-700 mt-1">{{ getUserRoleName() }}</span>
              </div>
            </div>

            <!-- Teléfono -->
            <div class="flex items-center gap-4.5">
              <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <i class="pi pi-phone text-base"></i>
              </div>
              <div class="flex flex-col min-w-0 w-full">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</span>
                <div *ngIf="isEditing()" class="mt-1">
                  <input type="text" [(ngModel)]="editForm.telefono" 
                         class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#39A900]/30 focus:border-[#39A900]" />
                </div>
                <span *ngIf="!isEditing()" class="text-sm font-semibold text-slate-700 mt-1">{{ currentUser()?.telefono ?? '—' }}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-between px-8 py-5 bg-slate-50 border-t border-slate-100 gap-3">
          <span class="text-[11px] font-semibold text-slate-400 self-center">Sesión iniciada correctamente</span>
          
          <div *ngIf="isEditing()" class="flex gap-2">
            <button (click)="cancelarEdicion()"
                    class="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition cursor-pointer outline-none bg-white">
              Cancelar
            </button>
            <button (click)="guardarCambios()" [disabled]="guardando()"
                    class="px-4 py-2 bg-[#39A900] text-white hover:bg-green-700 font-bold text-xs rounded-xl transition border-none cursor-pointer shadow-sm outline-none disabled:opacity-60 flex items-center gap-1.5">
              <i *ngIf="guardando()" class="pi pi-spin pi-spinner text-[10px]"></i>
              {{ guardando() ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);

  currentUser = this.authService.currentUser;
  loadingProfile = signal(false);
  isEditing = signal(false);
  guardando = signal(false);

  editForm = {
    nombre: '',
    documento: '',
    correo: '',
    telefono: ''
  };

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.cargarPerfil();
    }
  }

  cargarPerfil() {
    this.loadingProfile.set(true);
    this.authService.loadUserProfile();
    setTimeout(() => {
      this.loadingProfile.set(false);
    }, 400);
  }

  activarEdicion() {
    const user = this.currentUser();
    if (user) {
      this.editForm = {
        nombre: user.nombre || '',
        documento: user.documento || '',
        correo: user.correo || '',
        telefono: user.telefono || ''
      };
      this.isEditing.set(true);
    }
  }

  cancelarEdicion() {
    this.isEditing.set(false);
  }

  guardarCambios() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    if (!this.editForm.nombre || !this.editForm.correo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre y correo son obligatorios'
      });
      return;
    }

    this.guardando.set(true);
    this.usuarioService.update(userId, this.editForm).subscribe({
      next: (res: any) => {
        this.guardando.set(false);
        this.isEditing.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Perfil actualizado correctamente'
        });
        this.cargarPerfil();
      },
      error: () => {
        this.guardando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el perfil'
        });
      }
    });
  }

  getUserInitials(): string {
    const role = this.authService.getUserRole() || '';
    if (!role) return 'US';
    return role.substring(0, 2).toUpperCase();
  }

  getUserRoleName(): string {
    const role = this.authService.getUserRole() || 'Usuario';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  userAvatar() {
    return this.authService.userAvatar();
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La imagen supera el límite de 2MB'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.authService.updateAvatar(base64);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto de perfil actualizada'
        });
      };
      reader.readAsDataURL(file);
    }
  }

  quitarFoto(event: MouseEvent): void {
    event.stopPropagation();
    this.authService.updateAvatar(null);
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Foto de perfil eliminada'
    });
  }
}
