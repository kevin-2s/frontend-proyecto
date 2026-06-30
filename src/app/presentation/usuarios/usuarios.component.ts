import { Component, OnInit, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService } from '../../infrastructure/services/rol.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { Rol } from '../../domain/models/rol.model';
import { OnlyLettersDirective } from '../directives/only-letters.directive';
import { OnlyNumbersDirective } from '../directives/only-numbers.directive';

interface Usuario {
  id_usuario?: number;
  nombre?: string;
  apellidos?: string;
  correo: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  documento?: string;
  password?: string;
  estado: boolean;
  id_rol: number;
  rolNombre?: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    PasswordModule,
    TooltipModule,
    SelectModule,
    OnlyLettersDirective,
    OnlyNumbersDirective
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  styles: [`
    :host ::ng-deep .custom-dialog-usuario-clean {
      border-radius: 12px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      border: none !important;
    }
    :host ::ng-deep .custom-dialog-usuario-clean .p-dialog-content {
      background-color: #ffffff !important;
    }
    /* Quick-create rol dialog */
    :host ::ng-deep .quick-rol-dialog .p-dialog {
      border-radius: 16px !important;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.18) !important;
      border: none !important;
    }
    :host ::ng-deep .quick-rol-dialog .p-dialog-header {
      background: #fff !important;
      border-bottom: 1px solid #f0fdf4 !important;
      border-radius: 16px 16px 0 0 !important;
      padding: 1.25rem 1.5rem !important;
    }
    :host ::ng-deep .quick-rol-dialog .p-dialog-content {
      background: #fff !important;
      border-radius: 0 0 16px 16px !important;
      padding: 1.5rem !important;
    }
  `],
  template: `
    <p-toast position="bottom-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <!-- Mini-diálogo: Crear Rol rápido (Estilo del formulario del módulo de productos) -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="✨ Registrar Nuevo Rol" [(visible)]="showRolDialog"
      [modal]="true" [style]="{width:'90vw',maxWidth:'400px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-grid mt-2">
        <div class="form-field">
          <label for="nuevo-rol-nombre-modal">Nombre del Rol *</label>
          <input pInputText id="nuevo-rol-nombre-modal" [(ngModel)]="nuevoRolNombre" onlyLetters placeholder="Ej: INSTRUCTOR" class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="showRolDialog = false; nuevoRolNombre = ''"></button>
          <button pButton [label]="savingRol ? 'Guardando...' : 'Guardar'" class="btn-guardar" [disabled]="savingRol || !nuevoRolNombre.trim()" (click)="crearRolRapido()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- [StylesGlobales] .module-container: El contenedor principal blanco -->
    <div class="module-container">

      <!-- [StylesGlobales] .module-header: Encabezado estandarizado -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <i class="pi pi-users text-[#39A900] text-3xl"></i>
          <h3 class="page-title m-0">Usuarios</h3>
        </div>

        <div class="header-actions">
          <!-- [StylesGlobales] .search-wrapper: Buscador pill-shaped -->
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Nombre" class="search-input" />
          </div>
          
          <button
            *ngIf="!displayDialog"
            type="button"
            class="btn-add"
            (click)="openNew()"
          >
            <i class="pi pi-user-plus"></i>
            Crear Usuario
          </button>
          <button
            *ngIf="displayDialog"
            type="button"
            class="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all flex items-center gap-2 cursor-pointer outline-none"
            (click)="displayDialog = false"
          >
            <i class="pi pi-times"></i>
            Cerrar Formulario
          </button>
        </div>
      </div>

      <!-- Inline Form Card -->
      <div *ngIf="displayDialog" class="w-full bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div class="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#39A900]/10 flex items-center justify-center">
            <i class="pi pi-user-edit text-[#39A900] text-xl"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-slate-800 m-0 leading-tight">{{ esNuevo ? 'Añadir Nuevo Usuario' : 'Editar Usuario' }}</h4>
            <p class="text-xs text-slate-500 m-0 mt-0.5">Completa la información requerida para el usuario en el sistema</p>
          </div>
        </div>
        
        <div class="p-6 flex flex-col gap-6">
          <div class="form-grid p-0">
            
            <!-- Primera Fila: Nombres y Apellidos -->
            <div class="product-form-row">
              <div class="form-field">
                <label for="u-nombre">Nombres <span class="text-red-500">*</span></label>
                <input pInputText id="u-nombre" [(ngModel)]="usuario.nombre" onlyLetters placeholder="Ej: Juan Carlos" />
              </div>
              <div class="form-field">
                <label for="u-apellidos">Apellidos <span class="text-red-500">*</span></label>
                <input pInputText id="u-apellidos" [(ngModel)]="usuario.apellidos" onlyLetters placeholder="Ej: Pérez Gómez" />
              </div>
            </div>

            <!-- Segunda Fila: Correo y Rol -->
            <div class="product-form-row">
              <div class="form-field">
                <label for="u-correo">Correo Electrónico <span class="text-red-500">*</span></label>
                <input pInputText id="u-correo" [(ngModel)]="usuario.correo" type="email" placeholder="Ej: juan.perez@sena.edu.co" />
              </div>
              <div class="form-field">
                <label>Rol <span class="text-red-500">*</span></label>
                <div class="input-with-button">
                  <p-select [options]="roles" [(ngModel)]="usuario.id_rol" optionLabel="nombre" optionValue="id_rol" placeholder="Seleccione un rol" styleClass="w-full flex items-center" appendTo="body" [style]="{'width':'100%'}"></p-select>
                  <button type="button" class="btn-inline-add flex items-center justify-center cursor-pointer outline-none" (click)="openRolDialog()">
                    <i class="pi pi-plus font-bold text-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tercera Fila: Teléfono y Documento Combinado -->
            <div class="product-form-row">
              <!-- Teléfono -->
              <div class="form-field">
                <label for="u-telefono">Teléfono</label>
                <input pInputText id="u-telefono" [(ngModel)]="usuario.telefono" onlyNumbers placeholder="Ej: 3123456789" />
              </div>
              
              <!-- Documento Combinado (Selector + Número) -->
              <div class="form-field">
                <label for="u-documento">Número de Documento <span class="text-red-500">*</span></label>
                <div class="input-with-button">
                  <p-select [options]="tipoDocumentoOpciones" [(ngModel)]="usuario.tipo_documento" placeholder="Tipo" styleClass="w-[96px]" appendTo="body"></p-select>
                  <input 
                    pInputText 
                    id="u-documento" 
                    [(ngModel)]="usuario.numero_documento" 
                    onlyNumbers
                    placeholder="Ej: 1098765432" 
                    style="flex: 1;"
                  />
                </div>
              </div>
            </div>

            <!-- Cuarta Fila: Contraseña + Estado -->
            <div class="product-form-row">
              <!-- Contraseña -->
              <div class="form-field" *ngIf="esNuevo">
                <label>Contraseña <span class="text-red-500">*</span></label>
                <p-password [(ngModel)]="usuario.password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}" inputStyleClass="w-full" [toggleMask]="true" appendTo="body" placeholder="••••••••"></p-password>
              </div>
              <!-- Estado -->
              <div class="form-field">
                <label>Estado <span class="text-red-500">*</span></label>
                <p-select [options]="estadoOpciones" [(ngModel)]="usuario.estado" optionLabel="label" optionValue="value" placeholder="Seleccione estado" styleClass="w-full flex items-center" appendTo="body" [style]="{'width':'100%'}"></p-select>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              class="btn-cancelar"
              (click)="displayDialog = false"
            >Cancelar</button>
            <button
              type="button"
              class="btn-guardar"
              (click)="guardar()"
              [disabled]="saving"
            >{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </div>
      </div>

      <!-- [PrimeNG] p-table: La potencia de manejo de datos -->
      <div class="data-table-wrapper">
        <p-table [value]="usuariosFiltrados" [paginator]="true" [rows]="15"
          styleClass="modern-table" [loading]="loading" [rowHover]="true">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width:64px">ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Contacto</th>
              <th style="width:120px">Estado</th>
              <th style="width:120px; text-align:center">Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-u>
            <tr>
              <td><span class="text-slate-400 text-xs font-black">#{{ u.id_usuario }}</span></td>
              <td>
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <i class="pi pi-user text-slate-400 text-sm"></i>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800 leading-tight">{{ u.nombre }} {{ u.apellidos }}</span>
                    <span class="text-[11px] text-slate-400 font-medium">{{ formatDocumento(u.documento) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <!-- [PrimeNG] p-tag: Para etiquetas de rol rápidas -->
                <p-tag [value]="getRolNombre(u.id_rol)" [severity]="getRolSeverity(u.id_rol)"></p-tag>
              </td>
              <td>
                <div class="flex flex-col">
                  <span class="text-slate-600 text-sm font-medium">{{ u.correo }}</span>
                  <span class="text-slate-400 text-[11px]">{{ u.telefono || 'Sin teléfono' }}</span>
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2.5">
                  <label class="custom-switch" pTooltip="Cambiar estado" tooltipPosition="top">
                    <input 
                      type="checkbox" 
                      [checked]="u.estado !== false" 
                      (change)="actualizarEstado(u)" 
                    />
                    <span class="custom-switch-slider"></span>
                  </label>
                  <span class="font-bold text-xs" [class.text-green-600]="u.estado !== false" [class.text-red-600]="u.estado === false">
                    {{ u.estado !== false ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(u)"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(u)"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="empty-message py-20 text-center">
              <i class="pi pi-user-minus text-5xl text-slate-300 opacity-50 mb-3 block"></i>
              <p class="text-slate-400 font-bold text-lg">No hay usuarios registrados</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

  `
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Rol[] = [];
  estadoOpciones = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];
  tipoDocumentoOpciones = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.'];

  filtro = '';
  displayDialog = false;
  esNuevo = true;
  loading = false;
  saving = false;
  isAdmin = false;
  stats = { total: 0, activos: 0, inactivos: 0, admins: 0 };
  hidePassword = true;
  showRolDialog = false;
  nuevoRolNombre = '';
  savingRol = false;

  usuario: Usuario = this.getNuevoUsuario();

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarDatos();
  }

  openRolDialog() {
    this.nuevoRolNombre = '';
    this.showRolDialog = true;
  }

  crearRolRapido() {
    const nombre = this.nuevoRolNombre.trim();
    if (!nombre) return;
    this.savingRol = true;
    this.rolService.create({ nombre }).subscribe({
      next: (nuevoRol: any) => {
        const rolCreado = {
          id_rol: nuevoRol.id_rol || nuevoRol.id || nuevoRol.idRol,
          nombre: nuevoRol.nombre || nuevoRol.nombreRol || nombre
        } as Rol;
        this.roles = [...this.roles, rolCreado];
        this.usuario.id_rol = rolCreado.id_rol;
        this.showRolDialog = false;
        this.savingRol = false;
        this.messageService.add({ severity: 'success', summary: 'Rol creado', detail: `"${rolCreado.nombre}" fue creado y seleccionado` });
      },
      error: () => {
        this.savingRol = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el rol' });
      }
    });
  }

  cargarDatos() {
    this.loading = true;
    forkJoin({
      roles: this.rolService.getAll(),
      usuarios: this.usuarioService.getAll()
    }).subscribe({
      next: ({ roles, usuarios }) => {
        // Mapear Roles
        const rolesData = Array.isArray(roles) ? roles : (roles as any).data || [];
        this.roles = rolesData;

        // Mapear Usuarios
        const usuariosData = Array.isArray(usuarios) ? usuarios : (usuarios as any).data || [];
        this.usuarios = usuariosData.map((u: any) => {
          const mappedRolId = Number(u.rolId || u.id_rol || (u.rol ? u.rol.id : 0));
          const rolObj = rolesData.find((r: any) => Number(r.id_rol || r.id) === mappedRolId);
          
          // Separar nombre y apellidos si vienen juntos desde la base de datos
          let nombre = u.nombre || '';
          let apellidos = u.apellidos || '';
          if (!apellidos && nombre) {
            const parts = nombre.trim().split(/\s+/);
            if (parts.length > 1) {
              nombre = parts[0];
              apellidos = parts.slice(1).join(' ');
            }
          }

          return {
            ...u,
            id: u.id_usuario || u.id,
            id_usuario: u.id_usuario || u.id,
            nombre,
            apellidos,
            id_rol: mappedRolId,
            estado: u.estado !== false,
            rolNombre: rolObj ? (rolObj.nombreRol || rolObj.nombre) : 'Sin rol'
          };
        });

        this.usuariosFiltrados = this.usuarios;
        this.calcularEstadisticas();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
        this.roles = [];
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos' });
      }
    });
  }

  calcularEstadisticas() {
    this.stats = {
      total: this.usuarios.length,
      activos: this.usuarios.filter(u => u.estado).length,
      inactivos: this.usuarios.filter(u => !u.estado).length,
      admins: this.usuarios.filter(u => {
        const rol = this.getRolNombre(u.id_rol).toUpperCase();
        return rol.includes('ADMIN');
      }).length
    };
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(filtroLower) ||
        u.apellidos?.toLowerCase().includes(filtroLower) ||
        u.correo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoUsuario(): Usuario {
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
      id_rol: 0,
    };
  }

  openNew() {
    this.esNuevo = true;
    this.usuario = this.getNuevoUsuario();
    this.displayDialog = true;
  }

  editar(u: Usuario) {
    this.esNuevo = false;

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

    this.usuario = { 
      ...u, 
      nombre: u.nombre,
      apellidos: u.apellidos,
      tipo_documento,
      numero_documento,
      password: '' // Limpiar el campo de contraseña al editar por seguridad
    };
    this.displayDialog = true;
  }

  onRolChange(event: any) {
    const rol = this.roles.find((r) => r.id_rol === this.usuario.id_rol);
    if (rol) {
      this.usuario.rolNombre = rol.nombre;
    }
  }

  formatDocumento(doc: string | undefined): string {
    if (!doc) return '---';
    const docClean = doc.trim();
    const tipos = ['C.C.', 'T.I.', 'C.E.', 'P.E.P.', 'P.P.T.', 'P.A.S.', 'CC', 'TI', 'CE', 'PEP', 'PPT', 'PAS'];
    for (const t of tipos) {
      if (docClean.toUpperCase().startsWith(t.toUpperCase())) {
        return docClean;
      }
    }
    return `C.C. ${docClean}`;
  }

  guardar() {
    // Validaciones basicas
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.id_rol || !this.usuario.numero_documento) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevo && !this.usuario.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    // Validar nombre o cédula duplicada
    const nombreCompletoNuevo = ((this.usuario.nombre || '').trim() + ' ' + (this.usuario.apellidos || '').trim()).replace(/\s+/g, ' ').toLowerCase();
    const numeroDocNuevo = (this.usuario.numero_documento || '').trim();

    const existeDuplicado = this.usuarios.some(u => {
      if (!this.esNuevo && Number(u.id_usuario) === Number(this.usuario.id_usuario)) {
        return false;
      }

      // Comparar Nombres
      const nombreCompletoExistente = ((u.nombre || '').trim() + ' ' + (u.apellidos || '').trim()).replace(/\s+/g, ' ').toLowerCase();
      if (nombreCompletoExistente === nombreCompletoNuevo) {
        this.messageService.add({ severity: 'error', summary: 'Error de Validación', detail: 'Ya existe un usuario registrado con este nombre y apellidos.' });
        return true;
      }

      // Comparar Cédula/Documento (sólo la parte numérica)
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

    this.saving = true;

    const docCompleto = this.usuario.numero_documento ? `${this.usuario.tipo_documento} ${this.usuario.numero_documento.trim()}` : '';

    if (this.esNuevo) {
      const datosEnvio: any = {
        nombre: (this.usuario.nombre.trim() + ' ' + (this.usuario.apellidos || '').trim()).trim(),
        correo: this.usuario.correo.trim(),
        id_rol: Number(this.usuario.id_rol),
        password: this.usuario.password
      };

      if (this.usuario.telefono && this.usuario.telefono.trim()) {
        datosEnvio.telefono = this.usuario.telefono.trim();
      }
      if (docCompleto) {
        datosEnvio.documento = docCompleto;
      }

      this.usuarioService.create(datosEnvio).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargarDatos();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el usuario' });
        },
      });
    } else {
      const updateData: any = {
        nombre: (this.usuario.nombre.trim() + ' ' + (this.usuario.apellidos || '').trim()).trim(),
        correo: this.usuario.correo.trim(),
        id_rol: Number(this.usuario.id_rol),
        estado: this.usuario.estado !== false
      };
      
      if (this.usuario.telefono && this.usuario.telefono.trim()) {
        updateData.telefono = this.usuario.telefono.trim();
      } else {
        updateData.telefono = '';
      }

      if (docCompleto) {
        updateData.documento = docCompleto;
      } else {
        updateData.documento = '';
      }

      if (this.usuario.password && this.usuario.password.trim()) {
        updateData.password = this.usuario.password;
      }

      this.usuarioService.update(this.usuario.id_usuario!, updateData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente' });
          this.displayDialog = false;
          this.saving = false;
          this.cargarDatos();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el usuario' });
        }
      });
    }
  }

  getRolNombre(id_rol: any): string {
    const rol = this.roles.find(r => Number(r.id_rol) === Number(id_rol));
    return rol ? rol.nombre : 'Desconocido';
  }

  getRolSeverity(id_rol: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const nombre = this.getRolNombre(id_rol).toUpperCase();
    if (nombre.includes('ADMIN')) return 'success';
    if (nombre.includes('INSTRUCT')) return 'info';
    return 'secondary';
  }

  eliminar(u: Usuario) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar a ${u.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usuarioService.delete(u.id_usuario!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado' });
            this.cargarDatos();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario' });
          }
        });
      }
    });
  }

  actualizarEstado(u: Usuario) {
    if (!u.id_usuario) return;
    const nuevoEstado = u.estado === false;
    this.usuarioService.update(u.id_usuario!, { estado: nuevoEstado }).subscribe({
      next: () => {
        u.estado = nuevoEstado;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado correctamente' });
        this.calcularEstadisticas();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
        this.cargarDatos();
      }
    });
  }
}
