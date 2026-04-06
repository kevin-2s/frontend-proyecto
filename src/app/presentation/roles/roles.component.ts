import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RolService } from '../../infrastructure/services/rol.service';

interface Rol {
  id?: number;
  nombreRol: string;
  estado?: boolean;
}

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
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Roles</h2>
        <button
          pButton
          label="Nuevo Rol"
          icon="pi pi-plus"
          (click)="openNew()"
          class="bg-[#39A900] border-[#39A900] hover:bg-[#2D8600]"
        ></button>
      </div>

      <div class="bg-white rounded-lg shadow border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar rol..."
              class="w-64"
            />
          </span>
        </div>

        <p-table
          [value]="rolesFiltrados"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Nombre del Rol</th>
              <th class="!bg-white !text-gray-600">Estado</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-rol>
            <tr>
              <td class="font-medium text-gray-900">#{{ rol.id }}</td>
              <td class="font-medium text-gray-900">{{ rol.nombreRol }}</td>
              <td>
                <p-tag
                  [value]="rol.estado ? 'Activo' : 'Inactivo'"
                  [severity]="rol.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(rol)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(rol)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center py-8 text-gray-500">No se encontraron roles.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nuevo Rol' : 'Editar Rol' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '400px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="nombreRol" class="font-medium text-gray-700">Nombre del Rol</label>
          <input
            pInputText
            id="nombreRol"
            [(ngModel)]="rol.nombreRol"
            class="w-full"
            placeholder="Ej: Administrador"
          />
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
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  rol: Rol = this.getNuevoRol();

  ngOnInit() {
    this.cargarRoles();
  }

  cargarRoles() {
    this.rolService.getRoles().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.roles = res.data;
          this.rolesFiltrados = res.data;
        }
      },
      error: () => {
        this.roles = [];
        this.rolesFiltrados = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.rolesFiltrados = this.roles.filter((r) =>
      r.nombreRol?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoRol(): Rol {
    return { nombreRol: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.rol = this.getNuevoRol();
    this.displayDialog = true;
  }

  editar(rol: Rol) {
    this.esNuevo = false;
    this.rol = { ...rol };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.rolService.crearRol({ nombreRol: this.rol.nombreRol }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol creado correctamente',
          });
          this.displayDialog = false;
          this.cargarRoles();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el rol',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Rol actualizado correctamente',
      });
      this.displayDialog = false;
      this.cargarRoles();
    }
  }

  eliminar(rol: Rol) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el rol ' + rol.nombreRol + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol eliminado correctamente',
        });
        this.cargarRoles();
      },
    });
  }
}
