import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UsuarioService } from '../../infrastructure/services/usuario.service';
import { RolService } from '../../infrastructure/services/rol.service';

interface Usuario {
  id?: number;
  nombreCompleto: string;
  correo: string;
  estado: boolean;
  rolId: number;
  rolNombre?: string;
}

interface Rol {
  id: number;
  nombre: string;
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
    InputMaskModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
        <button
          pButton
          label="Nuevo Usuario"
          icon="pi pi-plus"
          (click)="openNew()"
          class="bg-[#39A900] border-[#39A900] hover:bg-[#2D8600]"
        ></button>
      </div>

      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <div class="flex gap-4">
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [(ngModel)]="filtro"
                (input)="filtrar()"
                placeholder="Buscar usuario..."
                class="w-64"
              />
            </span>
          </div>
        </div>

        <p-table
          [value]="usuariosFiltrados"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Nombre Completo</th>
              <th class="!bg-white !text-gray-600">Correo</th>
              <th class="!bg-white !text-gray-600">Rol</th>
              <th class="!bg-white !text-gray-600">Estado</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-usuario>
            <tr>
              <td class="font-medium text-gray-900">#{{ usuario.id }}</td>
              <td class="font-medium text-gray-900">{{ usuario.nombreCompleto }}</td>
              <td>{{ usuario.correo }}</td>
              <td>
                <p-tag [value]="usuario.rolNombre || 'Sin rol'"></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="usuario.estado ? 'Activo' : 'Inactivo'"
                  [severity]="usuario.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(usuario)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(usuario)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center py-8 text-gray-500">
                No se encontraron usuarios.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nuevo Usuario' : 'Editar Usuario' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="nombreCompleto" class="font-medium text-gray-700">Nombre Completo</label>
          <input
            pInputText
            id="nombreCompleto"
            [(ngModel)]="usuario.nombreCompleto"
            class="w-full"
            placeholder="Ingrese nombre completo"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="correo" class="font-medium text-gray-700">Correo Electrónico</label>
          <input
            pInputText
            id="correo"
            [(ngModel)]="usuario.correo"
            type="email"
            class="w-full"
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="rol" class="font-medium text-gray-700">Rol</label>
          <select
            id="rol"
            [(ngModel)]="usuario.rolId"
            class="w-full p-2 border border-gray-300 rounded"
          >
            <option [value]="0">Seleccione un rol</option>
            <option *ngFor="let rol of roles" [value]="rol.id">{{ rol.nombre }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-2" *ngIf="!esNuevo">
          <label class="font-medium text-gray-700">Estado</label>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <input type="checkbox" [(ngModel)]="usuario.estado" class="w-4 h-4" />
              <span>Activo</span>
            </label>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          (click)="displayDialog = false"
          class="p-button-text"
        ></button>
        <button
          pButton
          label="Guardar"
          (click)="guardar()"
          class="bg-[#39A900] border-[#39A900]"
        ></button>
      </ng-template>
    </p-dialog>
  `,
})
export class UsuariosComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  roles: Rol[] = [];
  filtro = '';

  displayDialog = false;
  esNuevo = true;

  usuario: Usuario = this.getNuevoUsuario();

  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.usuarios = res.data;
          this.usuariosFiltrados = res.data;
        }
      },
      error: () => {
        this.usuarios = [];
        this.usuariosFiltrados = [];
      },
    });
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.roles = res.data;
        }
      },
      error: () => {
        this.roles = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(
      (u) =>
        u.nombreCompleto?.toLowerCase().includes(filtroLower) ||
        u.correo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoUsuario(): Usuario {
    return {
      nombreCompleto: '',
      correo: '',
      estado: true,
      rolId: 0,
    };
  }

  openNew() {
    this.esNuevo = true;
    this.usuario = this.getNuevoUsuario();
    this.displayDialog = true;
  }

  editar(usuario: Usuario) {
    this.esNuevo = false;
    this.usuario = { ...usuario };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.usuarioService.crearUsuario(this.usuario).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente',
          });
          this.displayDialog = false;
          this.cargarUsuarios();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el usuario',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario actualizado correctamente',
      });
      this.displayDialog = false;
      this.cargarUsuarios();
    }
  }

  eliminar(usuario: Usuario) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el usuario ' + usuario.nombreCompleto + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado correctamente',
        });
        this.cargarUsuarios();
      },
    });
  }

  getRolSeverity(rolId: number): string {
    switch (rolId) {
      case 1:
        return 'success';
      case 2:
        return 'info';
      case 3:
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
