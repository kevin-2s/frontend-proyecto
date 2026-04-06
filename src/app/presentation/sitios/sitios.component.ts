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
import { SitioService } from '../../infrastructure/services/sitio.service';

interface Sitio {
  id?: number;
  nombreSitio: string;
  tipo: string;
  estado?: boolean;
}

@Component({
  selector: 'app-sitios',
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
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Sitios</h2>
        <button
          pButton
          label="Nuevo Sitio"
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
              placeholder="Buscar sitio..."
              class="w-64"
            />
          </span>
        </div>

        <p-table
          [value]="sitiosFiltrados"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Nombre del Sitio</th>
              <th class="!bg-white !text-gray-600">Tipo</th>
              <th class="!bg-white !text-gray-600">Estado</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-sitio>
            <tr>
              <td class="font-medium text-gray-900">#{{ sitio.id }}</td>
              <td class="font-medium text-gray-900">{{ sitio.nombreSitio }}</td>
              <td>
                <p-tag [value]="sitio.tipo"></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="sitio.estado ? 'Activo' : 'Inactivo'"
                  [severity]="sitio.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(sitio)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(sitio)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-8 text-gray-500">No se encontraron sitios.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nuevo Sitio' : 'Editar Sitio' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="nombreSitio" class="font-medium text-gray-700">Nombre del Sitio</label>
          <input
            pInputText
            id="nombreSitio"
            [(ngModel)]="sitio.nombreSitio"
            class="w-full"
            placeholder="Ej: Bodega Central"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="tipo" class="font-medium text-gray-700">Tipo de Sitio</label>
          <select
            id="tipo"
            [(ngModel)]="sitio.tipo"
            class="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Seleccione tipo</option>
            <option *ngFor="let t of tipos" [value]="t.value">{{ t.label }}</option>
          </select>
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
export class SitiosComponent implements OnInit {
  private sitioService = inject(SitioService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  sitios: Sitio[] = [];
  sitiosFiltrados: Sitio[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  sitio: Sitio = this.getNuevoSitio();

  tipos = [
    { label: 'Bodega', value: 'Bodega' },
    { label: 'Laboratorio', value: 'Laboratorio' },
    { label: 'Aula', value: 'Aula' },
    { label: 'Oficina', value: 'Oficina' },
    { label: 'Almacén', value: 'Almacén' },
  ];

  ngOnInit() {
    this.cargarSitios();
  }

  cargarSitios() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.sitios = res.data;
          this.sitiosFiltrados = res.data;
        }
      },
      error: () => {
        this.sitios = [];
        this.sitiosFiltrados = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.sitiosFiltrados = this.sitios.filter(
      (s) =>
        s.nombreSitio?.toLowerCase().includes(filtroLower) ||
        s.tipo?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevoSitio(): Sitio {
    return { nombreSitio: '', tipo: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.sitio = this.getNuevoSitio();
    this.displayDialog = true;
  }

  editar(sitio: Sitio) {
    this.esNuevo = false;
    this.sitio = { ...sitio };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.sitioService
        .crearSitio({
          nombreSitio: this.sitio.nombreSitio,
          tipo: this.sitio.tipo,
          responsableId: 1,
        })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Sitio creado correctamente',
            });
            this.displayDialog = false;
            this.cargarSitios();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el sitio',
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Sitio actualizado correctamente',
      });
      this.displayDialog = false;
      this.cargarSitios();
    }
  }

  eliminar(sitio: Sitio) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar el sitio ' + sitio.nombreSitio + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Sitio eliminado correctamente',
        });
        this.cargarSitios();
      },
    });
  }

  getTipoSeverity(tipo: string): string {
    switch (tipo) {
      case 'Bodega':
        return 'warning';
      case 'Laboratorio':
        return 'info';
      case 'Aula':
        return 'success';
      case 'Oficina':
        return 'secondary';
      case 'Almacén':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
