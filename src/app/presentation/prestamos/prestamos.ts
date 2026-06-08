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
import { PrestamosService, Prestamo } from '../../services/prestamos/prestamos.service';
import { UsuarioService } from '../../infrastructure/services/usuario.service';

@Component({
  selector: 'app-prestamos',
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
  templateUrl: './prestamos.html',
  styleUrl: './prestamos.scss',
})
export class PrestamosComponent implements OnInit {
  private prestamosService = inject(PrestamosService);
  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);

  prestamos: Prestamo[] = [];
  prestamosFiltrados: Prestamo[] = [];
  filtro = '';
  vistaActual: 'activos' | 'todos' = 'activos';

  loading = false;
  saving = false;
  showFormPrestamo = false;
  showFormDevolucion = false;
  prestamoSeleccionado: Prestamo | null = null;

  usuarios: any[] = [];
  items: any[] = [];

  prestamoForm: Partial<Prestamo> = {};
  devolucionForm = { estado_devolucion: '', observacion_devolucion: '' };

  estadoDevolucionOpciones = [
    { label: 'Bueno', value: 'BUENO' },
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Dañado', value: 'DAÑADO' },
    { label: 'Perdido', value: 'PERDIDO' },
  ];

  ngOnInit() {
    this.cargarPrestamos();
    this.cargarUsuarios();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showFormPrestamo && !this.showFormDevolucion) return;
    const target = event.target as HTMLElement;
    const inside = target.closest('.inline-form-container');
    const btn = target.closest('.btn-open-form');
    const overlay = target.closest('.p-overlaypanel, .p-select-overlay, .p-dropdown-panel, .p-toast');
    if (!inside && !btn && !overlay) {
      this.showFormPrestamo = false;
      this.showFormDevolucion = false;
    }
  }

  cargarPrestamos() {
    this.loading = true;
    const obs = this.vistaActual === 'activos'
      ? this.prestamosService.getActivos()
      : this.prestamosService.getAll();

    obs.subscribe({
      next: (data) => {
        this.prestamos = data;
        this.prestamosFiltrados = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los préstamos' });
      }
    });
  }

  cargarUsuarios() {
    this.usuarioService.getAll().subscribe({
      next: (data: any) => {
        this.usuarios = Array.isArray(data) ? data : (data.data || []);
      },
      error: () => {}
    });
  }

  setVista(vista: 'activos' | 'todos') {
    this.vistaActual = vista;
    this.cargarPrestamos();
  }

  filtrarGlobal() {
    const f = this.filtro.toLowerCase();
    this.prestamosFiltrados = this.prestamos.filter((p) =>
      (p.item?.producto?.nombre || '').toLowerCase().includes(f) ||
      (p.usuario?.nombre || '').toLowerCase().includes(f) ||
      (p.item?.codigo_sku || '').toLowerCase().includes(f)
    );
  }

  toggleFormPrestamo() {
    if (this.showFormPrestamo) {
      this.showFormPrestamo = false;
    } else {
      this.prestamoForm = {
        fecha_devolucion_esperada: '',
        observacion: '',
      };
      this.showFormPrestamo = true;
      this.showFormDevolucion = false;
    }
  }

  abrirFormDevolucion(prestamo: Prestamo) {
    this.prestamoSeleccionado = prestamo;
    this.devolucionForm = { estado_devolucion: '', observacion_devolucion: '' };
    this.showFormDevolucion = true;
    this.showFormPrestamo = false;
  }

  guardarPrestamo() {
    if (!this.prestamoForm.id_item || !this.prestamoForm.id_usuario || !this.prestamoForm.fecha_devolucion_esperada) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Complete todos los campos requeridos' });
      return;
    }
    this.saving = true;
    this.prestamosService.create(this.prestamoForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Préstamo registrado correctamente' });
        this.showFormPrestamo = false;
        this.saving = false;
        this.cargarPrestamos();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo registrar el préstamo' });
      }
    });
  }

  registrarDevolucion() {
    if (!this.devolucionForm.estado_devolucion) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione el estado de la devolución' });
      return;
    }
    this.saving = true;
    this.prestamosService.registrarDevolucion(this.prestamoSeleccionado!.id_prestamo!, this.devolucionForm).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Devolución registrada correctamente' });
        this.showFormDevolucion = false;
        this.saving = false;
        this.prestamoSeleccionado = null;
        this.cargarPrestamos();
      },
      error: (err) => {
        this.saving = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'No se pudo registrar la devolución' });
      }
    });
  }

  getEstadoSeverity(estado: string): any {
    switch (estado) {
      case 'ACTIVO': return 'info';
      case 'DEVUELTO': return 'success';
      case 'VENCIDO': return 'danger';
      default: return 'secondary';
    }
  }

  getEstadoDevolucionSeverity(estado: string): any {
    switch (estado) {
      case 'BUENO': return 'success';
      case 'REGULAR': return 'warn';
      case 'DAÑADO': return 'danger';
      case 'PERDIDO': return 'danger';
      default: return 'secondary';
    }
  }

  isVencido(fechaEsperada: string): boolean {
    return new Date(fechaEsperada) < new Date();
  }
}
