import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FichaService } from '../../infrastructure/services/ficha.service';

interface Ficha {
  id?: number;
  numeroFiscal: string;
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
    ToggleSwitchModule,
    TooltipModule,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title">
          <i class="pi pi-id-card"></i> Fichas de Formación
        </h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar ficha..." class="search-input" />
          </div>
          <button pButton label="Nueva" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table
          [value]="fichasFiltradas"
          [paginator]="true"
          [rows]="10"
          styleClass="modern-table"
          [rowHover]="true"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width:120px">ID</th>
              <th>Número de Ficha</th>
              <th>Programa de Formación</th>
              <th style="width:150px">Estado</th>
              <th style="width:150px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-ficha>
            <tr>
              <td><span class="id-badge">#{{ ficha.id }}</span></td>
              <td><span class="nombre-cell">{{ ficha.numeroFiscal }}</span></td>
              <td><span class="correo-cell">{{ ficha.programa }}</span></td>
              <td>
                <p-tag
                  [value]="ficha.estado ? 'ACTIVA' : 'INACTIVA'"
                  [severity]="ficha.estado ? 'success' : 'danger'"
                  styleClass="px-3 py-1 font-bold rounded-lg"
                ></p-tag>
              </td>
              <td>
                <div class="action-buttons justify-center">
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="btn-table-action btn-editor"
                    (click)="editar(ficha)"
                    pTooltip="Editar ficha"
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="btn-table-action btn-eliminar"
                    (click)="eliminar(ficha)"
                    pTooltip="Eliminar ficha"
                  ></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="empty-message">
                <i class="pi pi-id-card"></i>
                <p>No se encontraron fichas registradas</p>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog
      [header]="esNuevo ? '✨ Nueva Ficha' : '📝 Editar Ficha'"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
      [draggable]="false"
      [resizable]="false"
      styleClass="form-dialog"
    >
      <div class="flex flex-col gap-4 mt-4">
        <div class="form-field">
          <label for="numeroFiscal">Número de Ficha / Código *</label>
          <input
            pInputText
            id="numeroFiscal"
            [(ngModel)]="ficha.numeroFiscal"
            placeholder="Ej: 2711854"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label for="programa">Programa de Formación *</label>
          <input
            pInputText
            id="programa"
            [(ngModel)]="ficha.programa"
            placeholder="Ej: ADSO"
            class="form-input"
          />
        </div>
        <div class="form-field">
          <label>Estado de la Ficha</label>
          <div class="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p-toggleSwitch [(ngModel)]="ficha.estado"></p-toggleSwitch>
            <span class="font-bold" [class.text-green-600]="ficha.estado" [class.text-red-600]="!ficha.estado">
               {{ ficha.estado ? 'FICHA ACTIVA' : 'FICHA INACTIVA' }}
            </span>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancelar"
          class="btn-secondary"
          (click)="displayDialog = false"
        ></button>
        <button
          pButton
          label="Guardar Ficha"
          class="btn-primary"
          (click)="guardar()"
        ></button>
      </ng-template>
    </p-dialog>
  `
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
  ficha: Ficha = this.getNuevaFiscal();
  ngOnInit() {
    this.cargarFichas();
  }
  cargarFichas() {
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        const d = res?.data || res || [];
        this.fichas = d;
        this.fichasFiltradas = d;
      },
      error: () => {
        this.fichas = [];
        this.fichasFiltradas = [];
      },
    });
  }
  filtrar() {
    const f = this.filtro.toLowerCase();
    this.fichasFiltradas = this.fichas.filter(
      (fi) => fi.numeroFiscal?.toLowerCase().includes(f) || fi.programa?.toLowerCase().includes(f),
    );
  }
  getNuevaFiscal(): Ficha {
    return { numeroFiscal: '', programa: '', estado: true };
  }
  openNew() {
    this.esNuevo = true;
    this.ficha = this.getNuevaFiscal();
    this.displayDialog = true;
  }
  editar(fi: Ficha) {
    this.esNuevo = false;
    this.ficha = { ...fi };
    this.displayDialog = true;
  }
  guardar() {
    if (!this.ficha.numeroFiscal || !this.ficha.programa) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Todos los campos son requeridos',
      });
      return;
    }
    if (this.esNuevo) {
      this.fichaService.crearFiscal(this.ficha).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Fiscal creada correctamente',
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
      this.fichaService.actualizarFiscal(this.ficha.id!, this.ficha).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Fiscal actualizada correctamente',
          });
          this.displayDialog = false;
          this.cargarFichas();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la ficha',
          });
        },
      });
    }
  }
  eliminar(fi: Ficha) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar la ficha ' + fi.numeroFiscal + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.fichaService.eliminarFiscal(fi.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Fiscal eliminada correctamente',
            });
            this.cargarFichas();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la ficha',
            });
          },
        });
      },
    });
  }
}
