import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
    PasswordModule
  ],
  providers: [MessageService],
  styles: [`
    /* ── Modern Premium Toggle ── */
    .perm-toggle-track {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 52px;
      height: 28px;
      border-radius: 999px;
      cursor: pointer;
      transition: background 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
      flex-shrink: 0;
      outline: none;
      border: none;
      padding: 0;
    }
    .perm-toggle-track.off {
      background: #1e293b;
      box-shadow: 0 0 0 0px #39A90000, inset 0 2px 6px rgba(0,0,0,.4);
    }
    .perm-toggle-track.on {
      background: linear-gradient(135deg, #39A900 0%, #5cde00 100%);
      box-shadow: 0 0 14px 2px rgba(57,169,0,.35), inset 0 1px 3px rgba(255,255,255,.15);
    }
    .perm-toggle-thumb {
      position: absolute;
      top: 4px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      transition: left 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
      box-shadow: 0 2px 6px rgba(0,0,0,.25);
    }
    .perm-toggle-track.off .perm-toggle-thumb {
      left: 4px;
      background: #64748b;
    }
    .perm-toggle-track.on .perm-toggle-thumb {
      left: 28px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(57,169,0,.35);
    }
    /* glow pulse when turning on */
    .perm-toggle-track.on {
      animation: toggleGlow 0.4s ease;
    }
    @keyframes toggleGlow {
      0%   { box-shadow: 0 0 0px 0px rgba(57,169,0,0); }
      50%  { box-shadow: 0 0 18px 6px rgba(57,169,0,.45); }
      100% { box-shadow: 0 0 14px 2px rgba(57,169,0,.35); }
    }

    /* ── Permiso card ── */
    .perm-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 14px;
      border: 1.5px solid #f1f5f9;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
      gap: 12px;
    }
    .perm-card.active {
      border-color: rgba(57,169,0,.25);
      background: linear-gradient(135deg, rgba(57,169,0,.03) 0%, #fff 100%);
      box-shadow: 0 2px 12px rgba(57,169,0,.08);
    }
    .perm-card:hover {
      border-color: rgba(57,169,0,.3);
      box-shadow: 0 4px 16px rgba(57,169,0,.1);
    }
    .perm-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 15px;
      transition: background 0.2s;
    }
    .perm-icon.active { background: rgba(57,169,0,.12); color: #39A900; }
    .perm-icon.inactive { background: #f1f5f9; color: #94a3b8; }

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

            <button
              *ngIf="currentView === 'usuarios' && showRolForm"
              type="button"
              class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none"
              (click)="showRolForm = false"
            >
              <i class="pi pi-times"></i>
              Cerrar
            </button>
            <!-- Botón Crear Usuario -->
            <button
              *ngIf="currentView === 'usuarios' && !showUserForm"
              type="button"
              class="btn-add"
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

        <!-- INLINE FORM FOR ROL -->
        <div *ngIf="showRolForm" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
              <i class="pi pi-shield text-[#39A900] text-xl"></i>
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">Registrar Nuevo Rol</h4>
              <p class="text-xs text-slate-500 m-0 mt-0.5">Crea un nuevo rol de acceso para asignar a los usuarios del sistema</p>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <!-- Nombre del Rol -->
              <div class="form-field">
                <input
                  pInputText
                  id="rol-nombre"
                  [(ngModel)]="rol.nombre"
                  placeholder="Ej: INSTRUCTOR, GESTOR"
                />
                <label for="rol-nombre">Nombre del Rol *</label>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                class="btn-cancelar"
                (click)="showRolForm = false; rol = { nombre: '' }"
              >Cancelar</button>
              <button
                type="button"
                class="btn-guardar"
                (click)="guardar()"
                [disabled]="saving || !rol.nombre?.trim()"
              >{{ saving ? 'Guardando...' : 'Guardar Rol' }}</button>
            </div>
          </div>
        </div>

        <!-- INLINE FORM FOR USER -->
        <div *ngIf="showUserForm" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
              <i class="pi pi-user-edit text-[#39A900] text-xl"></i>
            </div>
            <div>
              <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevoUsuario ? 'Añadir Nuevo Usuario' : 'Editar Usuario' }}</h4>
              <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el usuario en el sistema</p>
            </div>
          </div>
          
          <div class="p-6 flex flex-col gap-5">
            <div class="flex flex-col gap-5 pt-2">
              <!-- Primera Fila: Nombres y Apellidos -->
              <div class="flex flex-col sm:flex-row gap-5">
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.nombre && usuarioForm.nombre.trim() !== ''">
                  <input pInputText id="nombre" [(ngModel)]="usuarioForm.nombre" placeholder=" " class="w-full px-4 py-3 text-sm text-slate-800 rounded-xl outline-none" />
                  <label for="nombre">Nombres <span class="text-red-500">*</span></label>
                </div>
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.apellidos && usuarioForm.apellidos.trim() !== ''">
                  <input pInputText id="apellidos" [(ngModel)]="usuarioForm.apellidos" placeholder=" " class="w-full px-4 py-3 text-sm text-slate-800 rounded-xl outline-none" />
                  <label for="apellidos">Apellidos <span class="text-red-500">*</span></label>
                </div>
              </div>

              <!-- Segunda Fila: Correo y Rol -->
              <div class="flex flex-col sm:flex-row gap-5">
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.correo && usuarioForm.correo.trim() !== ''">
                  <input pInputText type="email" id="correo" [(ngModel)]="usuarioForm.correo" placeholder=" " class="w-full px-4 py-3 text-sm text-slate-800 rounded-xl outline-none" />
                  <label for="correo">Correo Electrónico <span class="text-red-500">*</span></label>
                </div>
                <div class="flex gap-2 items-end flex-1">
                  <div class="floating-label-group flex-1" [class.floating]="usuarioForm.id_rol !== undefined && usuarioForm.id_rol !== null">
                    <p-select [options]="roles" [(ngModel)]="usuarioForm.id_rol" optionLabel="nombre" optionValue="id_rol" placeholder=" " styleClass="w-full h-[46px] flex items-center" appendTo="body" [style]="{'width':'100%'}"></p-select>
                    <label>Rol <span class="text-red-500">*</span></label>
                  </div>
                  <button type="button" pTooltip="Crear nuevo rol" tooltipPosition="top" class="w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-xl cursor-pointer transition-colors outline-none" (click)="openNewRolDialog()">
                    <i class="pi pi-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Tercera Fila: Teléfono y Documento Combinado -->
              <div class="flex flex-col sm:flex-row gap-5">
                <!-- Teléfono -->
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.telefono && usuarioForm.telefono.trim() !== ''">
                  <input pInputText id="telefono" [(ngModel)]="usuarioForm.telefono" placeholder=" " class="w-full px-4 py-3 text-sm text-slate-800 rounded-xl outline-none" />
                  <label for="telefono">Teléfono</label>
                </div>
                
                <!-- Documento Combinado (Selector + Número) -->
                <div class="document-input-group flex-1" [class.floating]="usuarioForm.numero_documento && usuarioForm.numero_documento.trim() !== ''">
                  <div class="document-input-container">
                    <select [(ngModel)]="usuarioForm.tipo_documento" class="document-input-select">
                      <option value="C.C.">C.C.</option>
                      <option value="T.I.">T.I.</option>
                      <option value="C.E.">C.E.</option>
                      <option value="P.E.P.">P.E.P.</option>
                      <option value="P.P.T.">P.P.T.</option>
                      <option value="P.A.S.">P.A.S.</option>
                    </select>
                    <input 
                      pInputText 
                      id="documento" 
                      [(ngModel)]="usuarioForm.numero_documento" 
                      placeholder=" " 
                      class="document-input-field" 
                    />
                  </div>
                  <label for="documento">Número de Documento <span class="text-red-500">*</span></label>
                </div>
              </div>

              <!-- Cuarta Fila: Contraseña + Estado -->
              <div class="flex flex-col sm:flex-row gap-5">
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.password && usuarioForm.password.trim() !== ''" *ngIf="esNuevoUsuario">
                  <p-password [(ngModel)]="usuarioForm.password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}" inputStyleClass="w-full pl-4 pr-10 py-3 text-sm text-slate-800 rounded-xl outline-none" [toggleMask]="true" appendTo="body" placeholder=" "></p-password>
                  <label>Contraseña <span class="text-red-500">*</span></label>
                </div>
                <!-- Estado del usuario -->
                <div class="floating-label-group flex-1" [class.floating]="usuarioForm.estado !== undefined && usuarioForm.estado !== null">
                  <p-select [options]="estadoOpciones" [(ngModel)]="usuarioForm.estado" optionLabel="label" optionValue="value" placeholder=" " styleClass="w-full h-[46px] flex items-center" appendTo="body" [style]="{'width':'100%'}"></p-select>
                  <label>Estado <span class="text-red-500">*</span></label>
                </div>
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
            [class]="currentView === 'permisos' ? 'px-4 py-2 text-sm font-bold text-white bg-[#39A900] hover:bg-green-700 rounded-xl flex items-center gap-2 cursor-pointer outline-none border-none h-[40px] transition-colors' : 'px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer outline-none h-[40px] transition-colors'"
            (click)="setView('permisos')"
          >
            <i class="pi pi-lock"></i>
            Permisos
          </button>
        </div>
      </div>

      <!-- USUARIOS VIEW (Synced with Roles) -->
      <div *ngIf="currentView === 'usuarios'" class="view-content">
        <div class="table-card">
          
          <p-table
            [value]="usuariosFiltrados"
            [paginator]="true"
            [rows]="10"
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
                  <div class="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      (click)="editarUsuario(u)"
                      class="w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer outline-none border-none bg-transparent"
                      pTooltip="Editar"
                      tooltipPosition="top"
                    >
                      <i class="pi pi-pencil"></i>
                    </button>
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

      <!-- PERMISOS VIEW -->
      <div *ngIf="currentView === 'permisos'" class="view-content flex flex-col gap-6">

        <!-- Tabla de Usuarios -->
        <div class="data-table-wrapper">
          <p-table
            [value]="usuariosFiltrados"
            [paginator]="true"
            [rows]="10"
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
                      pTooltip="Gestionar permisos"
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
                  — Activa o desactiva los permisos de acceso de este usuario
                </p>
              </div>
            </div>
            <button
              type="button"
              class="px-4 py-2 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition-all outline-none flex items-center gap-2"
              (click)="usuarioSeleccionado = null; permisosAgrupados = {}"
            >
              <i class="pi pi-times"></i>
              Cerrar
            </button>
          </div>

          <!-- Card Body: Permisos agrupados -->
          <div class="p-6">
            <div *ngIf="loadingPermisos" class="flex flex-col items-center justify-center py-16">
              <i class="pi pi-spin pi-spinner text-3xl text-[#39A900]"></i>
              <span class="text-xs text-slate-400 mt-2 font-semibold">Cargando mapa de accesos...</span>
            </div>

            <div *ngIf="!loadingPermisos" class="max-h-[500px] overflow-y-auto pr-1 space-y-5 custom-scrollbar">
              <div *ngFor="let key of getKeys(permisosAgrupados)" class="bg-slate-50/60 border border-slate-100 rounded-2xl p-4">
                <div class="perm-group-header">
                  <span class="perm-group-dot"></span>
                  <span class="text-xs font-black text-slate-700 uppercase tracking-widest">{{ key }}</span>
                  <span class="ml-auto text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                    {{ permisosAgrupados[key].length }} permisos
                  </span>
                </div>

                <div class="space-y-2">
                  <div *ngFor="let p of permisosAgrupados[key]"
                       class="perm-card"
                       [class.active]="p.tiene_permiso">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <div class="perm-icon" [class.active]="p.tiene_permiso" [class.inactive]="!p.tiene_permiso">
                        <i [class]="p.tiene_permiso ? 'pi pi-check-circle' : 'pi pi-lock'"></i>
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="font-bold text-slate-800 text-sm leading-tight truncate">{{ p.descripcion || formatPermisoName(p.nombre) }}</span>
                        <span class="text-[10.5px] text-slate-400 truncate font-mono">{{ p.nombre }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 flex-shrink-0">
                      <span *ngIf="p.heredado_de_rol"
                        class="text-[9px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Heredado
                      </span>
                      <button
                        type="button"
                        class="perm-toggle-track"
                        [class.on]="p.tiene_permiso"
                        [class.off]="!p.tiene_permiso"
                        (click)="togglePermiso(p, !p.tiene_permiso)"
                        [attr.aria-label]="p.tiene_permiso ? 'Desactivar permiso' : 'Activar permiso'"
                      >
                        <span class="perm-toggle-thumb"></span>
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




  `
})
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  currentView: 'usuarios' | 'permisos' = 'usuarios';
  
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
  
  loading = false;
  saving = false;
  isAdmin = false;

  rol: Partial<Rol> = { nombre: '' };

  // Permisos Granulares State
  usuarioSeleccionado: any = null;
  permisosAgrupados: any = {};
  loadingPermisos = false;
  displayRolDialog = false;
  showRolForm = false;

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarRoles();
    this.cargarUsuarios();
  }

  openNewRolDialog() {
    this.rol = { nombre: '' };
    this.showRolForm = true;
    this.showUserForm = false;
  }

  setView(view: 'usuarios' | 'permisos') {
    this.currentView = view;
    if (this.usuarios.length === 0) {
      this.cargarUsuarios();
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
      tipo_documento: 'C.C.',
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
    let tipo_documento = 'C.C.';
    let numero_documento = u.documento || '';
    if (u.documento) {
      const docClean = u.documento.trim();
      const tipos = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.', 'CC', 'TI', 'CE', 'PEP', 'PPT', 'PAS'];
      for (const t of tipos) {
        if (docClean.toUpperCase().startsWith(t.toUpperCase())) {
          tipo_documento = t.includes('.') ? t : t.split('').join('.') + '.';
          numero_documento = docClean.substring(t.length).trim();
          break;
        }
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
    if (!this.usuarioForm.nombre || !this.usuarioForm.correo || !this.usuarioForm.id_rol || !this.usuarioForm.numero_documento) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevoUsuario && !this.usuarioForm.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
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

  seleccionarUsuario(u: any) {
    this.usuarioSeleccionado = u;
    this.cargarPermisos(u.id_usuario);
  }

  cargarPermisos(idUsuario: number) {
    this.loadingPermisos = true;
    this.usuarioService.getPermisos(idUsuario).subscribe({
      next: (res: any) => {
        this.permisosAgrupados = res.data || res || {};
        this.loadingPermisos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingPermisos = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los permisos del usuario' });
      }
    });
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

  getRolSeverity(id_rol: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }
}
