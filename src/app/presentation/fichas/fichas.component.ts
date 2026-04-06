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
import { FichaService } from '../../infrastructure/services/ficha.service';

interface Ficha {
  id?: number;
  numeroFicha: string;
  programa: string;
  estado?: boolean;
}

@Component({
  selector: 'app-fichas',
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
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Fichas</h2>
        <button
          pButton
          label="Nueva Ficha"
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
              placeholder="Buscar ficha..."
              class="w-64"
            />
          </span>
        </div>

        <p-table
          [value]="fichasFiltradas"
          [paginator]="true"
          [rows]="10"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-striped"
        >
          <ng-template pTemplate="header">
            <tr>
              <th class="!bg-white !text-gray-600">ID</th>
              <th class="!bg-white !text-gray-600">Número de Ficha</th>
              <th class="!bg-white !text-gray-600">Programa de Formación</th>
              <th class="!bg-white !text-gray-600">Estado</th>
              <th class="!bg-white !text-gray-600 text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-ficha>
            <tr>
              <td class="font-medium text-gray-900">#{{ ficha.id }}</td>
              <td class="font-medium text-gray-900">{{ ficha.numeroFicha }}</td>
              <td>{{ ficha.programa }}</td>
              <td>
                <p-tag
                  [value]="ficha.estado ? 'Activa' : 'Inactiva'"
                  [severity]="ficha.estado ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td class="text-center">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editar(ficha)"
                  class="p-button-text p-button-sm text-[#39A900] mr-2"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  (click)="eliminar(ficha)"
                  class="p-button-text p-button-sm p-button-danger"
                ></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-8 text-gray-500">No se encontraron fichas.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      header="{{ esNuevo ? 'Nueva Ficha' : 'Editar Ficha' }}"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '450px' }"
      [draggable]="false"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="numeroFicha" class="font-medium text-gray-700">Número de Ficha</label>
          <input
            pInputText
            id="numeroFicha"
            [(ngModel)]="ficha.numeroFicha"
            class="w-full"
            placeholder="Ej: 1234567"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="programa" class="font-medium text-gray-700">Programa de Formación</label>
          <input
            pInputText
            id="programa"
            [(ngModel)]="ficha.programa"
            class="w-full"
            placeholder="Ej: Análisis y Desarrollo de Software"
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
export class FichasComponent implements OnInit {
  private fichaService = inject(FichaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  fichas: Ficha[] = [];
  fichasFiltradas: Ficha[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  ficha: Ficha = this.getNuevaFicha();

  ngOnInit() {
    this.cargarFichas();
  }

  cargarFichas() {
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.fichas = res.data;
          this.fichasFiltradas = res.data;
        }
      },
      error: () => {
        this.fichas = [];
        this.fichasFiltradas = [];
      },
    });
  }

  filtrar() {
    const filtroLower = this.filtro.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (f) =>
        f.numeroFicha?.toLowerCase().includes(filtroLower) ||
        f.programa?.toLowerCase().includes(filtroLower),
    );
  }

  getNuevaFicha(): Ficha {
    return { numeroFicha: '', programa: '', estado: true };
  }

  openNew() {
    this.esNuevo = true;
    this.ficha = this.getNuevaFicha();
    this.displayDialog = true;
  }

  editar(ficha: Ficha) {
    this.esNuevo = false;
    this.ficha = { ...ficha };
    this.displayDialog = true;
  }

  guardar() {
    if (this.esNuevo) {
      this.fichaService
        .crearFicha({ numeroFicha: this.ficha.numeroFicha, programa: this.ficha.programa })
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Ficha creada correctamente',
            });
            this.displayDialog = false;
            this.cargarFichas();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear la ficha',
            });
          },
        });
    } else {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Ficha actualizada correctamente',
      });
      this.displayDialog = false;
      this.cargarFichas();
    }
  }

  eliminar(ficha: Ficha) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la ficha ' + ficha.numeroFicha + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: ' ficha eliminada correctamente',
        });
        this.cargarFichas();
      },
    });
  }
}
