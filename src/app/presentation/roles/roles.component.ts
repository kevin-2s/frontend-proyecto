import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RolService, Rol } from '../../infrastructure/services/rol.service';
import { AuthService } from '../../infrastructure/services/auth.service';

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
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="animate-fade-in p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-surface-800">Gestión de Roles</h2>
        <button
          *ngIf="isAdmin"
          pButton
          label="Nuevo Rol"
          icon="pi pi-plus"
          (click)="openNew()"
          styleClass="p-button-success"
          [style]="{'background-color': '#39A900', 'border-color': '#39A900'}"
        ></button>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-surface-200">
        <div class="p-4 border-b border-surface-200">
          <span class="p-input-icon-left w-full sm:w-auto">
            <i class="pi pi-search"></i>
            <input
              pInputText
              type="text"
              [(ngModel)]="filtro"
              (input)="filtrar()"
              placeholder="Buscar rol..."
              class="w-full sm:w-64"
            />
          </span>
        </div>

        <p-table
          [value]="rolesFiltrados"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
          [loading]="loading"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-surface-50 !text-surface-700">ID</th>
              <th class="!bg-surface-50 !text-surface-700">Nombre del Rol</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-r>
            <tr>
              <td class="font-medium text-surface-900">#{{ r.id }}</td>
              <td class="font-medium text-surface-900">{{ r.nombre }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="2" class="text-center py-8 text-surface-500">No se encontraron roles.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="Nuevo Rol"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '400px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="nombre" class="font-medium text-surface-700">Nombre del Rol</label>
          <input
            pInputText
            id="nombre"
            [(ngModel)]="rol.nombre"
            class="w-full"
            placeholder="Ej: ADMINISTRADOR"
          />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          (click)="displayDialog = false"
          class="p-button-text p-button-secondary"
        ></button>
        <button
          pButton
          label="Guardar"
          (click)="guardar()"
          styleClass="p-button-success"
          [style]="{'background-color': '#39A900', 'border-color': '#39A900'}"
          [loading]="saving"
        ></button>
      </ng-template>
    </p-dialog>
  `,
})
export class RolesComponent implements OnInit {
  private rolService = inject(RolService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];
  filtro = '';
  
  displayDialog = false;
  loading = false;
  saving = false;
  isAdmin = false;

  rol: Partial<Rol> = { nombre: '' };

  ngOnInit() {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.cargarRoles();
  }

  cargarRoles() {
    this.loading = true;
    this.rolService.getAll().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res.data || []);
        this.roles = data;
        this.rolesFiltrados = data;
        this.loading = false;
      },
      error: () => {
        this.roles = [];
        this.rolesFiltrados = [];
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles' });
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.rolesFiltrados = this.roles.filter((r) =>
      r.nombre?.toLowerCase().includes(filtroLower),
    );
  }

  openNew() {
    this.rol = { nombre: '' };
    this.displayDialog = true;
  }

  guardar() {
    if (!this.rol.nombre || this.rol.nombre.trim() === '') {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre del rol es requerido' });
      return;
    }

    this.saving = true;
    this.rolService.create({ nombre: this.rol.nombre }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente' });
        this.displayDialog = false;
        this.saving = false;
        this.cargarRoles();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el rol' });
      },
    });
  }
}
