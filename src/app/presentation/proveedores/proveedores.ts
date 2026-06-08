import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ProveedoresService, Proveedor } from '../../services/proveedores/proveedores.service';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TagModule,
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.scss',
})
export class Proveedores implements OnInit {
  private proveedoresService = inject(ProveedoresService);
  private messageService = inject(MessageService);

  proveedores: Proveedor[] = [];
  proveedoresFiltrados: Proveedor[] = [];
  filtro = '';
  
  loading = false;
  saving = false;
  showForm = false;
  esNuevo = true;
  
  proveedorForm: Partial<Proveedor> = {};

  estadoOpciones = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  ngOnInit() {
    this.cargarProveedores();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showForm) return;

    const target = event.target as HTMLElement;
    const clickedInsideForm = target.closest('.inline-form-container');
    const clickedOpenButton = target.closest('.btn-open-form');
    const clickedOverlay = target.closest('.p-overlaypanel, .p-select-overlay, .p-dropdown-panel, .p-toast, .p-tooltip');

    if (!clickedInsideForm && !clickedOpenButton && !clickedOverlay) {
      this.showForm = false;
    }
  }

  cargarProveedores() {
    this.loading = true;
    this.proveedoresService.getAll().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores' });
      }
    });
  }

  filtrarGlobal() {
    const f = this.filtro.toLowerCase();
    this.proveedoresFiltrados = this.proveedores.filter((p) =>
      (p.nombre_empresa || '').toLowerCase().includes(f) ||
      (p.nit || '').toLowerCase().includes(f) ||
      (p.correo || '').toLowerCase().includes(f)
    );
  }

  toggleForm() {
    if (this.showForm) {
      this.showForm = false;
    } else {
      this.openNew();
    }
  }

  openNew() {
    this.esNuevo = true;
    this.proveedorForm = {
      nombre_empresa: '',
      nit: '',
      contacto: '',
      telefono: '',
      correo: '',
      direccion: '',
      estado: true
    };
    this.showForm = true;
  }

  editarProveedor(p: Proveedor) {
    this.esNuevo = false;
    this.proveedorForm = { ...p };
    this.showForm = true;
  }

  guardarProveedor() {
    if (!this.proveedorForm.nombre_empresa) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El nombre de la empresa es requerido' });
      return;
    }

    this.saving = true;

    if (this.esNuevo) {
      this.proveedoresService.create(this.proveedorForm as Proveedor).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado correctamente' });
          this.showForm = false;
          this.saving = false;
          this.cargarProveedores();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo crear el proveedor' });
        }
      });
    } else {
      const id = this.proveedorForm.id_proveedor!;
      const updateData = { ...this.proveedorForm };
      delete updateData.id_proveedor;

      this.proveedoresService.update(id, updateData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado correctamente' });
          this.showForm = false;
          this.saving = false;
          this.cargarProveedores();
        },
        error: (err) => {
          this.saving = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo actualizar el proveedor' });
        }
      });
    }
  }
}
