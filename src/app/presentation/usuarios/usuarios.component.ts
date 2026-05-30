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
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService, Rol } from '../../infrastructure/services/rol.service';
import { AuthService } from '../../infrastructure/services/auth.service';

interface Usuario {
  id_usuario?: number;
  nombre?: string;
  apellidos?: string;
  correo: string;
  telefono?: string;
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
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    TuiButton,
    TuiBadge
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
  `],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <!-- [StylesGlobales] .module-container: El contenedor principal blanco -->
    <div class="module-container">

      <!-- [StylesGlobales] .module-header: Encabezado estandarizado -->
      <div class="module-header">
        <div class="flex items-center gap-3">
          <!-- [Material] mat-icon: Iconografía premium -->
          
          <h3 class="page-title m-0">Usuarios</h3>
        </div>

        <div class="header-actions">
          <!-- [StylesGlobales] .search-wrapper: Buscador pill-shaped -->
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Nombre" class="search-input" />
          </div>
          
          <!-- [Taiga UI] tuiButton: El botón más moderno del ecosistema -->
          <button tuiButton type="button" size="m" appearance="primary"
            class="rounded-xl font-bold flex items-center gap-1" (click)="openNew()">
            <mat-icon class="scale-90">person_add</mat-icon>
            Crear Usuario
          </button>
        </div>
      </div>

      <!-- [PrimeNG] p-table: La potencia de manejo de datos -->
      <div class="data-table-wrapper">
        <p-table [value]="usuariosFiltrados" [paginator]="true" [rows]="10"
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
                    <mat-icon class="text-slate-300 scale-75">person</mat-icon>
                  </div>
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-800 leading-tight">{{ u.nombre }} {{ u.apellidos }}</span>
                    <span class="text-[11px] text-slate-400 font-medium">CC: {{ u.documento || '---' }}</span>
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
                <!-- [PrimeNG] p-tag: Estado con color semántico -->
                <p-tag [value]="u.estado ? 'ACTIVO' : 'INACTIVO'" 
                      [severity]="u.estado ? 'success' : 'danger'"
                      styleClass="font-bold px-3 py-1 text-xs rounded-lg"></p-tag>
              </td>
              <td>
                <div class="flex items-center justify-center gap-1">
                  <!-- [Material] mat-icon-button: Acciones circulares limpias -->
                  <button mat-icon-button (click)="editar(u)" class="text-blue-500 hover:bg-blue-50">
                    <mat-icon>edit_note</mat-icon>
                  </button>
                  <button mat-icon-button (click)="eliminar(u)" class="text-red-400 hover:bg-red-50">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="empty-message py-20">
              <mat-icon class="scale-[4] opacity-5 mb-10">person_off</mat-icon>
              <p class="text-slate-400 font-bold text-lg">No hay usuarios registrados</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Form Dialog -->
    <p-dialog
      [header]="esNuevo ? 'Añadir Usuario' : 'Editar Usuario'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '700px' }"
      [draggable]="false"
      styleClass="custom-dialog-usuario-clean"
      maskStyleClass="backdrop-blur-sm bg-black/40"
      [showHeader]="false"
    >
      <div class="flex flex-col bg-white rounded-xl p-8 pt-6">
        
        <h2 class="text-2xl font-bold text-gray-900 mb-6">
          {{ esNuevo ? 'Registro de Usuario' : 'Editar Usuario' }}
        </h2>

        <div class="flex flex-col gap-5">
          <!-- Primera Fila: Nombres y Apellidos -->
          <div class="flex flex-col sm:flex-row gap-5">
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Nombres</label>
              <input pInputText [(ngModel)]="usuario.nombre" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="Nombres" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Apellidos</label>
              <input pInputText [(ngModel)]="usuario.apellidos" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="Apellidos" />
            </div>
          </div>

          <!-- Segunda Fila: Correo y Rol -->
          <div class="flex flex-col sm:flex-row gap-5">
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Correo Electrónico</label>
              <input pInputText [(ngModel)]="usuario.correo" type="email" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="correo@ejemplo.com" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Rol</label>
              <p-select [options]="roles" [(ngModel)]="usuario.id_rol" optionLabel="nombre" optionValue="id" placeholder="Selecciona un rol" styleClass="w-full !bg-gray-100 !border-transparent hover:!border-gray-300 focus:!border-gray-300 !text-gray-900 !rounded-md transition-all" [style]="{'width':'100%'}" appendTo="body"></p-select>
            </div>
          </div>

          <!-- Tercera Fila: Teléfono y Documento -->
          <div class="flex flex-col sm:flex-row gap-5">
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Teléfono</label>
              <input pInputText [(ngModel)]="usuario.telefono" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="Número de teléfono" />
            </div>
            <div class="flex flex-col gap-1.5 flex-1">
              <label class="text-sm font-bold text-gray-900">Documento</label>
              <input pInputText [(ngModel)]="usuario.documento" class="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="Número de documento" />
            </div>
          </div>

          <!-- Cuarta Fila: Contraseña -->
          <div class="flex flex-col sm:flex-row gap-5">
            <div class="flex flex-col gap-1.5 flex-1" *ngIf="esNuevo">
              <label class="text-sm font-bold text-gray-900">Contraseña</label>
              <p-password [(ngModel)]="usuario.password" [feedback]="false" styleClass="w-full" [inputStyle]="{'width':'100%'}" inputStyleClass="w-full !bg-gray-100 !border-transparent focus:!border-gray-300 focus:!bg-white !text-gray-900 !py-2.5 !px-3 !rounded-md transition-all outline-none" placeholder="Contraseña segura" [toggleMask]="true" appendTo="body"></p-password>
            </div>
          </div>
        </div>
      </div>

        <!-- Botones (Footer) -->
        <div class="flex justify-end gap-3 mt-8">
          <button class="px-5 py-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors outline-none cursor-pointer" (click)="displayDialog = false">
            Cancelar
          </button>
          <button class="px-5 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-md transition-all outline-none disabled:opacity-50 cursor-pointer" (click)="guardar()" [disabled]="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>

      </div>
    </p-dialog>
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
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  loading = false;
  saving = false;
  isAdmin = false;
  stats = { total: 0, activos: 0, inactivos: 0, admins: 0 };
  hidePassword = true;

  usuario: Usuario = this.getNuevoUsuario();

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarDatos();
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
          return {
            ...u,
            id: u.id_usuario || u.id,
            id_rol: mappedRolId,
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
    this.usuario = { 
      ...u, 
      nombre: u.nombre,
      apellidos: u.apellidos,
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

  guardar() {
    // Validaciones basicas
    if (!this.usuario.nombre || !this.usuario.correo || !this.usuario.id_rol) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }

    if (this.esNuevo && !this.usuario.password) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'La contraseña es requerida para nuevos usuarios' });
      return;
    }

    this.saving = true;

    // Clonamos para no modificar el objeto de la vista y limpiamos campos
    const datosEnvio = { ...this.usuario };
    if (!this.esNuevo && !datosEnvio.password) {
      delete datosEnvio.password; // No enviar password si está vacío en edición
    }

    if (this.esNuevo) {
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
      const { id_usuario, ...updateData } = datosEnvio as any;
      
      this.usuarioService.update(id_usuario!, updateData).subscribe({
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
    this.usuarioService.update(u.id_usuario!, { estado: u.estado }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado' });
        this.calcularEstadisticas();
      },
      error: () => {
        u.estado = !u.estado; // Revertir en caso de error
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
      }
    });
  }
}
