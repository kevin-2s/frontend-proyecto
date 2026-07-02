import { Component, OnInit, inject, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ViewEncapsulation } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { RolService } from '../../infrastructure/services/rol.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { Rol } from '../../domain/models/rol.model';
import { OnlyLettersDirective } from '../directives/only-letters.directive';
import { OnlyNumbersDirective } from '../directives/only-numbers.directive';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    TagModule,
    ToggleSwitchModule,
    SelectModule,
    PasswordModule,
    OnlyLettersDirective,
    OnlyNumbersDirective
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService],
  styles: [`
    /* ── Pill Toggle Button ── */
    .perm-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 16px;
      border-radius: 999px;
      border: 1.8px solid;
      background: #fff;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      outline: none;
      transition: all 0.22s cubic-bezier(.4,0,.2,1);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .perm-pill-btn.on {
      border-color: #39A900;
      color: #39A900;
    }
    .perm-pill-btn.on:hover {
      background: rgba(57,169,0,.06);
      box-shadow: 0 0 0 3px rgba(57,169,0,.12);
    }
    .perm-pill-btn.off {
      border-color: #ef4444;
      color: #ef4444;
    }
    .perm-pill-btn.off:hover {
      background: rgba(239,68,68,.06);
      box-shadow: 0 0 0 3px rgba(239,68,68,.12);
    }

    /* Removed .perm-card as per user request */
    /* Icons removed per user request */

    /* ── Group header ── */
    .perm-group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(57,169,0,.12);
    }
    .perm-group-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #39A900, #5cde00);
      flex-shrink: 0;
    }

    /* scrollbar */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 99px; }

    /* Custom Role Dialog styles */
    ::ng-deep .custom-role-dialog .p-dialog-content {
      padding: 0 !important;
      background: white !important;
      border-radius: 24px !important;
    }
    ::ng-deep .custom-role-dialog {
      border: none !important;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
      border-radius: 24px !important;
      overflow: hidden !important;
    }
  `],
  template: `
    <p-toast></p-toast>

    <div class="module-container">

      <!-- Header -->
      <div class="module-header" style="align-items: flex-start; flex-direction: column;">
        <div class="w-full flex justify-between items-center mb-4">
          <h3 class="page-title mb-0">
            <i class="pi pi-shield"></i> Roles y Usuarios
          </h3>
          <div class="header-actions">
            <div class="search-wrapper">
              <i class="pi pi-search"></i>
              <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrarGlobal()" placeholder="Buscar..." class="search-input" />
            </div>

            <!-- Botón Crear Rol (en pestaña de Roles) -->
            <button
              *ngIf="currentView === 'permisos-rol'"
              type="button"
              class="btn-add btn-open-form"
              (click)="openNewRolDialog()"
            >
              <i class="pi pi-plus-circle"></i>
              Crear Rol
            </button>

            <!-- Botón Crear Usuario -->
            <button
              *ngIf="currentView === 'usuarios' && !showUserForm"
              type="button"
              class="btn-add btn-open-form"
              (click)="toggleUserForm()"
            >
              <i class="pi pi-user-plus"></i>
              Crear Usuario
            </button>
            <button
              *ngIf="currentView === 'usuarios' && showUserForm"
              type="button"
              class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none"
              (click)="toggleUserForm()"
            >
              <i class="pi pi-times"></i>
              Cerrar Formulario
            </button>
          </div>
        </div>



        <!-- INLINE FORM FOR USER -->
        <div *ngIf="showUserForm" class="inline-form-container w-full bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
              <i class="pi pi-user-edit text-[#39A900] text-xl"></i>
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevoUsuario ? 'Añadir Nuevo Usuario' : 'Editar Usuario' }}</h4>
              <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el usuario en el sistema</p>
            </div>
          </div>
          
          <div class="p-6 flex flex-col gap-6">
            <div class="product-form-row p-0">
              
              <!-- Nombres -->
              <div class="form-field">
                <label for="nombre">Nombres <span class="text-red-500">*</span></label>
                <input pInputText id="nombre" [(ngModel)]="usuarioForm.nombre" onlyLetters placeholder="Ej: Juan Carlos" />
              </div>

              <!-- Apellidos -->
              <div class="form-field">
                <label for="apellidos">Apellidos <span class="text-red-500">*</span></label>
                <input pInputText id="apellidos" [(ngModel)]="usuarioForm.apellidos" onlyLetters placeholder="Ej: Pérez Gómez" />
              </div>

              <!-- Correo Electrónico -->
              <div class="form-field">
                <label for="correo">Correo Electrónico <span class="text-red-500">*</span></label>
                <input pInputText type="email" id="correo" [(ngModel)]="usuarioForm.correo" placeholder="Ej: juan.perez@sena.edu.co" />
              </div>

              <!-- Rol -->
              <div class="form-field">
                <label>Rol <span class="text-red-500">*</span></label>
                <div class="input-with-button">
                  <p-select [options]="roles" [(ngModel)]="usuarioForm.id_rol" optionLabel="nombre" optionValue="id_rol" placeholder="Seleccione un rol" styleClass="w-full flex items-center" appendTo="body" [disabled]="!isSuperAdmin && !esNuevoUsuario && esAdmin(usuarioForm.id_rol)"></p-select>
                  <button pButton type="button" icon="pi pi-plus" class="btn-inline-add" (click)="openNewRolDialog()"></button>
                </div>
              </div>

              <!-- Tipo de Documento -->
              <div class="form-field">
                <label>Tipo de Documento <span class="text-red-500">*</span></label>
                <p-select [options]="tipoDocumentoOpciones" [(ngModel)]="usuarioForm.tipo_documento" placeholder="Seleccione tipo" styleClass="w-full flex items-center" appendTo="body" [style]="{'width':'100%'}"></p-select>
              </div>

              <!-- Número de Documento (Solo si se selecciona Tipo de Documento) -->
              <div class="form-field" *ngIf="usuarioForm.tipo_documento">
                <label for="documento">Número de Documento <span class="text-red-500">*</span></label>
                <input 
                  pInputText 
                  id="documento" 
                  [(ngModel)]="usuarioForm.numero_documento" 
                  onlyNumbers
                  placeholder="Ej: 1098765432" 
                  class="w-full"
                />
              </div>

              <!-- Teléfono -->
              <div class="form-field">
                <label for="telefono">Teléfono</label>
                <input pInputText id="telefono" [(ngModel)]="usuarioForm.telefono" onlyNumbers placeholder="Ej: 3123456789" class="w-full" />
              </div>

              <!-- Estado -->
              <div class="form-field">
                <label>Estado <span class="text-red-500">*</span></label>
                <p-select [options]="estadoOpciones" [(ngModel)]="usuarioForm.estado" optionLabel="label" optionValue="value" placeholder="Seleccione estado" styleClass="w-full flex items-center" appendTo="body"></p-select>
              </div>

              <!-- Contraseña (Solo si es nuevo) -->
              <div class="form-field" *ngIf="esNuevoUsuario">
                <label>Contraseña <span class="text-red-500">*</span></label>
                <p-password [(ngModel)]="usuarioForm.password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}" inputStyleClass="w-full" [toggleMask]="true" appendTo="body" placeholder="••••••••"></p-password>
              </div>

            </div>

            <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
              <button type="button" class="btn-cancelar" (click)="toggleUserForm()">Cancelar</button>
              <button type="button" class="btn-guardar" (click)="guardarUsuario()" [disabled]="savingUser">{{ savingUser ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            type="button"
            [class]="currentView === 'usuarios' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            (click)="setView('usuarios')"
          >
            <i class="pi pi-users"></i>
            Usuarios
          </button>
          <button 
            type="button"
            [class]="currentView === 'permisos-rol' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            (click)="setView('permisos-rol')"
          >
            <i class="pi pi-shield"></i>
            Permisos por Rol
          </button>
          <button 
            type="button"
            [class]="currentView === 'permisos-usuario' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            (click)="setView('permisos-usuario')"
          >
            <i class="pi pi-key"></i>
            Permisos por Usuario
          </button>
        </div>
      </div>

      <!-- USUARIOS VIEW (Synced with Roles) -->
      <div *ngIf="currentView === 'usuarios'" class="view-content">
        <div class="table-card">
          
          <p-table
            [value]="usuariosFiltrados"
            [paginator]="true"
            [rows]="15"
            styleClass="modern-table"
            [loading]="loading"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 100px">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th>Estado</th>
                <th style="width: 100px; text-align: center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-u>
              <tr>
                <td><span class="id-badge">#{{ u.id || u.id_usuario }}</span></td>
                <td class="font-bold">{{ u.nombre || u.nombreCompleto }}</td>
                <td class="text-slate-500">{{ u.correo }}</td>
                <td>
                  <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)" styleClass="text-[10px] px-2 py-0.5 rounded-md"></p-tag>
                </td>
                <td>
                   <p-tag [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" [severity]="u.estado ? 'success' : 'danger'" styleClass="px-3 py-1 rounded-lg text-[10px]"></p-tag>
                </td>
                <td>
                  <div class="action-buttons justify-center">
                    <button
                      pButton
                      icon="pi pi-pencil"
                      class="btn-table-action btn-editor btn-open-form"
                      (click)="editarUsuario(u)"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="empty-message">
                  <i class="pi pi-users"></i>
                  <p>No hay usuarios registrados para mostrar</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>

      <!-- PERMISOS POR USUARIO VIEW -->
      <div *ngIf="currentView === 'permisos-usuario'" class="view-content flex flex-col gap-6">

        <!-- Tabla de Usuarios -->
        <div class="data-table-wrapper">
          <p-table
            [value]="usuariosFiltrados"
            [paginator]="true"
            [rows]="15"
            styleClass="modern-table"
            [rowHover]="true"
            [loading]="loading"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 80px">ID</th>
                <th>Nombre Completo</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th style="width: 110px">Estado</th>
                <th style="width: 100px" class="text-center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-u>
              <tr [class.bg-[#39A900]/5]="usuarioSeleccionado?.id_usuario === u.id_usuario || usuarioSeleccionado?.id === u.id">
                <td><span class="id-badge">#{{ u.id || u.id_usuario }}</span></td>
                <td><span class="font-bold text-slate-800">{{ u.nombre || u.nombreCompleto }}</span></td>
                <td><span class="text-slate-500 text-sm">{{ u.correo }}</span></td>
                <td>
                  <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)" styleClass="text-[10px] px-2 py-0.5 rounded-md"></p-tag>
                </td>
                <td>
                  <p-tag [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" [severity]="u.estado ? 'success' : 'danger'" styleClass="px-3 py-1 rounded-lg text-[10px]"></p-tag>
                </td>
                <td>
                  <div class="action-buttons justify-center">
                    <button
                      pButton
                      icon="pi pi-pencil"
                      class="btn-table-action btn-editor"
                      (click)="seleccionarUsuario(u)"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="empty-message">
                  <i class="pi pi-users"></i>
                  <p>No hay usuarios registrados para mostrar</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Inline Card: Permisos del usuario seleccionado (below table) -->
        <div *ngIf="usuarioSeleccionado" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <!-- Card Header -->
          <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
                <i class="pi pi-key text-[#39A900] text-xl"></i>
              </div>
              <div>
                <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">
                  Permisos de {{ usuarioSeleccionado.nombre || usuarioSeleccionado.nombreCompleto }}
                </h4>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Rol: <span class="font-bold text-slate-700">{{ getRolNombre(usuarioSeleccionado.id_rol) }}</span>
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 border-none rounded-xl cursor-pointer transition-all outline-none flex items-center gap-2"
                (click)="restablecerPermisosUsuario()"
                [disabled]="loadingPermisos"
              >
                <i class="pi pi-refresh" [class.pi-spin]="loadingPermisos"></i>
                Restablecer al Rol
              </button>
              <button
                type="button"
                class="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all outline-none flex items-center gap-2"
                (click)="usuarioSeleccionado = null; permisosAgrupados = {}; otrosSubmodules = []"
              >
                <i class="pi pi-times"></i>
                Cerrar
              </button>
            </div>
          </div>

          <!-- Card Body: Permisos agrupados por módulo del sistema -->
          <div class="p-6">
            <div *ngIf="loadingPermisos" class="flex flex-col items-center justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-[#39A900]"></i>
              <span class="text-xs text-slate-400 mt-2 font-semibold">Cargando mapa de accesos...</span>
            </div>

            <div *ngIf="!loadingPermisos" class="max-h-[600px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-8">
              
              <!-- Recorrer módulos del frontend -->
              <ng-container *ngFor="let m of frontendModules">
                <div *ngIf="hasPermissionsForModule(m)" class="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <!-- Título del módulo principal con su ícono y diseño premium -->
                  <h5 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <i [class]="'pi ' + m.icon + ' text-[#39A900] text-sm'"></i>
                    {{ m.title }}
                  </h5>
                  
                  <!-- Cuadrícula para submódulos asignados a este módulo principal -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                    <ng-container *ngFor="let sub of m.submodules">
                      <div *ngIf="permisosAgrupados[sub.key] && permisosAgrupados[sub.key].length > 0">
                        <div class="perm-group-header">
                          <span class="perm-group-dot"></span>
                          <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{{ sub.label }}</span>
                          <span class="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                            {{ permisosAgrupados[sub.key].length }} permisos
                          </span>
                        </div>

                        <div class="flex flex-col">
                          <div *ngFor="let p of permisosAgrupados[sub.key]"
                               class="flex items-center py-3 border-b border-slate-100 last:border-0 transition-opacity"
                               [class.opacity-60]="!p.tiene_permiso">
                            <div class="flex flex-col min-w-0 w-1/2 pr-4">
                              <span class="font-bold text-slate-800 text-sm leading-tight truncate" [title]="getFriendlyPermissionDescription(p.nombre, p.descripcion)">
                                {{ getFriendlyPermissionDescription(p.nombre, p.descripcion) }}
                              </span>
                              <span class="text-[10.5px] text-slate-400 truncate font-mono" [title]="p.nombre">{{ p.nombre }}</span>
                            </div>
                            <div class="flex items-center gap-3 flex-shrink-0">
                              <button
                                type="button"
                                class="perm-pill-btn"
                                [class.on]="p.tiene_permiso"
                                [class.off]="!p.tiene_permiso"
                                (click)="togglePermiso(p, !p.tiene_permiso)"
                                [attr.aria-label]="p.tiene_permiso ? 'Desactivar permiso' : 'Activar permiso'"
                              >
                                <i [class]="p.tiene_permiso ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                                {{ p.tiene_permiso ? 'Activo' : 'Inactivo' }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                </div>
              </ng-container>

              <!-- Sección "Otros" para submódulos del backend que no están en el mapeo explícito del frontend -->
              <div *ngIf="otrosSubmodules.length > 0" class="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h5 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <i class="pi pi-question-circle text-[#39A900] text-sm"></i>
                  Otros Módulos
                </h5>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  <div *ngFor="let key of otrosSubmodules">
                    <div class="perm-group-header">
                      <span class="perm-group-dot"></span>
                      <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{{ formatPermisoName(key) }}</span>
                      <span class="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                        {{ permisosAgrupados[key].length }} permisos
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <div *ngFor="let p of permisosAgrupados[key]"
                           class="flex items-center py-3 border-b border-slate-100 last:border-0 transition-opacity"
                           [class.opacity-60]="!p.tiene_permiso">
                        <div class="flex flex-col min-w-0 w-1/2 pr-4">
                          <span class="font-bold text-slate-800 text-sm leading-tight truncate" [title]="getFriendlyPermissionDescription(p.nombre, p.descripcion)">
                            {{ getFriendlyPermissionDescription(p.nombre, p.descripcion) }}
                          </span>
                          <span class="text-[10.5px] text-slate-400 truncate font-mono" [title]="p.nombre">{{ p.nombre }}</span>
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                          <button
                            type="button"
                            class="perm-pill-btn"
                            [class.on]="p.tiene_permiso"
                            [class.off]="!p.tiene_permiso"
                            (click)="togglePermiso(p, !p.tiene_permiso)"
                            [attr.aria-label]="p.tiene_permiso ? 'Desactivar permiso' : 'Activar permiso'"
                          >
                            <i [class]="p.tiene_permiso ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                            {{ p.tiene_permiso ? 'Activo' : 'Inactivo' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- PERMISOS POR ROL VIEW -->
      <div *ngIf="currentView === 'permisos-rol'" class="view-content flex flex-col gap-6">
        <!-- Tabla de Roles -->
        <div class="data-table-wrapper">
          <p-table
            [value]="roles"
            [paginator]="true"
            [rows]="15"
            styleClass="modern-table"
            [rowHover]="true"
            [loading]="loading"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 100px">ID</th>
                <th>Nombre del Rol</th>
                <th style="width: 100px; text-align: center">Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-r>
              <tr [class.bg-[#39A900]/5]="rolSeleccionado?.id_rol === r.id_rol">
                <td><span class="id-badge">#{{ r.id_rol }}</span></td>
                <td><span class="font-bold text-slate-800">{{ r.nombre }}</span></td>
                <td>
                  <div class="action-buttons justify-center">
                    <button
                      pButton
                      icon="pi pi-pencil"
                      class="btn-table-action btn-editor"
                      (click)="seleccionarRol(r)"
                      [disabled]="!isSuperAdmin && (r.nombre?.toUpperCase() === 'SUPER ADMINISTRADOR' || r.nombre?.toUpperCase() === 'ADMINISTRADOR')"
                    ></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="3" class="empty-message">
                  <i class="pi pi-shield"></i>
                  <p>No hay roles registrados para mostrar</p>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <!-- Inline Card: Permisos del rol seleccionado -->
        <div *ngIf="rolSeleccionado" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
          <!-- Card Header -->
          <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
                <i class="pi pi-shield text-[#39A900] text-xl"></i>
              </div>
              <div>
                <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">
                  Permisos de {{ rolSeleccionado.nombre }}
                </h4>
                <p class="text-xs text-slate-500 m-0 mt-0.5">
                  Gestionar permisos base para todos los usuarios asignados a este rol
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all outline-none flex items-center gap-2"
                (click)="rolSeleccionado = null; permisosRolIds = []"
              >
                <i class="pi pi-times"></i>
                Cerrar
              </button>
            </div>
          </div>

          <!-- Card Body: Permisos agrupados por módulo del sistema -->
          <div class="p-6">
            <div *ngIf="loadingPermisosRol" class="flex flex-col items-center justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-[#39A900]"></i>
              <span class="text-xs text-slate-400 mt-2 font-semibold">Cargando mapa de accesos del rol...</span>
            </div>

            <div *ngIf="!loadingPermisosRol" class="max-h-[600px] overflow-y-auto pr-3 custom-scrollbar flex flex-col gap-8">
              
              <!-- Recorrer módulos -->
              <ng-container *ngFor="let m of frontendModules">
                <div *ngIf="hasPermissionsForModuleRol(m)" class="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <h5 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2 pb-2 border-b border-slate-200/60">
                    <i [class]="'pi ' + m.icon + ' text-[#39A900] text-sm'"></i>
                    {{ m.title }}
                  </h5>
                  
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                    <ng-container *ngFor="let sub of m.submodules">
                      <div *ngIf="permisosTodos[sub.key] && permisosTodos[sub.key].length > 0">
                        <div class="perm-group-header">
                          <span class="perm-group-dot"></span>
                          <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{{ sub.label }}</span>
                          <span class="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                            {{ permisosTodos[sub.key].length }} permisos
                          </span>
                        </div>

                        <div class="flex flex-col">
                          <div *ngFor="let p of permisosTodos[sub.key]"
                               class="flex items-center py-3 border-b border-slate-100 last:border-0 transition-opacity"
                               [class.opacity-60]="!isPermisoRolActive(p.id_permiso)">
                            <div class="flex flex-col min-w-0 w-1/2 pr-4">
                              <span class="font-bold text-slate-800 text-sm leading-tight truncate" [title]="getFriendlyPermissionDescription(p.nombre, p.descripcion)">
                                {{ getFriendlyPermissionDescription(p.nombre, p.descripcion) }}
                              </span>
                              <span class="text-[10.5px] text-slate-400 truncate font-mono" [title]="p.nombre">{{ p.nombre }}</span>
                            </div>
                            <div class="flex items-center gap-3 flex-shrink-0">
                              <button
                                type="button"
                                class="perm-pill-btn"
                                [class.on]="isPermisoRolActive(p.id_permiso)"
                                [class.off]="!isPermisoRolActive(p.id_permiso)"
                                (click)="togglePermisoRol(p, !isPermisoRolActive(p.id_permiso))"
                              >
                                <i [class]="isPermisoRolActive(p.id_permiso) ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                                {{ isPermisoRolActive(p.id_permiso) ? 'Activo' : 'Inactivo' }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                </div>
              </ng-container>

              <!-- Sección "Otros" para Roles -->
              <div *ngIf="getOtrosSubmodulesRol().length > 0" class="bg-slate-50/40 border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h5 class="text-xs font-black text-slate-800 uppercase tracking-widest mb-5 flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <i class="pi pi-question-circle text-[#39A900] text-sm"></i>
                  Otros Módulos
                </h5>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                  <div *ngFor="let key of getOtrosSubmodulesRol()">
                    <div class="perm-group-header">
                      <span class="perm-group-dot"></span>
                      <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{{ formatPermisoName(key) }}</span>
                      <span class="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                        {{ permisosTodos[key].length }} permisos
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <div *ngFor="let p of permisosTodos[key]"
                           class="flex items-center py-3 border-b border-slate-100 last:border-0 transition-opacity"
                           [class.opacity-60]="!isPermisoRolActive(p.id_permiso)">
                        <div class="flex flex-col min-w-0 w-1/2 pr-4">
                          <span class="font-bold text-slate-800 text-sm leading-tight truncate" [title]="getFriendlyPermissionDescription(p.nombre, p.descripcion)">
                            {{ getFriendlyPermissionDescription(p.nombre, p.descripcion) }}
                          </span>
                          <span class="text-[10.5px] text-slate-400 truncate font-mono" [title]="p.nombre">{{ p.nombre }}</span>
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                          <button
                            type="button"
                            class="perm-pill-btn"
                            [class.on]="isPermisoRolActive(p.id_permiso)"
                            [class.off]="!isPermisoRolActive(p.id_permiso)"
                            (click)="togglePermisoRol(p, !isPermisoRolActive(p.id_permiso))"
                          >
                            <i [class]="isPermisoRolActive(p.id_permiso) ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                            {{ isPermisoRolActive(p.id_permiso) ? 'Activo' : 'Inactivo' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <!-- Modal Registrar Nuevo Rol (PrimeNG Dialog appended to body) -->
      <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
        header="✨ Registrar Nuevo Rol" [(visible)]="showRolForm"
        [modal]="true" [style]="{width:'90vw',maxWidth:'400px'}"
        [draggable]="true" [resizable]="false"
        styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
        <div class="form-grid mt-2">
          <div class="form-field">
            <label for="rol-nombre-modal">Nombre del Rol *</label>
            <input
              pInputText
              id="rol-nombre-modal"
              [(ngModel)]="rol.nombre"
              onlyLetters
              placeholder="Ej: INSTRUCTOR"
              class="w-full"
            />
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button pButton label="Cancelar" class="btn-cancelar" (click)="showRolForm = false; rol = { nombre: '' }"></button>
            <button pButton [label]="saving ? 'Guardando...' : 'Guardar'" class="btn-guardar" [disabled]="saving || !rol.nombre?.trim()" (click)="guardar()"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>




  `
})
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  currentView: 'usuarios' | 'permisos-rol' | 'permisos-usuario' = 'usuarios';
  
  roles: Rol[] = [];
  filtro = '';

  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  filtroUser = '';
  
  showUserForm = false;
  esNuevoUsuario = true;
  savingUser = false;
  usuarioForm: any = {};
  estadoOpciones = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];
  tipoDocumentoOpciones = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.'];
  
  loading = false;
  saving = false;
  isAdmin = false;
  isSuperAdmin = false;

  rol: Partial<Rol> = { nombre: '' };

  // Permisos Granulares State
  usuarioSeleccionado: any = null;
  permisosAgrupados: any = {};
  loadingPermisos = false;
  displayRolDialog = false;
  showRolForm = false;

  // Permisos Granulares por Rol State
  rolSeleccionado: any = null;
  permisosTodos: any = {};
  permisosRolIds: number[] = [];
  loadingPermisosRol = false;
  
  // frontendModules, etc...
  // (Note: we just want to replace down to ngOnInit)


  frontendModules = [
    {
      title: 'Dashboard',
      icon: 'pi-home',
      submodules: [
        { key: 'dashboard', label: 'Dashboard' }
      ]
    },
    {
      title: 'Estructura',
      icon: 'pi-briefcase',
      submodules: [
        { key: 'centros', label: 'Centros de Formación' },
        { key: 'sedes', label: 'Sedes' },
        { key: 'areas', label: 'Áreas' },
        { key: 'fichas', label: 'Fichas y Programas' }
      ]
    },
    {
      title: 'Administración',
      icon: 'pi-users',
      submodules: [
        { key: 'usuarios', label: 'Usuarios' },
        { key: 'roles', label: 'Roles' }
      ]
    },
    {
      title: 'Inventario',
      icon: 'pi-box',
      submodules: [
        { key: 'inventario', label: 'Inventario General' },
        { key: 'productos', label: 'Productos' },
        { key: 'items', label: 'Items / Lotes' },
        { key: 'solicitudes', label: 'Solicitudes de Materiales' }
      ]
    },
    {
      title: 'Movimientos',
      icon: 'pi-arrows-h',
      submodules: [
        { key: 'movimientos', label: 'Movimientos de Entrada/Salida' },
        { key: 'devoluciones', label: 'Préstamos y Devoluciones' }
      ]
    },
    {
      title: 'Reportes y Auditoría',
      icon: 'pi-chart-bar',
      submodules: [
        { key: 'chequeos', label: 'Listas de Chequeo' },
        { key: 'actas', label: 'Actas de Entrega' }
      ]
    },
    {
      title: 'Utilidades',
      icon: 'pi-cog',
      submodules: [
        { key: 'notificaciones', label: 'Notificaciones del Sistema' }
      ]
    }
  ];

  otrosSubmodules: string[] = [];

  friendlyPerms: Record<string, string> = {
    // Dashboard
    'ver_dashboard': 'Visualizar panel de control (Dashboard)',
    
    // Estructura
    'ver_centros': 'Visualizar centros de formación',
    'ver_sedes': 'Visualizar sedes registradas',
    'ver_areas': 'Visualizar áreas de formación',
    'ver_fichas': 'Visualizar fichas y programas de formación',
    
    // Usuarios / Roles
    'ver_usuarios': 'Visualizar listado de usuarios registrados',
    'crear_usuarios': 'Registrar nuevos usuarios en el sistema',
    'editar_usuarios': 'Modificar perfiles e información de usuarios',
    'ver_roles': 'Visualizar y gestionar roles del sistema',
    
    // Inventario General
    'ver_inventario': 'Visualizar stock global y bodegas',
    'crear_inventario': 'Registrar ingreso de materiales',
    'editar_inventario': 'Modificar registros del inventario general',
    
    // Productos
    'ver_productos': 'Visualizar catálogo de productos',
    'crear_productos': 'Registrar nuevos productos en catálogo',
    'editar_productos': 'Modificar información de productos',
    'eliminar_productos': 'Dar de baja productos del catálogo',
    
    // Items
    'ver_items': 'Visualizar ítems individuales y lotes',
    'crear_items': 'Añadir nuevos ítems de stock',
    'editar_items': 'Modificar información de ítems',
    
    // Solicitudes
    'ver_solicitudes': 'Consultar solicitudes de materiales',
    'crear_solicitudes': 'Crear nuevas solicitudes de materiales',
    'aprobar_solicitudes': 'Aprobar solicitudes pendientes',
    'rechazar_solicitudes': 'Rechazar solicitudes recibidas',
    'entregar_solicitudes': 'Registrar entrega física de materiales',
    
    // Movimientos
    'ver_movimientos': 'Visualizar historial de movimientos',
    'crear_movimientos': 'Registrar nuevo movimiento de materiales',
    'ver_reportes': 'Generar y consultar reportes estadísticos',
    
    // Devoluciones
    'ver_devoluciones': 'Consultar devoluciones y préstamos',
    'crear_devoluciones': 'Registrar nuevos retornos de materiales',
    
    // Chequeos / Actas
    'ver_chequeos': 'Visualizar listas de chequeo realizadas',
    'crear_chequeos': 'Crear y registrar nuevas listas de chequeo',
    'ver_actas': 'Consultar actas de entrega/recibo',
    'crear_actas': 'Generar y firmar nuevas actas de entrega',
    
    // Notificaciones
    'ver_notificaciones': 'Recibir y gestionar alertas del sistema'
  };

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.cargarRoles();
    this.cargarUsuarios();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showUserForm && !this.showRolForm) return;

    const target = event.target as HTMLElement;
    const clickedInsideForm = target.closest('.inline-form-container');
    const clickedOpenButton = target.closest('.btn-open-form');
    const clickedOverlay = target.closest('.p-overlaypanel, .p-select-overlay, .p-dropdown-panel, .p-datepicker-panel, .p-toast, .p-tooltip, .p-dialog, .p-dialog-mask, .p-component-overlay');

    if (!clickedInsideForm && !clickedOpenButton && !clickedOverlay) {
      this.showUserForm = false;
      this.showRolForm = false;
    }
  }

  openNewRolDialog() {
    this.rol = { nombre: '' };
    this.showRolForm = true;
  }

  setView(view: 'usuarios' | 'permisos-rol' | 'permisos-usuario') {
    this.currentView = view;
    this.showUserForm = false;
    this.showRolForm = false;
    if (view === 'usuarios' || view === 'permisos-usuario') {
      if (this.usuarios.length === 0) {
        this.cargarUsuarios();
      }
    }
    if (view === 'permisos-rol') {
      if (this.roles.length === 0) {
        this.cargarRoles();
      }
    }
  }

  cargarRoles() {
    this.rolService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.roles = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.roles = [];
      },
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.usuarios = data;
        this.usuariosFiltrados = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
      }
    });
  }

  filtrarGlobal() {
    const f = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter((u) =>
      (u.nombre || u.nombreCompleto || '').toLowerCase().includes(f) ||
      (u.correo || '').toLowerCase().includes(f)
    );
  }

  guardar() {
    if (!this.rol.nombre || this.rol.nombre.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre del rol es requerido' });
      return;
    }

    this.saving = true;
    this.rolService.create({ nombre: this.rol.nombre }).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente' });
        this.rol = { nombre: '' };
        this.saving = false;
        this.showRolForm = false;
        this.cargarRoles();
        if (res && res.data && res.data.id_rol) {
          this.usuarioForm.id_rol = res.data.id_rol;
        }
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el rol' });
      },
    });
  }

  toggleUserForm() {
    if (this.showUserForm) {
      this.showUserForm = false;
    } else {
      this.openNewUsuario();
    }
  }

  getNuevoUsuario(): any {
    return {
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      tipo_documento: '',
      numero_documento: '',
      documento: '',
      password: '',
      estado: true,
      id_rol: null,
    };
  }

  openNewUsuario() {
    this.esNuevoUsuario = true;
    this.usuarioForm = this.getNuevoUsuario();
    this.showUserForm = true;
  }

  editarUsuario(u: any) {
    this.esNuevoUsuario = false;

    // Separar tipo de documento y número de documento
    let tipo_documento = '';
    let numero_documento = u.documento || '';
    if (u.documento) {
      const docClean = u.documento.trim();
      const tipos = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.', 'CC', 'TI', 'CE', 'PEP', 'PPT', 'PAS'];
      let found = false;
      for (const t of tipos) {
        if (docClean.toUpperCase().startsWith(t.toUpperCase())) {
          tipo_documento = t.includes('.') ? t : t.split('').join('.') + '.';
          numero_documento = docClean.substring(t.length).trim();
          found = true;
          break;
        }
      }
      if (!found) {
        tipo_documento = 'C.C.';
      }
    }

    let nombre = u.nombre || '';
    let apellidos = u.apellidos || '';
    if (!apellidos && nombre) {
      const parts = nombre.trim().split(/\s+/);
      if (parts.length > 1) {
        nombre = parts[0];
        apellidos = parts.slice(1).join(' ');
      }
    }

    this.usuarioForm = { 
      ...u, 
      nombre,
      apellidos,
      tipo_documento,
      numero_documento,
      password: '', // Limpiar contraseña por seguridad al editar
      id_rol: Number(u.id_rol || (u.rol ? u.rol.id : null))
    };
    this.showUserForm = true;
  }

  guardarUsuario() {
    // Validaciones basicas
    if (!this.usuarioForm.nombre || !this.usuarioForm.correo || !this.usuarioForm.id_rol || !this.usuarioForm.numero_documento || !this.usuarioForm.tipo_documento) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevoUsuario && !this.usuarioForm.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    // Validar nombre o cédula duplicada
    const nombreCompletoNuevo = ((this.usuarioForm.nombre || '').trim() + ' ' + (this.usuarioForm.apellidos || '').trim()).replace(/\s+/g, ' ').toLowerCase();
    const numeroDocNuevo = (this.usuarioForm.numero_documento || '').trim();

    const existeDuplicado = this.usuarios.some(u => {
      const currentId = this.usuarioForm.id_usuario || this.usuarioForm.id;
      if (!this.esNuevoUsuario && currentId && Number(u.id_usuario || u.id) === Number(currentId)) {
        return false;
      }

      // Comparar Nombres
      const nombreCompletoExistente = ((u.nombre || '').trim() + ' ' + (u.apellidos || '').trim()).replace(/\s+/g, ' ').toLowerCase();
      if (nombreCompletoExistente === nombreCompletoNuevo || (u.nombre || '').trim().toLowerCase() === nombreCompletoNuevo) {
        this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Ya existe un usuario registrado con este nombre y apellidos.' });
        return true;
      }

      // Comparar Cédula/Documento
      let numeroDocExistente = '';
      if (u.documento) {
        const docClean = u.documento.trim();
        const tipos = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.', 'CC', 'TI', 'CE', 'PEP', 'PPT', 'PAS'];
        let foundType = false;
        for (const t of tipos) {
          if (docClean.toUpperCase().startsWith(t.toUpperCase())) {
            numeroDocExistente = docClean.substring(t.length).trim();
            foundType = true;
            break;
          }
        }
        if (!foundType) {
          numeroDocExistente = docClean;
        }
      }

      if (numeroDocExistente !== '' && numeroDocExistente === numeroDocNuevo) {
        this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Ya existe un usuario registrado con este número de documento.' });
        return true;
      }

      return false;
    });

    if (existeDuplicado) {
      return;
    }

    this.savingUser = true;

    const docCompleto = this.usuarioForm.numero_documento ? `${this.usuarioForm.tipo_documento} ${this.usuarioForm.numero_documento.trim()}` : '';

    if (this.esNuevoUsuario) {
      const datosEnvio: any = {
        nombre: (this.usuarioForm.nombre.trim() + ' ' + (this.usuarioForm.apellidos || '').trim()).trim(),
        correo: this.usuarioForm.correo.trim(),
        id_rol: Number(this.usuarioForm.id_rol),
        password: this.usuarioForm.password
      };

      if (this.usuarioForm.telefono && this.usuarioForm.telefono.trim()) {
        datosEnvio.telefono = this.usuarioForm.telefono.trim();
      }
      if (docCompleto) {
        datosEnvio.documento = docCompleto;
      }

      this.usuarioService.create(datosEnvio).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
          this.showUserForm = false;
          this.savingUser = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.savingUser = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el usuario' });
        },
      });
    } else {
      const updateData: any = {
        nombre: (this.usuarioForm.nombre.trim() + ' ' + (this.usuarioForm.apellidos || '').trim()).trim(),
        correo: this.usuarioForm.correo.trim(),
        id_rol: Number(this.usuarioForm.id_rol),
        estado: this.usuarioForm.estado !== false
      };
      
      if (this.usuarioForm.telefono && this.usuarioForm.telefono.trim()) {
        updateData.telefono = this.usuarioForm.telefono.trim();
      } else {
        updateData.telefono = '';
      }

      if (docCompleto) {
        updateData.documento = docCompleto;
      } else {
        updateData.documento = '';
      }

      if (this.usuarioForm.password && this.usuarioForm.password.trim()) {
        updateData.password = this.usuarioForm.password;
      }

      this.usuarioService.update(this.usuarioForm.id_usuario || this.usuarioForm.id!, updateData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
          this.showUserForm = false;
          this.savingUser = false;
          this.cargarUsuarios();
        },
        error: (err) => {
          this.savingUser = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el usuario' });
        }
      });
    }
  }

  seleccionarRol(r: any) {
    this.rolSeleccionado = r;
    this.cargarPermisosRol(r.id_rol);
  }

  cargarPermisosRol(idRol: number) {
    this.loadingPermisosRol = true;
    if (Object.keys(this.permisosTodos).length === 0) {
      this.rolService.getTodosLosPermisos().subscribe({
        next: (res: any) => {
          this.permisosTodos = res.data || res || {};
          this.fetchPermisosDeRol(idRol);
        },
        error: () => {
          this.loadingPermisosRol = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del sistema' });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.fetchPermisosDeRol(idRol);
    }
  }

  private fetchPermisosDeRol(idRol: number) {
    this.rolService.getPermisos(idRol).subscribe({
      next: (res: any) => {
        const data = res.data || res || [];
        this.permisosRolIds = data.map((p: any) => p.id_permiso);
        this.loadingPermisosRol = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPermisosRol = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del rol' });
        this.cdr.detectChanges();
      }
    });
  }

  togglePermisoRol(p: any, active: boolean) {
    if (!this.rolSeleccionado) return;
    
    let nuevosPermisosIds = [...this.permisosRolIds];
    if (active) {
      if (!nuevosPermisosIds.includes(p.id_permiso)) {
        nuevosPermisosIds.push(p.id_permiso);
      }
    } else {
      nuevosPermisosIds = nuevosPermisosIds.filter(id => id !== p.id_permiso);
    }

    this.rolService.asignarPermisos(this.rolSeleccionado.id_rol, nuevosPermisosIds).subscribe({
      next: () => {
        this.permisosRolIds = nuevosPermisosIds;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Permisos del rol actualizados correctamente' });
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron actualizar los permisos del rol' });
        this.cdr.detectChanges();
      }
    });
  }

  hasPermissionsForModuleRol(module: any): boolean {
    if (!this.permisosTodos) return false;
    return module.submodules.some((sub: any) => this.permisosTodos[sub.key] && this.permisosTodos[sub.key].length > 0);
  }

  isPermisoRolActive(idPermiso: number): boolean {
    return this.permisosRolIds.includes(idPermiso);
  }

  getOtrosSubmodulesRol(): string[] {
    const mappedKeys = new Set<string>();
    this.frontendModules.forEach(m => {
      m.submodules.forEach(sub => mappedKeys.add(sub.key));
    });
    return Object.keys(this.permisosTodos).filter(
      key => !mappedKeys.has(key) && this.permisosTodos[key] && this.permisosTodos[key].length > 0
    );
  }

  seleccionarUsuario(u: any) {
    this.usuarioSeleccionado = u;
    this.cargarPermisos(u.id_usuario);
  }

  cargarPermisos(idUsuario: number) {
    this.loadingPermisos = true;
    this.usuarioService.getPermisos(idUsuario).subscribe({
      next: (res: any) => {
        this.permisosAgrupados = res.data || res || {};
        this.actualizarModulosActivos();
        this.loadingPermisos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPermisos = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del usuario' });
      }
    });
  }

  actualizarModulosActivos() {
    const mappedKeys = new Set<string>();
    this.frontendModules.forEach(m => {
      m.submodules.forEach(sub => mappedKeys.add(sub.key));
    });
    this.otrosSubmodules = Object.keys(this.permisosAgrupados).filter(
      key => !mappedKeys.has(key) && this.permisosAgrupados[key] && this.permisosAgrupados[key].length > 0
    );
  }

  hasPermissionsForModule(module: any): boolean {
    if (!this.permisosAgrupados) return false;
    return module.submodules.some((sub: any) => this.permisosAgrupados[sub.key] && this.permisosAgrupados[sub.key].length > 0);
  }

  getFriendlyPermissionDescription(name: string, backendDesc: string): string {
    return this.friendlyPerms[name] || backendDesc || this.formatPermisoName(name);
  }

  togglePermiso(p: any, active: boolean) {
    if (!this.usuarioSeleccionado) return;
    this.usuarioService.asignarPermiso(this.usuarioSeleccionado.id_usuario, p.id_permiso, active).subscribe({
      next: () => {
        p.tiene_permiso = active;
        p.heredado_de_rol = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Permiso actualizado correctamente' });
        this.cdr.detectChanges();
      },
      error: () => {
        p.tiene_permiso = !active;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el permiso' });
        this.cdr.detectChanges();
      }
    });
  }

  restablecerPermisosUsuario() {
    if (!this.usuarioSeleccionado) return;

    const nombreUsuario = this.usuarioSeleccionado.nombre || this.usuarioSeleccionado.nombreCompleto || 'usuario';
    const nombreRol = this.getRolNombre(this.usuarioSeleccionado.id_rol);
    const confirmar = confirm(`¿Está seguro de que desea restablecer los permisos de ${nombreUsuario} a los asignados por defecto para el rol "${nombreRol}"? Se eliminarán todas las excepciones personalizadas.`);
    if (!confirmar) return;

    this.loadingPermisos = true;
    this.usuarioService.restablecerPermisos(this.usuarioSeleccionado.id_usuario).subscribe({
      next: () => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Éxito', 
          detail: `Permisos restablecidos al rol ${nombreRol} correctamente` 
        });
        this.cargarPermisos(this.usuarioSeleccionado.id_usuario);
      },
      error: (err) => {
        this.loadingPermisos = false;
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: err.error?.message || 'No se pudieron restablecer los permisos' 
        });
        this.cdr.detectChanges();
      }
    });
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatPermisoName(name: string): string {
    if (!name) return '';
    return name
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  getRolNombre(id_rol: any): string {
    const rol = this.roles.find((r) => Number(r.id_rol) === Number(id_rol));
    return rol ? rol.nombre : 'Desconocido';
  }

  esAdmin(id_rol: any): boolean {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    return nombre.includes('ADMIN');
  }

  getRolSeverity(id_rol: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }
}
