import { Component, OnInit, OnDestroy, inject, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { ProductoService } from '../../infrastructure/services/producto.service';
import { CategoriaService } from '../../infrastructure/services/categoria.service';
import { SitioService } from '../../infrastructure/services/sitio.service';
import { AuthService } from '../../infrastructure/services/auth.service';
import { NovedadService } from '../../infrastructure/services/novedad.service';
import { AsignacionService } from '../../infrastructure/services/asignacion.service';
import { TrasladoService } from '../../infrastructure/services/traslado.service';
import { FichaService } from '../../infrastructure/services/ficha.service';
import { ApiService } from '../../core/services/api.service';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  codigo_unspsc: string;
  SKU: string;
  tipo_material: string;
  unidad_medida: string;
  es_psd: boolean;
  fecha_vencimiento?: string;
  id_categoria?: number;
  stock_minimo?: number;
  itemsDisponibles?: number;
  totalItems?: number;
  unidad_peso_bulto?: string;
  peso_por_bulto?: number;
  id_sitio?: number | null;
  categoria?: { id_categoria: number; nombre: string };
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

type SelectOption = { label: string; value: string };

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    TableModule, ButtonModule, InputTextModule, DialogModule,
    TagModule, ToastModule, ConfirmDialogModule, SelectModule,
    TextareaModule, FileUploadModule, TooltipModule
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [ConfirmationService],
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="module-container">
      <div class="module-header">
        <h3 class="page-title"><i class="pi pi-box"></i> Catálogo de Productos</h3>
        <div class="header-actions">
          <div class="search-wrapper">
            <i class="pi pi-search"></i>
            <input pInputText type="text" [(ngModel)]="filtro" (input)="filtrar()"
              placeholder="Buscar por nombre o SKU..." class="search-input" />
          </div>
          <button pButton label="Buscar Placa SENA" icon="pi pi-id-card" class="btn-add"
            (click)="abrirBuscarPlaca()"></button>
          <button *ngIf="esAdmin()" pButton label="Nuevo" icon="pi pi-plus" class="btn-add" (click)="openNew()"></button>
        </div>
      </div>

      <div class="data-table-wrapper">
        <p-table [value]="productosFiltrados" [paginator]="true" [rows]="15"
          [rowsPerPageOptions]="[5,15,20]" [(selection)]="selectedProducts"
          styleClass="modern-table" [rowHover]="true" dataKey="id_producto">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:3rem"><p-tableHeaderCheckbox></p-tableHeaderCheckbox></th>
              <th style="min-width:90px">SKU</th>
              <th style="min-width:140px">Nombre</th>
              <th style="min-width:160px">Descripción</th>
              <th style="min-width:110px">Bodega</th>
              <th style="min-width:110px">Categoría</th>
              <th style="min-width:120px">Código UNSPSC</th>
              <th style="min-width:110px">Tipo Material</th>
              <th style="min-width:100px">Unidad</th>
              <th style="min-width:130px" class="text-center">Info Bulto</th>
              <th style="min-width:110px" class="text-center">Vencimiento</th>
              <th style="min-width:60px" class="text-center">Stock<br/>Mín.</th>
              <th style="min-width:80px" class="text-center">Disponibles</th>
              <th style="min-width:110px" class="text-center">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-producto>
            <tr>
              <td><p-tableCheckbox [value]="producto"></p-tableCheckbox></td>

              <!-- SKU -->
              <td><span class="sku-cell">{{ producto.SKU || '—' }}</span></td>

              <!-- Nombre -->
              <td><span class="product-name">{{ producto.nombre }}</span></td>

              <!-- Descripción -->
              <td>
                <span *ngIf="producto.descripcion" class="text-xs text-slate-500">{{ producto.descripcion }}</span>
                <span *ngIf="!producto.descripcion" class="text-slate-300">—</span>
              </td>

              <!-- Bodega -->
              <td>
                <div class="flex items-center gap-1">
                  <i class="pi pi-home text-indigo-400 text-xs"></i>
                  <span class="text-sm font-semibold text-indigo-700">{{ getBodegaNombre(producto.id_sitio) }}</span>
                </div>
                <span *ngIf="getBodegaTipoLabel(producto.id_sitio)" class="text-xs text-slate-400">{{ getBodegaTipoLabel(producto.id_sitio) }}</span>
              </td>

              <!-- Categoría -->
              <td>
                <p-tag [value]="producto.categoria?.nombre || 'Sin categoría'"
                  severity="secondary" styleClass="px-2 py-1 text-xs font-bold rounded-lg"></p-tag>
              </td>

              <!-- UNSPSC -->
              <td>
                <div *ngIf="producto.codigo_unspsc">
                  <span class="text-xs text-slate-500 font-mono block">{{ producto.codigo_unspsc }}</span>
                  <span class="text-xs text-slate-400 block">{{ getUnspscName(producto.codigo_unspsc) }}</span>
                </div>
                <span *ngIf="!producto.codigo_unspsc" class="text-slate-300">—</span>
              </td>

              <!-- Tipo Material -->
              <td>
                <p-tag [value]="producto.tipo_material || '—'"
                  [severity]="getTipoMaterialSeverity(producto.tipo_material)"
                  styleClass="px-2 py-1 text-xs font-bold rounded-lg"></p-tag>
              </td>

              <!-- Unidad de Medida -->
              <td>
                <span class="text-sm font-semibold text-slate-600">{{ producto.unidad_medida || '—' }}</span>
              </td>

              <!-- Info Bulto (peso por bulto + unidad peso) -->
              <td class="text-center">
                <ng-container *ngIf="producto.unidad_medida === 'BULTO' && producto.peso_por_bulto; else noBulto">
                  <span class="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-2 py-1 text-xs font-bold">
                    <i class="pi pi-box text-xs"></i>
                    {{ producto.peso_por_bulto }} {{ producto.unidad_peso_bulto || '' }}
                  </span>
                </ng-container>
                <ng-template #noBulto>
                  <span class="text-slate-300 text-xs">—</span>
                </ng-template>
              </td>

              <!-- Fecha Vencimiento -->
              <td class="text-center">
                <ng-container *ngIf="producto.tipo_material === 'PERECEDERO' && producto.fecha_vencimiento; else sinFecha">
                  <span [ngClass]="getFechaClass(producto.fecha_vencimiento)"
                    class="text-xs font-semibold px-2 py-1 rounded-lg inline-block">
                    <i class="pi pi-calendar mr-1"></i>{{ producto.fecha_vencimiento | date:'dd/MM/yy' }}
                  </span>
                </ng-container>
                <ng-template #sinFecha>
                  <span class="text-slate-300 text-xs">—</span>
                </ng-template>
              </td>

              <!-- Stock Mínimo -->
              <td class="text-center"><span class="text-sm">{{ producto.stock_minimo || 0 }}</span></td>

              <!-- Disponibles / Total Items -->
              <td class="text-center">
                <span class="font-bold" [ngClass]="{
                  'text-green-600': (producto.itemsDisponibles || 0) > 0,
                  'text-red-500': (producto.itemsDisponibles || 0) === 0
                }">{{ producto.itemsDisponibles || 0 }}</span>
                <span class="text-xs text-slate-400"> / {{ producto.totalItems || 0 }}</span>
              </td>

              <!-- Acciones -->
              <td>
                <div class="action-buttons justify-center">
                  <button pButton icon="pi pi-eye" class="btn-table-action btn-editor"
                    style="background-color:#f0fdf4!important;color:#475569!important"
                    (click)="verItems(producto)" pTooltip="Ver items" tooltipPosition="top"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-pencil"
                    class="btn-table-action btn-editor" (click)="editar(producto)" pTooltip="Editar" tooltipPosition="top"></button>
                  <button *ngIf="esAdmin()" pButton icon="pi pi-trash"
                    class="btn-table-action btn-eliminar" (click)="eliminar(producto)" pTooltip="Eliminar" tooltipPosition="top"></button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="14" class="text-center p-4">
              <i class="pi pi-box text-4xl text-slate-300 mb-2"></i>
              <p>No se encontraron productos</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- ===== DIÁLOGO CREAR / EDITAR ===== -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      [header]="esNuevo ? '✨ Registrar Producto' : '📝 Editar Producto'"
      [(visible)]="displayDialog" [modal]="true"
      [style]="{ width: '94vw', maxWidth: '660px' }"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">

      <form [formGroup]="productoForm" class="form-grid mt-2">

        <!-- Nombre -->
        <div class="form-field">
          <label for="nombre">Nombre *</label>
          <input pInputText id="nombre" formControlName="nombre" placeholder="Ej: Arroz blanco" />
        </div>

        <!-- Descripción -->
        <div class="form-field">
          <label for="descripcion">Descripción técnica del elemento o servicio</label>
          <textarea
            pTextarea
            id="descripcion"
            formControlName="descripcion"
            placeholder="Descripción detallada del producto..."
            [rows]="3"
            style="resize:vertical; min-height:68px; width:100%; border:2px solid #1e293b; border-radius:8px; padding:8px 10px; font-size:0.875rem; background:#fff; color:#1e293b; outline:none; box-sizing:border-box;"
          ></textarea>
        </div>

        <!-- UNSPSC + Placa SENA -->
        <div class="product-form-row">
          <div class="form-field" [style.flex]="esGastronomia ? '1' : '2'">
            <label for="codigo_unspsc">
              Código UNSPSC
              <span class="text-xs text-slate-400 font-normal ml-1">(Colombia Compra Eficiente)</span>
            </label>
            <p-select
              id="codigo_unspsc"
              formControlName="codigo_unspsc"
              [options]="codigosUnspsc"
              [filter]="true"
              filterPlaceholder="Escriba el código o nombre del producto..."
              placeholder="Seleccione el código UNSPSC"
              appendTo="body"
              styleClass="w-full"
              [showClear]="true"
              (onChange)="onUnspscChange($event.value)"
            ></p-select>
            <small *ngIf="esGastronomia" class="text-emerald-600 font-semibold mt-1 block">
              <i class="pi pi-seedling mr-1"></i>Producto de gastronomía — SKU no requerido
            </small>
          </div>
          <div *ngIf="!esGastronomia" class="form-field" style="flex:1">
            <label for="SKU">SKU <span style="color:#94a3b8;font-weight:400;font-size:11px">(opcional)</span></label>
            <input pInputText id="SKU" formControlName="SKU"
              style="font-family:monospace;font-weight:700"
              placeholder="Ej: DEL-1  (se genera solo si lo dejas vacío)" />
            <small style="color:#6366f1;font-size:11px;margin-top:4px;display:flex;align-items:center;gap:4px">
              <i class="pi pi-bolt"></i>
              <span *ngIf="esNuevo && skuEsAuto">Auto-generando del nombre — escribe aquí para personalizarlo.</span>
              <span *ngIf="esNuevo && !skuEsAuto">SKU personalizado. Bórralo para volver al automático.</span>
              <span *ngIf="!esNuevo">Puedes cambiar el SKU si lo necesitas.</span>
            </small>
          </div>
        </div>

        <!-- Tipo de Material + Unidad de Medida -->
        <div class="product-form-row">
          <div class="form-field">
            <label for="tipo_material">Tipo de Material *</label>
            <div class="input-with-button">
              <p-select id="tipo_material" formControlName="tipo_material"
                [options]="tiposMaterial" placeholder="Seleccione tipo"
                [filter]="true" filterPlaceholder="Buscar tipo..."
                appendTo="body" styleClass="w-full"
                (onChange)="onTipoMaterialChange($event.value)"></p-select>
              <button pButton type="button" icon="pi pi-plus" class="btn-inline-add"
                (click)="displayAddTipoMaterial=true" pTooltip="Agregar tipo"></button>
            </div>
          </div>
          <div class="form-field">
            <label for="unidad_medida">Unidad de Medida *</label>
            <div class="input-with-button">
              <p-select id="unidad_medida" formControlName="unidad_medida"
                [options]="unidadesDisponibles" placeholder="Seleccione unidad"
                [filter]="true" filterPlaceholder="Buscar unidad..."
                appendTo="body" styleClass="w-full"
                (onChange)="onUnidadMedidaChange($event.value)"></p-select>
              <button pButton type="button" icon="pi pi-plus" class="btn-inline-add"
                (click)="displayAddUnidadMedida=true" pTooltip="Agregar unidad"></button>
            </div>
            <small *ngIf="codigoUnspscSeleccionado" class="text-blue-500 mt-1 block text-xs">
              <i class="pi pi-filter mr-1"></i>Unidades filtradas para el producto seleccionado
            </small>
          </div>
        </div>

        <!-- Campos especiales BULTO / PAQUETE -->
        <div *ngIf="esBulto" class="product-form-row" style="background:#fff7ed;border-radius:10px;padding:10px 8px 4px;margin-bottom:2px;border:1px solid #fed7aa;">
          <div class="form-field">
            <label style="color:#c2410c;font-weight:700;">
              <i class="pi pi-box mr-1"></i>Unidad de peso del {{ labelPresentacion }}
            </label>
            <p-select formControlName="unidad_peso_bulto" [options]="unidadesPeso"
              placeholder="kg / g / lb..." appendTo="body" styleClass="w-full"
              [filter]="true" filterPlaceholder="Buscar unidad..."
              [showClear]="true"></p-select>
          </div>
          <div class="form-field" *ngIf="mostrarPesoPorBulto">
            <label style="color:#c2410c;font-weight:700;">
              Peso por {{ labelPresentacion }} ({{ productoForm.get('unidad_peso_bulto')?.value | lowercase }})
            </label>
            <input pInputText type="number" formControlName="peso_por_bulto"
              placeholder="Ej: 50" min="0.01" step="0.01" style="width:100%" />
          </div>
        </div>

        <!-- Peso / volumen por presentación — solo para unidades de peso/volumen (no BULTO/PAQUETE) -->
        <div *ngIf="esMedidaPesoVol"
          style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 12px 10px;margin-bottom:2px;">
          <label style="color:#1d4ed8;font-weight:700;font-size:0.875rem;display:flex;align-items:center;gap:6px;margin-bottom:10px;">
            <i class="pi pi-info-circle"></i>
            ¿Cuántos {{ unidadActual | lowercase }} tiene cada presentación/bolsa?
            <span style="font-weight:400;color:#64748b;font-size:0.78rem;">(Opcional)</span>
          </label>
          <input pInputText type="number" formControlName="peso_por_bulto"
            [placeholder]="'Ej: si cada bolsa pesa 10 ' + (unidadActual | lowercase) + ', ingrese 10'"
            min="0.001" step="0.001"
            style="width:100%;background:#fff;border:2px solid #93c5fd;border-radius:8px;padding:10px 12px;font-size:0.9rem;color:#1e293b;outline:none" />
          <small style="color:#3b82f6;font-size:0.75rem;margin-top:6px;display:block;">
            Si el producto no viene en presentaciones de peso fijo, deje este campo vacío.
          </small>
        </div>

        <!-- Cantidad + Stock mínimo -->
        <div class="product-form-row">
          <div *ngIf="esNuevo" class="form-field">
            <label for="cantidad">{{ esBulto ? ('Cantidad de ' + labelPresentacion + 's *') : 'Cantidad de unidades *' }}</label>
            <input pInputText type="number" id="cantidad" formControlName="cantidad"
              placeholder="Ej: 5" min="1" />
            <small *ngIf="esMedidaPesoVol && productoForm.get('peso_por_bulto')?.value"
              class="text-blue-500 text-xs mt-1 block">
              Total: {{ (productoForm.get('cantidad')?.value || 0) * (productoForm.get('peso_por_bulto')?.value || 0) | number:'1.0-3' }}
              {{ unidadActual | lowercase }} en inventario
            </small>
          </div>
          <div class="form-field">
            <label for="stock_minimo">Stock mínimo para alertas *</label>
            <input pInputText type="number" id="stock_minimo" formControlName="stock_minimo"
              placeholder="Ej: 2" min="1" />
          </div>
        </div>

        <!-- Fecha de vencimiento — solo PERECEDERO -->
        <div *ngIf="esPerecedero" class="form-field"
          style="background:#fff7ed;border-radius:10px;padding:12px;border:1px solid #fed7aa;">
          <label for="fecha_vencimiento" class="flex items-center gap-2 flex-wrap mb-2">
            <i class="pi pi-calendar text-orange-500 text-lg"></i>
            <span class="font-bold text-orange-700">¿El producto tiene fecha de vencimiento?</span>
          </label>
          <p class="text-xs text-orange-500 mb-2 -mt-1">
            Ingrese la fecha límite de uso o consumo del producto perecedero.
          </p>
          <input pInputText type="date" id="fecha_vencimiento"
            formControlName="fecha_vencimiento"
            [min]="minDate"
            style="width:100%;background:#fff;border:2px solid #fed7aa;border-radius:10px;padding:11px 14px;font-size:0.9rem;color:#1e293b;cursor:pointer;min-height:44px" />
          <small *ngIf="fechaInvalida" class="text-red-500 mt-1 block">
            <i class="pi pi-exclamation-triangle mr-1"></i>La fecha debe ser igual o posterior a hoy.
          </small>
        </div>

        <!-- Categoría + Bodega -->
        <div class="product-form-row">
          <div class="form-field">
            <label for="id_categoria">Categoría *</label>
            <div class="input-with-button">
              <p-select id="id_categoria" formControlName="id_categoria"
                [options]="categorias" optionLabel="nombre" optionValue="id_categoria"
                placeholder="Seleccione una categoría" [showClear]="true"
                [filter]="true" filterPlaceholder="Buscar categoría..."
                appendTo="body" styleClass="w-full"></p-select>
              <button pButton type="button" icon="pi pi-plus" class="btn-inline-add"
                (click)="displayAddCategoria=true" pTooltip="Agregar categoría"></button>
            </div>
          </div>
          <div class="form-field">
            <label for="id_sitio">Bodega *</label>
            <p-select id="id_sitio" formControlName="id_sitio"
              [options]="bodegas" optionLabel="nombre" optionValue="id_sitio"
              placeholder="Seleccione la bodega" [showClear]="true"
              [filter]="true" filterPlaceholder="Buscar bodega..."
              appendTo="body" styleClass="w-full">
              <ng-template let-b pTemplate="item">
                <div class="flex items-center gap-2">
                  <i class="pi pi-home text-indigo-400 text-sm"></i>
                  <div>
                    <span class="text-sm font-semibold block">{{ b.nombre }}</span>
                    <small class="text-xs text-slate-400">{{ getBodegaTipoLabel(b.id_sitio) }}</small>
                  </div>
                </div>
              </ng-template>
            </p-select>
            <small *ngIf="bodegas.length === 0" class="text-amber-600 text-xs mt-1 block">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              No hay bodegas. Créalas en <strong>Inventario › Bodegas</strong>.
            </small>
          </div>
        </div>

      </form>

      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayDialog=false"></button>
          <button pButton label="Guardar" class="btn-guardar"
            [disabled]="productoForm.invalid || fechaInvalida" (click)="guardar()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Nueva Categoría -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="✨ Registrar Nueva Categoría" [(visible)]="displayAddCategoria"
      [modal]="true" [style]="{width:'90vw',maxWidth:'400px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-grid mt-2">
        <div class="form-field">
          <label>Nombre de la Categoría *</label>
          <input pInputText [(ngModel)]="nuevoNombreCategoria" placeholder="Ej: Lácteos" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayAddCategoria=false;nuevoNombreCategoria=''"></button>
          <button pButton label="Guardar" class="btn-guardar" [disabled]="!nuevoNombreCategoria.trim()" (click)="guardarNuevaCategoria()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Nuevo Tipo de Material -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="✨ Registrar Tipo de Material" [(visible)]="displayAddTipoMaterial"
      [modal]="true" [style]="{width:'90vw',maxWidth:'400px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-grid mt-2">
        <div class="form-field">
          <label>Nombre del Tipo *</label>
          <input pInputText [(ngModel)]="nuevoNombreTipoMaterial" placeholder="Ej: CONSUMO..." />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayAddTipoMaterial=false;nuevoNombreTipoMaterial=''"></button>
          <button pButton label="Guardar" class="btn-guardar" [disabled]="!nuevoNombreTipoMaterial.trim()" (click)="guardarNuevoTipoMaterial()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Nueva Unidad de Medida -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="✨ Registrar Unidad de Medida" [(visible)]="displayAddUnidadMedida"
      [modal]="true" [style]="{width:'90vw',maxWidth:'400px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-grid mt-2">
        <div class="form-field">
          <label>Nombre de la Unidad *</label>
          <input pInputText [(ngModel)]="nuevoNombreUnidadMedida" placeholder="Ej: CARTÓN, ATADO..." />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayAddUnidadMedida=false;nuevoNombreUnidadMedida=''"></button>
          <button pButton label="Guardar" class="btn-guardar" [disabled]="!nuevoNombreUnidadMedida.trim()" (click)="guardarNuevaUnidadMedida()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Ver items -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="📦 Items del Lote"
      [(visible)]="displayItemsDialog" [modal]="true"
      [style]="{width:'94vw',maxWidth:'720px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog items-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div *ngIf="cargandoItems" class="flex justify-center items-center p-8">
        <i class="pi pi-spin pi-spinner text-4xl text-emerald-500"></i>
      </div>
      <div *ngIf="!cargandoItems && productoSeleccionadoParaItems" class="items-dialog-body">

        <!-- Tarjeta resumen del producto -->
        <div class="items-summary-card">
          <div class="items-summary-main">
            <div class="items-summary-icon"><i class="pi pi-box"></i></div>
            <div>
              <div class="items-summary-name">{{ productoSeleccionadoParaItems.nombre }}</div>
              <div class="items-summary-meta">
                <span class="sku-cell">{{ productoSeleccionadoParaItems.SKU || 'Sin SKU' }}</span>
                <span class="items-summary-dot">·</span>
                <span>{{ productoSeleccionadoParaItems.categoria?.nombre || 'Sin categoría' }}</span>
              </div>
            </div>
          </div>
          <button pButton label="Agregar Item" icon="pi pi-plus" class="btn-guardar"
            (click)="abrirAgregarItem()"></button>
        </div>

        <!-- Contadores por estado -->
        <div class="items-stats-row">
          <div class="items-stat items-stat-total">
            <div class="items-stat-icon"><i class="pi pi-th-large"></i></div>
            <div class="items-stat-text">
              <span class="items-stat-value">{{ itemsDelProducto.length }}</span>
              <span class="items-stat-label">Total</span>
            </div>
          </div>
          <div class="items-stat items-stat-disponible">
            <div class="items-stat-icon"><i class="pi pi-check-circle"></i></div>
            <div class="items-stat-text">
              <span class="items-stat-value">{{ contarItemsEstado('DISPONIBLE') }}</span>
              <span class="items-stat-label">Disponibles</span>
            </div>
          </div>
          <div class="items-stat items-stat-prestado">
            <div class="items-stat-icon"><i class="pi pi-send"></i></div>
            <div class="items-stat-text">
              <span class="items-stat-value">{{ contarItemsEstado('PRESTADO') }}</span>
              <span class="items-stat-label">Prestados</span>
            </div>
          </div>
          <div class="items-stat items-stat-danado">
            <div class="items-stat-icon"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="items-stat-text">
              <span class="items-stat-value">{{ contarItemsEstado('DAÑADO') + contarItemsEstado('PERDIDO') }}</span>
              <span class="items-stat-label">Dañados / Perdidos</span>
            </div>
          </div>
        </div>

        <p-table [value]="itemsDelProducto" styleClass="modern-table items-table" [rowHover]="true"
          [paginator]="itemsDelProducto.length > 6" [rows]="6">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:80px">ID</th>
              <th>Código SKU</th>
              <th>Placa SENA</th>
              <th>Ubicación</th>
              <th class="text-center" style="width:130px">Estado</th>
              <th class="text-center" style="width:110px">Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td><span class="font-semibold text-slate-500">#{{ item.id_item }}</span></td>
              <td>
                <span *ngIf="item.codigo_sku" class="sku-cell">{{ item.codigo_sku }}</span>
                <span *ngIf="!item.codigo_sku" class="text-slate-300">—</span>
              </td>
              <td>
                <span *ngIf="item.placa_sena" class="sku-cell">{{ item.placa_sena }}</span>
                <span *ngIf="!item.placa_sena" class="text-slate-300 italic">Sin placa</span>
              </td>
              <td>
                <span style="font-size:12px;color:#374151;display:block">{{ getBodegaNombre(item.id_sitio) }}</span>
                <span *ngIf="getBodegaTipoLabel(item.id_sitio)" style="font-size:11px;color:#94a3b8">{{ getBodegaTipoLabel(item.id_sitio) }}</span>
              </td>
              <td class="text-center">
                <p-tag [value]="item.estado" [severity]="getItemSeverity(item.estado)"
                  styleClass="px-3 py-1 font-bold rounded-lg"></p-tag>
              </td>
              <td class="text-center">
                <div class="action-buttons justify-center">
                  <button *ngIf="item.estado === 'DISPONIBLE'" pButton icon="pi pi-send"
                    class="p-button-text"
                    style="color:#16a34a"
                    pTooltip="Asignar a una ficha"
                    tooltipPosition="top"
                    (click)="abrirAsignarItem(item)">
                  </button>
                  <button *ngIf="item.estado === 'DISPONIBLE'" pButton icon="pi pi-truck"
                    class="p-button-text"
                    style="color:#7c3aed"
                    pTooltip="Trasladar a otro lugar"
                    tooltipPosition="top"
                    (click)="abrirTrasladarItem(item)">
                  </button>
                  <button pButton icon="pi pi-pencil"
                    class="p-button-text"
                    style="color:#3b82f6"
                    pTooltip="Editar Placa SENA"
                    tooltipPosition="top"
                    (click)="abrirEditarItem(item)">
                  </button>
                  <button pButton icon="pi pi-exclamation-circle"
                    class="p-button-text"
                    style="color:#f59e0b"
                    pTooltip="Registrar novedad"
                    tooltipPosition="top"
                    (click)="abrirDialogoNovedad(item)">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="6" class="text-center p-4">
              <i class="pi pi-info-circle text-4xl text-slate-300 mb-2"></i>
              <p class="text-slate-500">No se encontraron items para este producto.</p>
            </td></tr>
          </ng-template>
        </p-table>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cerrar" class="btn-cancelar" (click)="displayItemsDialog=false"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Agregar Item al lote -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="➕ Agregar Ítem al Lote"
      [(visible)]="displayAgregarItemDialog" [modal]="true"
      [style]="{width:'90vw',maxWidth:'420px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-container mt-2" *ngIf="productoSeleccionadoParaItems">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:1rem">
          Producto: {{ productoSeleccionadoParaItems.nombre }} &nbsp;·&nbsp; SKU: {{ productoSeleccionadoParaItems.SKU || '—' }}
          <span style="display:block;margin-top:2px">El nuevo ítem heredará automáticamente el SKU del producto.</span>
        </div>
        <div class="form-field">
          <label>Placa SENA (opcional)</label>
          <input pInputText type="text" [(ngModel)]="nuevaPlacaItem" placeholder="Ej: SENA-12345"
            (keyup.enter)="agregarItemAlLote()" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayAgregarItemDialog=false"></button>
          <button pButton label="Agregar" class="btn-guardar" [loading]="agregandoItem" (click)="agregarItemAlLote()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Asignar Item: a una ficha o directamente a una bodega/ambiente -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="📨 Asignar Ítem"
      [(visible)]="displayAsignarItemDialog" [modal]="true"
      [style]="{width:'90vw',maxWidth:'480px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-container mt-2" *ngIf="itemParaAsignar">
        <!-- Info del ítem -->
        <div style="font-size:12px;color:#94a3b8;margin-bottom:1rem">
          Item #{{ itemParaAsignar.id_item }} &nbsp;·&nbsp; SKU: {{ itemParaAsignar.codigo_sku || '—' }}
          <span *ngIf="itemParaAsignar.placa_sena" style="display:block;margin-top:2px">Placa SENA: {{ itemParaAsignar.placa_sena }}</span>
        </div>

        <!-- Selector de modo -->
        <div style="display:flex;gap:8px;margin-bottom:1.25rem">
          <button pButton
            [label]="'Asignar a Ficha'"
            icon="pi pi-users"
            [class]="modoAsignacion === 'ficha' ? 'btn-guardar' : 'btn-cancelar'"
            style="flex:1;font-size:13px"
            (click)="modoAsignacion = 'ficha'">
          </button>
          <button pButton
            [label]="'Asignar a Bodega'"
            icon="pi pi-box"
            [class]="modoAsignacion === 'bodega' ? 'btn-guardar' : 'btn-cancelar'"
            style="flex:1;font-size:13px"
            (click)="modoAsignacion = 'bodega'">
          </button>
        </div>

        <!-- Modo Ficha -->
        <div *ngIf="modoAsignacion === 'ficha'" class="form-field">
          <label>Ficha de Formación <span style="color:red">*</span></label>
          <p-select
            [options]="fichasParaAsignar"
            [ngModel]="fichaSeleccionadaAsignar"
            (ngModelChange)="fichaSeleccionadaAsignar = $event"
            optionLabel="label"
            optionValue="value"
            placeholder="Buscar ficha por número o programa..."
            [filter]="true"
            filterPlaceholder="Escriba número o programa..."
            appendTo="body"
            style="width:100%">
          </p-select>
          <small *ngIf="fichasParaAsignar.length === 0"
            style="color:#94a3b8;font-size:12px;margin-top:4px;display:block">
            <i class="pi pi-spin pi-spinner mr-1"></i>Cargando fichas...
          </small>
          <small *ngIf="fichaSeleccionadaAsignar" style="color:#64748b;font-size:11px;margin-top:4px;display:block">
            Si no existe una asignación activa para este producto y ficha, se creará automáticamente.
          </small>
        </div>

        <!-- Modo Bodega/Ambiente -->
        <div *ngIf="modoAsignacion === 'bodega'" class="form-field">
          <label>Bodega / Ambiente / Laboratorio <span style="color:red">*</span></label>
          <p-select
            [options]="bodegasConLabel"
            [ngModel]="bodegaSeleccionadaAsignacion"
            (ngModelChange)="bodegaSeleccionadaAsignacion = $event"
            optionLabel="label"
            optionValue="value"
            placeholder="Buscar bodega, ambiente o laboratorio..."
            [filter]="true"
            filterPlaceholder="Escriba el nombre o código..."
            appendTo="body"
            style="width:100%">
          </p-select>
          <small style="color:#64748b;font-size:12px;margin-top:4px;display:block">
            El ítem quedará registrado en esa ubicación sin asignarse a ninguna ficha.
          </small>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayAsignarItemDialog=false"></button>
          <button *ngIf="modoAsignacion === 'ficha'" pButton label="Asignar a Ficha" icon="pi pi-users" class="btn-guardar"
            [disabled]="!fichaSeleccionadaAsignar" [loading]="asignandoItem"
            (click)="confirmarAsignarItem()"></button>
          <button *ngIf="modoAsignacion === 'bodega'" pButton label="Asignar a Bodega" icon="pi pi-box" class="btn-guardar"
            [disabled]="!bodegaSeleccionadaAsignacion" [loading]="asignandoABodega"
            (click)="confirmarAsignarABodega()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Trasladar Item a otro lugar (ambiente/laboratorio/otro) -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="🚚 Trasladar Ítem"
      [(visible)]="displayTrasladarItemDialog" [modal]="true"
      [style]="{width:'90vw',maxWidth:'460px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-container mt-2" *ngIf="itemParaTrasladar">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:1rem">
          Item #{{ itemParaTrasladar.id_item }} &nbsp;·&nbsp; SKU: {{ itemParaTrasladar.codigo_sku || '—' }}
          <span *ngIf="itemParaTrasladar.placa_sena" style="display:block;margin-top:2px">Placa SENA: {{ itemParaTrasladar.placa_sena }}</span>
        </div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;margin-bottom:1rem">
          <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase">Ubicación actual</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b;margin-top:2px">{{ ubicacionActualTraslado || 'Sin ubicación asignada' }}</div>
        </div>

        <div class="form-field">
          <label>Trasladar a <span style="color:red">*</span></label>
          <p-select
            [options]="destinosTrasladoOpciones"
            [ngModel]="sitioDestinoTraslado"
            (ngModelChange)="sitioDestinoTraslado = $event"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona el lugar de destino..."
            [filter]="true"
            appendTo="body"
            style="width:100%">
          </p-select>
          <small *ngIf="destinosTrasladoOpciones.length === 0" style="color:#ef4444;font-size:12px;margin-top:4px;display:block">
            No hay otros lugares disponibles. Crea más bodegas/ambientes/laboratorios desde <strong>Inventario › Bodegas</strong>.
          </small>
        </div>

        <div class="form-field">
          <label>Justificación</label>
          <textarea pTextarea [(ngModel)]="justificacionTraslado" rows="3"
            placeholder="Describe el motivo del traslado..."
            style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit">
          </textarea>
        </div>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px">
          <div style="display:flex;align-items:center;gap:8px">
            <i class="pi pi-info-circle" style="color:#3b82f6;font-size:14px"></i>
            <span style="font-size:12px;color:#1d4ed8">
              El responsable del lugar actual recibirá una notificación y debe aprobar el traslado antes de que el ítem cambie de ubicación.
            </span>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayTrasladarItemDialog=false"></button>
          <button pButton label="Solicitar Traslado" icon="pi pi-truck" class="btn-guardar"
            [disabled]="!sitioDestinoTraslado" [loading]="trasladandoItem"
            (click)="confirmarTrasladarItem()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Editar Item (SKU / Placa SENA) -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="✏️ Editar Ítem"
      [(visible)]="displayEditarItemDialog" [modal]="true"
      [style]="{width:'90vw',maxWidth:'420px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-container mt-2" *ngIf="itemEnEdicion">
        <div style="font-size:12px;color:#94a3b8;margin-bottom:1rem">
          Item #{{ itemEnEdicion.id_item }} &nbsp;·&nbsp; SKU: {{ itemEnEdicion.codigo_sku || '—' }}
          <span style="display:block;margin-top:2px">El código SKU es el del producto y no se puede editar por ítem.</span>
        </div>
        <div class="form-field">
          <label>Placa SENA</label>
          <input pInputText type="text" [(ngModel)]="editPlacaSena" placeholder="Ej: SENA-12345" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cancelar" class="btn-cancelar" (click)="displayEditarItemDialog=false"></button>
          <button pButton label="Guardar" class="btn-guardar" [loading]="guardandoItem" (click)="guardarEdicionItem()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Buscar por Placa SENA -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="🔎 Buscar Ítem por Placa SENA"
      [(visible)]="displayBuscarPlacaDialog" [modal]="true"
      [style]="{width:'90vw',maxWidth:'480px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200" appendTo="body">
      <div class="form-container mt-2">
        <div class="form-field">
          <label>Placa SENA</label>
          <div style="display:flex;gap:8px">
            <input pInputText type="text" [(ngModel)]="placaBuscada" placeholder="Ej: SENA-12345"
              style="flex:1" (keyup.enter)="buscarPorPlaca()" />
            <button pButton icon="pi pi-search" [loading]="buscandoPlaca" (click)="buscarPorPlaca()"></button>
          </div>
          <small style="color:#94a3b8;font-size:11px;margin-top:4px;display:block">
            <i class="pi pi-info-circle mr-1"></i>Ingresa la placa SENA completa y exacta, tal como está registrada (no se admiten búsquedas parciales).
          </small>
        </div>

        <div *ngIf="errorBusquedaPlaca" style="margin-top:1rem;padding:12px 16px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;color:#dc2626;font-size:13px">
          <i class="pi pi-exclamation-circle mr-1"></i>{{ errorBusquedaPlaca }}
        </div>

        <div *ngIf="resultadoBusquedaPlaca" style="margin-top:1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:15px;font-weight:800;color:#1e293b">
              {{ resultadoBusquedaPlaca.item.producto?.nombre ?? 'Producto #' + resultadoBusquedaPlaca.item.id_producto }}
            </span>
            <p-tag [value]="resultadoBusquedaPlaca.item.estado" [severity]="getItemSeverity(resultadoBusquedaPlaca.item.estado)"
              styleClass="px-3 py-1 font-bold rounded-lg"></p-tag>
          </div>
          <div class="detail-row"><span class="detail-label">Placa SENA:</span><span class="detail-value font-bold">{{ resultadoBusquedaPlaca.item.placa_sena }}</span></div>
          <div class="detail-row"><span class="detail-label">Código SKU del item:</span><span class="detail-value" style="font-family:monospace">{{ resultadoBusquedaPlaca.item.codigo_sku || '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">SKU del producto:</span><span class="detail-value">{{ resultadoBusquedaPlaca.item.producto?.SKU ?? '—' }}</span></div>
          <div class="detail-row"><span class="detail-label">Ubicación:</span><span class="detail-value">{{ getBodegaNombre(resultadoBusquedaPlaca.item.id_sitio ?? resultadoBusquedaPlaca.item.producto?.id_sitio) }}<span *ngIf="getBodegaTipoLabel(resultadoBusquedaPlaca.item.id_sitio ?? resultadoBusquedaPlaca.item.producto?.id_sitio)" class="text-slate-400"> ({{ getBodegaTipoLabel(resultadoBusquedaPlaca.item.id_sitio ?? resultadoBusquedaPlaca.item.producto?.id_sitio) }})</span></span></div>

          <!-- Estado físico: novedad activa o "Bueno" -->
          <div class="detail-row">
            <span class="detail-label">Estado físico:</span>
            <span class="detail-value font-bold" [style.color]="resultadoBusquedaPlaca.novedad_activa ? '#dc2626' : '#16a34a'">
              <ng-container *ngIf="!resultadoBusquedaPlaca.novedad_activa">
                <i class="pi pi-check-circle mr-1"></i>Bueno
              </ng-container>
              <ng-container *ngIf="resultadoBusquedaPlaca.novedad_activa">
                <i class="pi pi-exclamation-triangle mr-1"></i>{{ getNovedadTipoLabel(resultadoBusquedaPlaca.novedad_activa.tipo) }}: {{ resultadoBusquedaPlaca.novedad_activa.descripcion }}
              </ng-container>
            </span>
          </div>

          <!-- Préstamo / asignación activa -->
          <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #cbd5e1">
            <div class="detail-row">
              <span class="detail-label">¿Quién lo tiene?</span>
              <span class="detail-value font-bold">
                <ng-container *ngIf="resultadoBusquedaPlaca.item.estado !== 'PRESTADO'">No está prestado</ng-container>
                <ng-container *ngIf="resultadoBusquedaPlaca.item.estado === 'PRESTADO' && (resultadoBusquedaPlaca.prestamo_activo || resultadoBusquedaPlaca.asignacion_activa)">Prestado</ng-container>
                <ng-container *ngIf="resultadoBusquedaPlaca.item.estado === 'PRESTADO' && !resultadoBusquedaPlaca.prestamo_activo && !resultadoBusquedaPlaca.asignacion_activa">Prestado (sin registro detallado)</ng-container>
              </span>
            </div>

            <!-- Préstamo individual (módulo Préstamos) -->
            <ng-container *ngIf="resultadoBusquedaPlaca.prestamo_activo">
              <div class="detail-row"><span class="detail-label">Prestado a:</span><span class="detail-value">{{ resultadoBusquedaPlaca.prestamo_activo.usuario_solicitante?.nombre ?? '—' }}</span></div>
              <div class="detail-row"><span class="detail-label">Autorizó:</span><span class="detail-value">{{ resultadoBusquedaPlaca.prestamo_activo.usuario_responsable?.nombre ?? '—' }}</span></div>
              <div class="detail-row"><span class="detail-label">Fecha del préstamo:</span><span class="detail-value">{{ resultadoBusquedaPlaca.prestamo_activo.fecha_prestamo | date:'dd/MM/yyyy HH:mm' }}</span></div>
              <div class="detail-row"><span class="detail-label">Devolución esperada:</span><span class="detail-value">{{ resultadoBusquedaPlaca.prestamo_activo.fecha_devolucion_esperada | date:'dd/MM/yyyy' }}</span></div>
            </ng-container>

            <!-- Asignación a ficha (módulo Asignar) -->
            <ng-container *ngIf="!resultadoBusquedaPlaca.prestamo_activo && resultadoBusquedaPlaca.asignacion_activa">
              <div class="detail-row">
                <span class="detail-label">Ficha:</span>
                <span class="detail-value">
                  {{ resultadoBusquedaPlaca.asignacion_activa.ficha?.numero_ficha ?? '—' }}
                  <span *ngIf="resultadoBusquedaPlaca.asignacion_activa.ficha?.programa"> — {{ resultadoBusquedaPlaca.asignacion_activa.ficha.programa.nombre }}</span>
                </span>
              </div>
              <div class="detail-row"><span class="detail-label">Asignado por:</span><span class="detail-value">{{ resultadoBusquedaPlaca.asignacion_activa.usuario_asigna?.nombre ?? '—' }}</span></div>
              <div class="detail-row"><span class="detail-label">Fecha de asignación:</span><span class="detail-value">{{ resultadoBusquedaPlaca.asignacion_activa.fecha_asignacion | date:'dd/MM/yyyy HH:mm' }}</span></div>
            </ng-container>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button pButton label="Cerrar" class="btn-cancelar" (click)="displayBuscarPlacaDialog=false"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Dialog Registrar Novedad (desde item) -->
    <p-dialog maskStyleClass="transparent-mask" [dismissableMask]="true"
      header="⚠️ Registrar Novedad"
      [(visible)]="displayNovedadDialog" [modal]="true"
      [style]="{width:'480px'}"
      [draggable]="true" [resizable]="false"
      styleClass="form-dialog shadow-2xl border border-slate-200"
      appendTo="body">
      <div class="form-container mt-4" *ngIf="displayNovedadDialog && itemParaNovedad">

        <!-- Info del item (solo lectura) -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;margin-bottom:1.25rem">
          <div style="display:flex;align-items:center;gap:10px">
            <i class="pi pi-box" style="color:#64748b;font-size:18px"></i>
            <div>
              <div style="font-size:13px;font-weight:700;color:#1e293b">
                {{ productoSeleccionadoParaItems?.nombre ?? 'Producto' }}
              </div>
              <div style="font-size:11px;color:#94a3b8;font-family:monospace;margin-top:2px">
                SKU: {{ itemParaNovedad.codigo_sku }} &nbsp;·&nbsp; Item #{{ itemParaNovedad.id_item }}
              </div>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label>Tipo de novedad <span style="color:red">*</span></label>
          <p-select
            [options]="tiposNovedadOpciones"
            [(ngModel)]="nuevaNovedad.tipo"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar tipo..."
            [filter]="true" filterPlaceholder="Buscar tipo..."
            appendTo="body"
            style="width:100%">
          </p-select>
        </div>

        <div class="form-field">
          <label>Descripción <span style="color:red">*</span></label>
          <textarea pTextarea [(ngModel)]="nuevaNovedad.descripcion" rows="4"
            placeholder="Describe detalladamente la novedad encontrada..."
            style="width:100%;resize:vertical;border:2px solid #1e293b;border-radius:8px;padding:8px 10px;font-size:0.875rem;font-family:inherit">
          </textarea>
        </div>
      </div>
      <div class="dialog-footer">
        <button pButton label="Cancelar" class="btn-cancelar" (click)="displayNovedadDialog=false"></button>
        <button pButton label="Registrar" icon="pi pi-exclamation-circle" class="btn-guardar"
          [disabled]="!nuevaNovedad.tipo || !nuevaNovedad.descripcion?.trim()"
          (click)="guardarNovedad()">
        </button>
      </div>
    </p-dialog>

    <!-- ===== DIÁLOGO PLACAS SENA ===== -->
    <p-dialog
      [(visible)]="displayPlacasDialog" [modal]="true"
      [style]="{ width: '92vw', maxWidth: '480px' }"
      [draggable]="false" [resizable]="false" [closable]="false"
      [showHeader]="false" styleClass="placa-dialog" appendTo="body">

      <div style="border-radius:16px;overflow:hidden">

        <!-- Header con gradiente -->
        <div style="background:linear-gradient(135deg,#39A900 0%,#2d8000 100%);padding:1.5rem 1.75rem 1.25rem;position:relative">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:.75rem">
            <div style="width:36px;height:36px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center">
              <i class="pi pi-id-card" style="color:#fff;font-size:17px"></i>
            </div>
            <div>
              <div style="color:#fff;font-size:1rem;font-weight:600;line-height:1.1">Asignar Placas SENA</div>
              <div style="color:rgba(255,255,255,.75);font-size:11px;font-weight:400">Registro de identificación física</div>
            </div>
          </div>

          <!-- Barra de progreso -->
          <div style="background:rgba(255,255,255,.2);border-radius:999px;height:6px;overflow:hidden">
            <div [style.width]="((placaActualIndex + 1) / itemsParaPlaca.length * 100) + '%'"
              style="height:100%;background:#fff;border-radius:999px;transition:width .4s ease">
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px">
            <span style="color:rgba(255,255,255,.8);font-size:10px;font-weight:600">
              Ítem {{ placaActualIndex + 1 }} de {{ itemsParaPlaca.length }}
            </span>
            <div style="display:flex;gap:4px">
              <span *ngFor="let it of itemsParaPlaca; let i = index"
                [style.width]="'8px'" [style.height]="'8px'" [style.border-radius]="'50%'"
                [style.background]="i < placaActualIndex ? '#fff' : i === placaActualIndex ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.3)'"
                [style.transform]="i === placaActualIndex ? 'scale(1.3)' : 'scale(1)'"
                style="display:inline-block;transition:all .25s">
              </span>
            </div>
          </div>
        </div>

        <!-- Cuerpo -->
        <div style="padding:1.5rem 1.75rem;background:#fff">

          <!-- Card del ítem -->
          <div style="background:linear-gradient(135deg,#f0fdf4,#f8fafc);border:1.5px solid #bbf7d0;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:14px">
            <div style="width:42px;height:42px;background:#39A900;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              <i class="pi pi-box" style="color:#fff;font-size:18px"></i>
            </div>
            <div style="min-width:0">
              <div style="font-size:10px;color:#6b7280;font-weight:500;letter-spacing:.06em;text-transform:uppercase;margin-bottom:2px">Código SKU del ítem</div>
              <div style="font-size:1rem;font-weight:600;color:#111827;font-family:monospace;letter-spacing:.03em">
                {{ itemsParaPlaca[placaActualIndex]?.codigo_sku ?? '—' }}
              </div>
            </div>
          </div>

          <!-- Input placa -->
          <div style="margin-bottom:1.25rem">
            <label style="display:block;font-weight:500;color:#374151;font-size:13px;margin-bottom:.5rem">
              Placa SENA
              <span style="color:#ef4444;margin-left:2px">*</span>
              <span style="color:#94a3b8;font-weight:400;font-size:11px;margin-left:6px">identificación física del equipo</span>
            </label>
            <div style="position:relative">
              <i class="pi pi-tag" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#39A900;font-size:15px;z-index:1"></i>
              <input pInputText
                [(ngModel)]="placaActualValor"
                placeholder="Ej: SENA-2024-001"
                style="width:100%;padding-left:2.5rem;font-family:monospace;text-transform:uppercase;letter-spacing:.05em;font-size:.95rem;font-weight:400;border:1.5px solid #e2e8f0;border-radius:10px;transition:border-color .2s;box-sizing:border-box"
                (keydown.enter)="guardarPlacaYSiguiente()"
                [disabled]="guardandoPlaca"
                autofocus />
            </div>
            <div style="display:flex;align-items:center;gap:5px;margin-top:.5rem">
              <kbd style="background:#f1f5f9;border:1px solid #cbd5e1;border-bottom-width:2px;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:500;color:#475569">Enter</kbd>
              <span style="font-size:11px;color:#94a3b8">avanza al siguiente ítem automáticamente</span>
            </div>
          </div>

          <!-- Tip -->
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:.7rem 1rem;display:flex;gap:8px;align-items:flex-start">
            <i class="pi pi-lightbulb" style="color:#d97706;font-size:14px;margin-top:1px;flex-shrink:0"></i>
            <span style="font-size:11px;color:#92400e;line-height:1.5">
              Si el ítem <b>no tiene placa SENA</b> asignada aún, usa <b>Omitir</b> — podrás registrarla después desde la vista de ítems.
            </span>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:1rem 1.75rem 1.5rem;background:#f8fafc;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:.75rem">
          <button pButton label="Omitir" icon="pi pi-step-forward"
            style="background:#fff;color:#64748b;border:1.5px solid #e2e8f0;border-radius:9px;font-weight:400;padding:.55rem 1.1rem;font-size:13px"
            [disabled]="guardandoPlaca" (click)="omitirPlacaActual()">
          </button>
          <button pButton
            [label]="placaActualIndex < itemsParaPlaca.length - 1 ? 'Guardar y siguiente' : 'Finalizar'"
            [icon]="placaActualIndex < itemsParaPlaca.length - 1 ? 'pi pi-arrow-right' : 'pi pi-check-circle'"
            style="background:linear-gradient(135deg,#39A900,#2d8000);border:none;border-radius:9px;font-weight:500;padding:.55rem 1.3rem;font-size:13px;color:#fff"
            [loading]="guardandoPlaca"
            (click)="guardarPlacaYSiguiente()">
          </button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ProductosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sitioService = inject(SitioService);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private novedadService = inject(NovedadService);
  private asignacionService = inject(AsignacionService);
  private trasladoService = inject(TrasladoService);
  private fichaService = inject(FichaService);
  private apiService = inject(ApiService);
  private changesSub!: Subscription;
  skuEsAuto = true;
  private settingSkuAuto = false;

  esAdmin(): boolean {
    return this.authService.getUserRole()?.toUpperCase() === 'ADMINISTRADOR';
  }

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: Categoria[] = [];
  bodegas: any[] = [];
  filtro = '';
  displayDialog = false;
  esNuevo = true;
  selectedProducts: Producto[] = [];
  esGastronomia = false;
  codigoUnspscSeleccionado = false;

  displayAddCategoria = false;
  displayAddTipoMaterial = false;
  displayAddUnidadMedida = false;

  nuevoNombreCategoria = '';
  nuevoNombreTipoMaterial = '';
  nuevoNombreUnidadMedida = '';

  displayItemsDialog = false;
  itemsDelProducto: any[] = [];
  productoSeleccionadoParaItems: any = null;
  cargandoItems = false;

  displayAgregarItemDialog = false;
  nuevaPlacaItem = '';
  agregandoItem = false;

  displayEditarItemDialog = false;
  itemEnEdicion: any = null;

  displayPlacasDialog = false;
  itemsParaPlaca: any[] = [];
  placaActualIndex = 0;
  placaActualValor = '';
  guardandoPlaca = false;
  editPlacaSena = '';
  guardandoItem = false;

  displayAsignarItemDialog = false;
  itemParaAsignar: any = null;
  allFichas: any[] = [];
  fichasParaAsignar: { label: string; value: number }[] = [];
  fichaSeleccionadaAsignar: number | null = null;
  bodegasConLabel: { label: string; value: number }[] = [];
  modoAsignacion: 'ficha' | 'bodega' = 'ficha';
  bodegaSeleccionadaAsignacion: number | null = null;
  asignandoABodega = false;
  asignandoItem = false;

  displayTrasladarItemDialog = false;
  itemParaTrasladar: any = null;
  ubicacionActualTraslado = '';
  destinosTrasladoOpciones: { label: string; value: number }[] = [];
  sitioDestinoTraslado: number | null = null;
  justificacionTraslado = '';
  trasladandoItem = false;

  displayBuscarPlacaDialog = false;
  placaBuscada = '';
  buscandoPlaca = false;
  errorBusquedaPlaca: string | null = null;
  resultadoBusquedaPlaca: { item: any; prestamo_activo: any; asignacion_activa: any; novedad_activa: any } | null = null;

  displayNovedadDialog = false;
  itemParaNovedad: any = null;
  nuevaNovedad: { tipo: string; descripcion: string } = { tipo: '', descripcion: '' };
  readonly tiposNovedadOpciones = [
    { label: 'Daño', value: 'DAÑO' },
    { label: 'Pérdida', value: 'PERDIDA' },
    { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
    { label: 'Discrepancia', value: 'DISCREPANCIA' },
    { label: 'Otro', value: 'OTRO' },
  ];

  tiposMaterial: SelectOption[] = [
    { label: 'CONSUMO', value: 'CONSUMO' },
    { label: 'DEVOLUTIVO', value: 'DEVOLUTIVO' },
    { label: 'PERECEDERO', value: 'PERECEDERO' },
  ];

  readonly unidadesPeso: SelectOption[] = [
    { label: 'KILOGRAMO (kg)', value: 'KILOGRAMO' },
    { label: 'GRAMO (g)', value: 'GRAMO' },
    { label: 'LIBRA (lb)', value: 'LIBRA' },
  ];

  // Unidades base (fallback cuando no hay UNSPSC seleccionado)
  private readonly unidadesMedidaBase: SelectOption[] = [
    { label: 'UNIDAD', value: 'UNIDAD' },
    { label: 'PAR', value: 'PAR' },
    { label: 'KIT', value: 'KIT' },
    { label: 'JUEGO', value: 'JUEGO' },
    { label: 'METRO', value: 'METRO' },
    { label: 'LITRO', value: 'LITRO' },
    { label: 'MILILITRO', value: 'MILILITRO' },
    { label: 'KILOGRAMO', value: 'KILOGRAMO' },
    { label: 'GRAMO', value: 'GRAMO' },
    { label: 'LIBRA', value: 'LIBRA' },
    { label: 'BULTO', value: 'BULTO' },
    { label: 'PAQUETE', value: 'PAQUETE' },
    { label: 'CAJA', value: 'CAJA' },
    { label: 'LICENCIA', value: 'LICENCIA' },
  ];

  // Unidades mostradas en el dropdown (se actualiza según UNSPSC)
  unidadesDisponibles: SelectOption[] = [...this.unidadesMedidaBase];

  // Mapeo de FAMILIA UNSPSC (4 primeros dígitos) → unidades relevantes
  private readonly UNIDADES_POR_FAMILIA: Record<string, SelectOption[]> = {
    // Cereales y granos (arroz, harinas)
    '5010': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'BULTO', value: 'BULTO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'TONELADA', value: 'TONELADA' },
    ],
    // Aceites y grasas
    '5011': [
      { label: 'LITRO', value: 'LITRO' }, { label: 'MILILITRO', value: 'MILILITRO' },
      { label: 'BOTELLA', value: 'BOTELLA' }, { label: 'GALÓN', value: 'GALÓN' },
      { label: 'LATA', value: 'LATA' }, { label: 'KILOGRAMO', value: 'KILOGRAMO' },
    ],
    // Condimentos (azúcar, sal, vinagre)
    '5012': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'LITRO', value: 'LITRO' },
      { label: 'BOTELLA', value: 'BOTELLA' }, { label: 'PAQUETE', value: 'PAQUETE' },
      { label: 'BULTO', value: 'BULTO' },
    ],
    // Lácteos
    '5013': [
      { label: 'LITRO', value: 'LITRO' }, { label: 'MILILITRO', value: 'MILILITRO' },
      { label: 'BOTELLA', value: 'BOTELLA' }, { label: 'BOLSA', value: 'BOLSA' },
      { label: 'CAJA', value: 'CAJA' }, { label: 'KILOGRAMO', value: 'KILOGRAMO' },
      { label: 'GRAMO', value: 'GRAMO' }, { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Huevos
    '5014': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'CARTÓN', value: 'CARTÓN' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'CAJA', value: 'CAJA' },
    ],
    // Carnes (pollo, res, cerdo)
    '5015': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'UNIDAD', value: 'UNIDAD' },
      { label: 'PAQUETE', value: 'PAQUETE' },
    ],
    // Pescado
    '5017': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Mariscos
    '5018': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' },
    ],
    // Legumbres
    '5019': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'BULTO', value: 'BULTO' },
      { label: 'PAQUETE', value: 'PAQUETE' },
    ],
    // Verduras y tubérculos
    '5020': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'UNIDAD', value: 'UNIDAD' },
      { label: 'ATADO', value: 'ATADO' }, { label: 'PAQUETE', value: 'PAQUETE' },
      { label: 'BULTO', value: 'BULTO' },
    ],
    // Frutas
    '5021': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'LIBRA', value: 'LIBRA' }, { label: 'UNIDAD', value: 'UNIDAD' },
      { label: 'CAJA', value: 'CAJA' }, { label: 'PAQUETE', value: 'PAQUETE' },
    ],
    // Especias y hierbas
    '5022': [
      { label: 'GRAMO', value: 'GRAMO' }, { label: 'KILOGRAMO', value: 'KILOGRAMO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'FRASCO', value: 'FRASCO' },
      { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Café y té
    '5028': [
      { label: 'GRAMO', value: 'GRAMO' }, { label: 'KILOGRAMO', value: 'KILOGRAMO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'CAJA', value: 'CAJA' },
      { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Agua y bebidas
    '5029': [
      { label: 'LITRO', value: 'LITRO' }, { label: 'MILILITRO', value: 'MILILITRO' },
      { label: 'BOTELLA', value: 'BOTELLA' }, { label: 'GALÓN', value: 'GALÓN' },
      { label: 'CAJA', value: 'CAJA' },
    ],
    // Pastas, pan, cereales procesados
    '5030': [
      { label: 'KILOGRAMO', value: 'KILOGRAMO' }, { label: 'GRAMO', value: 'GRAMO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'UNIDAD', value: 'UNIDAD' },
      { label: 'CAJA', value: 'CAJA' },
    ],
    // Utensilios de cocina
    '5214': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'JUEGO', value: 'JUEGO' },
      { label: 'PAR', value: 'PAR' }, { label: 'KIT', value: 'KIT' },
      { label: 'SET', value: 'SET' },
    ],
    // Equipos industriales de cocina
    '4810': [{ label: 'UNIDAD', value: 'UNIDAD' }],
    // Refrigeración
    '2611': [{ label: 'UNIDAD', value: 'UNIDAD' }],
    // Productos de limpieza (detergentes, desinfectantes)
    '4713': [
      { label: 'LITRO', value: 'LITRO' }, { label: 'MILILITRO', value: 'MILILITRO' },
      { label: 'GALÓN', value: 'GALÓN' }, { label: 'KILOGRAMO', value: 'KILOGRAMO' },
      { label: 'GRAMO', value: 'GRAMO' }, { label: 'FRASCO', value: 'FRASCO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Herramientas de limpieza
    '4714': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'PAQUETE', value: 'PAQUETE' },
      { label: 'PAR', value: 'PAR' }, { label: 'JUEGO', value: 'JUEGO' },
    ],
    // Empaques (film, papel aluminio, bolsas)
    '2411': [
      { label: 'ROLLO', value: 'ROLLO' }, { label: 'METRO', value: 'METRO' },
      { label: 'PAQUETE', value: 'PAQUETE' }, { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // Desechables
    '2412': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'PAQUETE', value: 'PAQUETE' },
      { label: 'CAJA', value: 'CAJA' },
    ],
    // Recipientes herméticos
    '3120': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'PAQUETE', value: 'PAQUETE' },
      { label: 'JUEGO', value: 'JUEGO' },
    ],
    // TIC — Hardware (computadores, impresoras, periféricos)
    '4321': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'KIT', value: 'KIT' },
    ],
    // TIC — Software / redes / comunicaciones
    '4322': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'LICENCIA', value: 'LICENCIA' },
      { label: 'KIT', value: 'KIT' },
    ],
    // TIC — Cableado
    '4323': [
      { label: 'METRO', value: 'METRO' }, { label: 'ROLLO', value: 'ROLLO' },
      { label: 'UNIDAD', value: 'UNIDAD' },
    ],
    // TIC — Almacenamiento (disco duro, memoria)
    '4319': [{ label: 'UNIDAD', value: 'UNIDAD' }],
    // TIC — Displays, proyectores, accesorios AV
    '4320': [
      { label: 'UNIDAD', value: 'UNIDAD' }, { label: 'KIT', value: 'KIT' },
    ],
  };

  // Códigos UNSPSC — Colombia Compra Eficiente (SECOP II) — SENA Gastronomía + TIC
  codigosUnspsc: SelectOption[] = [
    // ── ALIMENTOS Y BEBIDAS — Segmento 50 ──────────────────────
    { label: '50101501 - Arroz', value: '50101501' },
    { label: '50101701 - Harina de trigo', value: '50101701' },
    { label: '50101702 - Harina de maíz', value: '50101702' },
    { label: '50111501 - Aceite vegetal comestible', value: '50111501' },
    { label: '50111601 - Mantequilla', value: '50111601' },
    { label: '50111602 - Margarina', value: '50111602' },
    { label: '50121501 - Azúcar refinada', value: '50121501' },
    { label: '50121901 - Sal de mesa', value: '50121901' },
    { label: '50122001 - Vinagre', value: '50122001' },
    { label: '50131501 - Leche entera pasteurizada', value: '50131501' },
    { label: '50131502 - Leche descremada', value: '50131502' },
    { label: '50131601 - Crema de leche', value: '50131601' },
    { label: '50131701 - Queso fresco', value: '50131701' },
    { label: '50141501 - Huevos de gallina', value: '50141501' },
    { label: '50151501 - Pollo entero fresco', value: '50151501' },
    { label: '50151502 - Carne de res fresca', value: '50151502' },
    { label: '50151601 - Cerdo fresco', value: '50151601' },
    { label: '50171501 - Pescado fresco', value: '50171501' },
    { label: '50181501 - Camarón fresco', value: '50181501' },
    { label: '50191501 - Legumbres secas (lentejas, frijoles, garbanzos)', value: '50191501' },
    { label: '50201501 - Papas frescas', value: '50201501' },
    { label: '50201502 - Cebollas frescas', value: '50201502' },
    { label: '50201503 - Tomates frescos', value: '50201503' },
    { label: '50201701 - Zanahorias frescas', value: '50201701' },
    { label: '50211501 - Manzanas frescas', value: '50211501' },
    { label: '50211502 - Plátanos frescos', value: '50211502' },
    { label: '50221501 - Especias y condimentos', value: '50221501' },
    { label: '50221502 - Hierbas aromáticas secas', value: '50221502' },
    { label: '50281501 - Café molido', value: '50281501' },
    { label: '50281701 - Té en bolsas', value: '50281701' },
    { label: '50291501 - Agua embotellada', value: '50291501' },
    { label: '50301701 - Pasta alimentaria', value: '50301701' },
    { label: '50301801 - Pan industrial', value: '50301801' },
    // ── UTENSILIOS DE COCINA — Segmento 52 ────────────────────
    { label: '52141501 - Ollas de acero inoxidable', value: '52141501' },
    { label: '52141502 - Sartenes de acero inoxidable', value: '52141502' },
    { label: '52141601 - Tablas de cortar plásticas', value: '52141601' },
    { label: '52141701 - Cuchillos de cocina profesional', value: '52141701' },
    { label: '52141702 - Juego de cuchillos de chef', value: '52141702' },
    { label: '52141801 - Cucharones y espumaderas', value: '52141801' },
    { label: '52141901 - Bowls de acero inoxidable', value: '52141901' },
    { label: '52142001 - Bandejas de hornear', value: '52142001' },
    { label: '52142101 - Coladeras y coladores', value: '52142101' },
    { label: '52142201 - Peladores de verduras', value: '52142201' },
    { label: '52142301 - Batidores de alambre (globo)', value: '52142301' },
    { label: '52142401 - Termómetros de cocina', value: '52142401' },
    // ── EQUIPOS MAYORES — Segmentos 48 / 26 ───────────────────
    { label: '48101701 - Licuadora industrial', value: '48101701' },
    { label: '48101702 - Batidora de pedestal industrial', value: '48101702' },
    { label: '48101801 - Horno de convección', value: '48101801' },
    { label: '48102001 - Freidora industrial', value: '48102001' },
    { label: '48102101 - Plancha de cocina industrial', value: '48102101' },
    { label: '26111701 - Baterías recargables', value: '26111701' },
    { label: '26111702 - Pilas alcalinas', value: '26111702' },
    { label: '48102301 - Estufa industrial a gas', value: '48102301' },
    // ── ASEO Y LIMPIEZA — Segmento 47 ─────────────────────────
    { label: '47131501 - Detergente desengrasante para cocina', value: '47131501' },
    { label: '47131502 - Desinfectante multiusos para superficies', value: '47131502' },
    { label: '47131601 - Jabón antibacterial líquido', value: '47131601' },
    { label: '47131701 - Blanqueador / hipoclorito de sodio', value: '47131701' },
    { label: '47141501 - Esponjas y estropajos', value: '47141501' },
    { label: '47141601 - Guantes de caucho para limpieza', value: '47141601' },
    { label: '47141701 - Traperos y mochos', value: '47141701' },
    { label: '47141702 - Escobas y cepillos', value: '47141702' },
    // ── EMPAQUES ALIMENTARIOS — Segmentos 24 / 31 ─────────────
    { label: '24111501 - Bolsas plásticas para alimentos', value: '24111501' },
    { label: '24111601 - Film plástico / vinipel', value: '24111601' },
    { label: '24111701 - Papel aluminio para cocina', value: '24111701' },
    { label: '24111801 - Papel encerado para alimentos', value: '24111801' },
    { label: '31201501 - Recipientes herméticos plásticos', value: '31201501' },
    { label: '24121501 - Contenedores desechables de icopor', value: '24121501' },
    { label: '24121601 - Vasos desechables de plástico', value: '24121601' },
    { label: '24121701 - Cubiertos desechables', value: '24121701' },
    // ── TIC / TECNOLOGÍA — Segmento 43 ────────────────────────
    { label: '43211501 - Computador de escritorio (PC)', value: '43211501' },
    { label: '43211503 - Computador portátil / laptop', value: '43211503' },
    { label: '43211507 - Servidor de red', value: '43211507' },
    { label: '43211604 - Teclado USB', value: '43211604' },
    { label: '43211605 - Mouse / ratón óptico', value: '43211605' },
    { label: '43211901 - Memoria USB / pendrive', value: '43211901' },
    { label: '43211702 - Impresora de inyección de tinta', value: '43211702' },
    { label: '43211701 - Equipo de lectura de código de barras', value: '43211701' },
    { label: '43212105 - Tableta electrónica (tablet)', value: '43212105' },
    { label: '43201401 - Proyector multimedia / video beam', value: '43201401' },
    { label: '43201405 - Pantalla interactiva / smartboard', value: '43201405' },
    { label: '43201601 - Monitor de computador', value: '43201601' },
    { label: '43202201 - Cámara web / webcam', value: '43202201' },
    { label: '43201801 - Audífonos con micrófono (headset)', value: '43201801' },
    { label: '43191501 - Disco duro externo', value: '43191501' },
    { label: '43191602 - Tarjeta de memoria SD', value: '43191602' },
    { label: '43221501 - Software de sistema operativo', value: '43221501' },
    { label: '43221502 - Software de ofimática (Office)', value: '43221502' },
    { label: '43221701 - Software antivirus / seguridad', value: '43221701' },
    { label: '43222601 - Router / enrutador de red', value: '43222601' },
    { label: '43222602 - Switch de red', value: '43222602' },
    { label: '43222603 - Punto de acceso inalámbrico (WiFi)', value: '43222603' },
    { label: '43222501 - UPS / sistema de alimentación ininterrumpida', value: '43222501' },
    { label: '43231501 - Cable de red UTP', value: '43231501' },
    // ── ELECTRÓNICA, HERRAMIENTAS Y EDUCACIÓN ─────────────────
    { label: '11121502 - Resina', value: '11121502' },
    { label: '23261507 - Máquina impresora tridimensional', value: '23261507' },
    { label: '23271712 - Kit de soldadura o soldadura débil', value: '23271712' },
    { label: '23271803 - Desoldador de trenza', value: '23271803' },
    { label: '23271806 - Cautín', value: '23271806' },
    { label: '26111704 - Cargadores de baterías', value: '26111704' },
    { label: '26111706 - Pilas electrónicas', value: '26111706' },
    { label: '26121609 - Cable de redes', value: '26121609' },
    { label: '27111728 - Juego de destornilladores', value: '27111728' },
    { label: '32101622 - Memoria flash', value: '32101622' },
    { label: '32101628 - Microcontroladores', value: '32101628' },
    { label: '32101652 - Circuito integrado lógico estándar', value: '32101652' },
    { label: '32111503 - Diodos emisores de luz (LED)', value: '32111503' },
    { label: '39112503 - Luces móviles', value: '39112503' },
    { label: '39121011 - Fuentes ininterrumpibles de potencia', value: '39121011' },
    { label: '39121440 - Cable de extensión eléctrica', value: '39121440' },
    { label: '39121621 - Accesorios y aparatos de protección contra rayos', value: '39121621' },
    { label: '39122303 - Relé multicontacto', value: '39122303' },
    { label: '41113630 - Multímetros', value: '41113630' },
    { label: '41113665 - Probador de resistencia de contacto', value: '41113665' },
    { label: '43201414 - Protector de disco duro', value: '43201414' },
    { label: '43201531 - Tarjetas de captura de video', value: '43201531' },
    { label: '43212104 - Impresoras de inyección de tinta', value: '43212104' },
    { label: '43221706 - Antenas de radio', value: '43221706' },
    { label: '43222609 - Enrutadores (routers) de red', value: '43222609' },
    { label: '43223303 - Cable de conexión de comunicación de datos', value: '43223303' },
    { label: '44103103 - Tóner para impresoras o fax', value: '44103103' },
    { label: '44111914 - Tabla de soporte para escribir', value: '44111914' },
    { label: '44121634 - Rollos adhesivos', value: '44121634' },
    { label: '47131813 - Limpiador de pantallas', value: '47131813' },
    { label: '52161551 - Micrófono inalámbrico y sistema de amplificación de instrumentos', value: '52161551' },
    { label: '60101318 - Tarjetas didácticas electrónicas', value: '60101318' },
    { label: '60104912 - Alambres o cables eléctricos', value: '60104912' },
    { label: '60106104 - Materiales didácticos de electricidad o electrónica', value: '60106104' },
    { label: '60106402 - Suministros para la enseñanza de electrónica', value: '60106402' },
    { label: '86141701 - Laboratorios de idiomas', value: '86141701' },
    { label: '86141702 - Tecnología audiovisual', value: '86141702' },
  ];

  productoForm: FormGroup = this.fb.group({
    id_producto: [null],
    nombre: ['', Validators.required],
    descripcion: [''],
    codigo_unspsc: [null],
    SKU: [''],
    tipo_material: ['CONSUMO', Validators.required],
    unidad_medida: ['UNIDAD', Validators.required],
    es_psd: [false],
    fecha_vencimiento: [''],
    id_categoria: [null, Validators.required],
    id_sitio: [null, Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    stock_minimo: [1, [Validators.required, Validators.min(1)]],
    unidad_peso_bulto: [null],
    peso_por_bulto: [null],
  });

  private readonly UNIDADES_PESO_VOL = new Set([
    'KILOGRAMO', 'GRAMO', 'LIBRA', 'TONELADA',
    'LITRO', 'MILILITRO', 'GALÓN', 'BOTELLA',
  ]);

  get unidadActual(): string {
    return this.productoForm.get('unidad_medida')?.value || '';
  }

  get esMedidaPesoVol(): boolean {
    return this.UNIDADES_PESO_VOL.has(this.unidadActual) && !this.esBulto;
  }

  get esPerecedero(): boolean {
    return this.productoForm.get('tipo_material')?.value === 'PERECEDERO';
  }

  get esBulto(): boolean {
    const u = this.productoForm.get('unidad_medida')?.value;
    return u === 'BULTO' || u === 'PAQUETE';
  }

  get labelPresentacion(): string {
    return this.productoForm.get('unidad_medida')?.value === 'PAQUETE' ? 'paquete' : 'bulto';
  }

  get mostrarPesoPorBulto(): boolean {
    return this.esBulto && !!this.productoForm.get('unidad_peso_bulto')?.value;
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get fechaInvalida(): boolean {
    if (!this.esPerecedero) return false;
    const fecha = this.productoForm.get('fecha_vencimiento')?.value;
    if (!fecha) return false;
    return fecha < this.minDate;
  }

  get hasSelectedProducts(): boolean {
    return this.selectedProducts && this.selectedProducts.length > 0;
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarCategorias();
    this.cargarBodegas();
    this.cargarFichas();
    this.changesSub = this.apiService.changes.subscribe(() => this.cargarDatos());

    // Auto-generar SKU mientras el usuario escribe el nombre (solo productos nuevos)
    this.productoForm.get('nombre')!.valueChanges.subscribe((nombre: string) => {
      if (!this.skuEsAuto) return;
      const sku = this.generarSku(nombre || '');
      this.settingSkuAuto = true;
      this.productoForm.patchValue({ SKU: sku }, { emitEvent: false });
      this.settingSkuAuto = false;
    });

    // Detectar edición manual del SKU: si el usuario borra el campo vuelve al auto-fill
    this.productoForm.get('SKU')!.valueChanges.subscribe((val: string) => {
      if (this.settingSkuAuto) return;
      if (!val || !val.trim()) {
        // Campo vacío → volver al auto-fill con el nombre actual
        this.skuEsAuto = true;
        const nombre = this.productoForm.get('nombre')?.value || '';
        const sku = this.generarSku(nombre);
        this.settingSkuAuto = true;
        this.productoForm.patchValue({ SKU: sku }, { emitEvent: false });
        this.settingSkuAuto = false;
      } else {
        this.skuEsAuto = false;
      }
    });
  }

  ngOnDestroy() {
    this.changesSub.unsubscribe();
  }

  private readonly TIPOS_LUGAR_VALIDOS = ['BODEGA', 'AMBIENTE', 'LABORATORIO', 'OTRO'];
  private readonly TIPOS_LUGAR_LABELS: Record<string, string> = {
    BODEGA: 'Bodega', AMBIENTE: 'Ambiente', LABORATORIO: 'Laboratorio', OTRO: 'Otro',
  };

  cargarBodegas() {
    this.sitioService.getSitios().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        this.bodegas = all.filter(s => this.TIPOS_LUGAR_VALIDOS.includes(s.tipo));
        const orden: Record<string, number> = { BODEGA: 0, AMBIENTE: 1, LABORATORIO: 2, OTRO: 3 };
        const sorted = [...this.bodegas].sort((a, b) => (orden[a.tipo] ?? 9) - (orden[b.tipo] ?? 9));
        this.bodegasConLabel = sorted.map(s => ({
          label: `${s.nombre}${s.codigo_lugar ? '  ·  ' + s.codigo_lugar : ''}  [${this.TIPOS_LUGAR_LABELS[s.tipo] ?? s.tipo}]`,
          value: s.id_sitio,
        }));
        this.cdr.markForCheck();
      },
      error: () => { this.bodegas = []; this.bodegasConLabel = []; },
    });
  }

  cargarFichas() {
    this.fichaService.getFichas().subscribe({
      next: (res: any) => {
        this.allFichas = res?.data ?? res ?? [];
        this.fichasParaAsignar = this.allFichas.map((f: any) => {
          const num = f.numero_ficha ? `Ficha ${f.numero_ficha}` : `Ficha #${f.id_ficha}`;
          const prog = f.programa?.nombre ? ` — ${f.programa.nombre}` : '';
          return { label: `${num}${prog}`, value: f.id_ficha };
        });
        this.cdr.markForCheck();
      },
      error: () => { this.allFichas = []; this.fichasParaAsignar = []; },
    });
  }

  getBodegaNombre(id_sitio: number | null | undefined): string {
    if (!id_sitio) return '—';
    const b = this.bodegas.find(b => b.id_sitio === id_sitio);
    return b ? b.nombre : '—';
  }

  getBodegaTipoLabel(id_sitio: number | null | undefined): string {
    if (!id_sitio) return '';
    const b = this.bodegas.find(b => b.id_sitio === id_sitio);
    if (!b) return '';
    const tipo = b.tipo === 'OTRO' ? (b.tipo_personalizado || 'Otro') : (this.TIPOS_LUGAR_LABELS[b.tipo] || b.tipo || '');
    return b.codigo_lugar ? `${tipo} · ${b.codigo_lugar}` : tipo;
  }

  cargarDatos() {
    this.productoService.getProductos().subscribe({
      next: (res: any) => {
        const prods = res?.data || res || [];
        this.productoService.getAllItems().subscribe({
          next: (itemsRes: any) => {
            const items = itemsRes?.data || itemsRes || [];
            this.productos = prods.map((p: any) => {
              const productItems = items.filter((item: any) => item.id_producto === p.id_producto);
              const disponibles = productItems.filter((item: any) => item.estado === 'DISPONIBLE').length;
              return { ...p, itemsDisponibles: disponibles, totalItems: productItems.length };
            });
            this.productosFiltrados = this.productos;
            this.cdr.markForCheck();
          },
          error: () => {
            this.productos = prods.map((p: any) => ({ ...p, itemsDisponibles: 0, totalItems: 0 }));
            this.productosFiltrados = this.productos;
            this.cdr.markForCheck();
          }
        });
      },
      error: () => {
        this.productos = [];
        this.productosFiltrados = [];
        this.cdr.markForCheck();
      },
    });
  }

  cargarCategorias() {
    this.categoriaService.getCategorias().subscribe({
      next: (res: any) => {
        this.categorias = res?.data || res || [];
        this.cdr.markForCheck();
      },
      error: () => { this.categorias = []; },
    });
  }

  onUnspscChange(value: string | null) {
    if (!value) {
      this.unidadesDisponibles = [...this.unidadesMedidaBase];
      this.esGastronomia = false;
      this.codigoUnspscSeleccionado = false;
      this.actualizarValidadoresSKU();
      return;
    }
    const familia = value.substring(0, 4);
    const unidades = this.UNIDADES_POR_FAMILIA[familia];
    if (unidades) {
      this.unidadesDisponibles = unidades;
      this.codigoUnspscSeleccionado = true;
      // Reset unidad_medida al primer valor disponible
      this.productoForm.patchValue({ unidad_medida: unidades[0].value });
    } else {
      this.unidadesDisponibles = [...this.unidadesMedidaBase];
      this.codigoUnspscSeleccionado = false;
    }
    // Gastronomía = segmento 50 (alimentos)
    this.esGastronomia = value.startsWith('50');
    this.actualizarValidadoresSKU();
  }

  private actualizarValidadoresSKU() {
    const skuControl = this.productoForm.get('SKU');
    // SKU siempre opcional — se auto-genera del nombre para no gastronomía
    if (this.esGastronomia) {
      skuControl?.clearValidators();
      skuControl?.setValue(null);
    } else {
      skuControl?.clearValidators();
    }
    skuControl?.updateValueAndValidity();
  }

  onTipoMaterialChange(value: string) {
    if (value !== 'PERECEDERO') {
      this.productoForm.patchValue({ es_psd: false, fecha_vencimiento: '' });
    } else {
      this.productoForm.patchValue({ es_psd: true });
    }
  }

  onUnidadMedidaChange(value: string) {
    if (value !== 'BULTO' && value !== 'PAQUETE') {
      this.productoForm.patchValue({ unidad_peso_bulto: null, peso_por_bulto: null });
    }
  }

  filtrar() {
    const f = this.filtro.toLowerCase();
    this.productosFiltrados = this.productos.filter(p =>
      p.nombre?.toLowerCase().includes(f) ||
      p.SKU?.toLowerCase().includes(f)
    );
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  private generarSku(nombre: string): string {
    const clean = nombre.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const prefix = clean.substring(0, 3);
    if (!prefix) return '';
    const nums = (this.productos || [])
      .map((p: any) => {
        const sku: string = (p.SKU || '').toUpperCase();
        if (!sku.startsWith(prefix + '-')) return NaN;
        return parseInt(sku.split('-').pop() ?? '', 10);
      })
      .filter((n: number) => !isNaN(n) && n > 0);
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}-${next}`;
  }

  openNew() {
    this.esNuevo = true;
    this.skuEsAuto = true;
    this.settingSkuAuto = false;
    this.esGastronomia = false;
    this.codigoUnspscSeleccionado = false;
    this.unidadesDisponibles = [...this.unidadesMedidaBase];
    this.productoForm.get('cantidad')?.enable();
    this.productoForm.reset({
      id_producto: null, nombre: '', descripcion: '', codigo_unspsc: null,
      SKU: '', tipo_material: 'CONSUMO', unidad_medida: 'UNIDAD',
      es_psd: false, fecha_vencimiento: '', id_categoria: null, id_sitio: null,
      cantidad: 1, stock_minimo: 1, unidad_peso_bulto: null, peso_por_bulto: null,
    });
    this.displayDialog = true;
  }

  editar(producto: Producto) {
    this.esNuevo = false;
    this.skuEsAuto = false;
    this.productoForm.get('cantidad')?.disable();
    const id_categoria = producto.id_categoria ?? producto.categoria?.id_categoria ?? null;

    // Actualizar unidades y gastronomía según UNSPSC existente
    if (producto.codigo_unspsc) {
      const familia = producto.codigo_unspsc.substring(0, 4);
      this.unidadesDisponibles = this.UNIDADES_POR_FAMILIA[familia] || [...this.unidadesMedidaBase];
      this.esGastronomia = producto.codigo_unspsc.startsWith('50');
      this.codigoUnspscSeleccionado = true;
    } else {
      this.unidadesDisponibles = [...this.unidadesMedidaBase];
      this.esGastronomia = false;
      this.codigoUnspscSeleccionado = false;
    }
    this.actualizarValidadoresSKU();

    this.productoForm.patchValue({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      codigo_unspsc: producto.codigo_unspsc || null,
      SKU: producto.SKU || '',
      tipo_material: producto.tipo_material,
      unidad_medida: producto.unidad_medida,
      es_psd: producto.es_psd,
      fecha_vencimiento: producto.fecha_vencimiento || '',
      id_categoria,
      id_sitio: producto.id_sitio || null,
      stock_minimo: producto.stock_minimo || 1,
      unidad_peso_bulto: (producto as any).unidad_peso_bulto || null,
      peso_por_bulto: (producto as any).peso_por_bulto || null,
    });
    this.displayDialog = true;
  }

  abrirDialogoPlacas(items: any[]) {
    this.itemsParaPlaca = items;
    this.placaActualIndex = 0;
    this.placaActualValor = '';
    this.displayPlacasDialog = true;
    this.cdr.markForCheck();
  }

  guardarPlacaYSiguiente() {
    if (!this.placaActualValor.trim()) {
      this.notification.add({ module: 'Productos', severity: 'warn', summary: 'Placa requerida', detail: 'Ingresa la placa SENA antes de continuar. Si el ítem no tiene placa, usa "Omitir".' });
      return;
    }
    const item = this.itemsParaPlaca[this.placaActualIndex];
    this.guardandoPlaca = true;
    this.cdr.markForCheck();
    this.productoService.actualizarItem(item.id_item, { placa_sena: this.placaActualValor.trim().toUpperCase() }).subscribe({
      next: () => {
        this.guardandoPlaca = false;
        if (this.placaActualIndex < this.itemsParaPlaca.length - 1) {
          this.placaActualIndex++;
          this.placaActualValor = '';
        } else {
          this.displayPlacasDialog = false;
          this.notification.add({ module: 'Productos', severity: 'success', summary: '¡Listo!', detail: 'Todas las placas SENA fueron asignadas correctamente.' });
          this.cargarDatos();
        }
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.guardandoPlaca = false;
        this.cdr.markForCheck();
        const backendMsg = err?.error?.message;
        const detail = backendMsg?.toLowerCase().includes('uso')
          ? `La placa "${this.placaActualValor.trim().toUpperCase()}" ya está registrada en otro ítem. Ingresa una placa diferente.`
          : (backendMsg || 'No se pudo guardar la placa SENA. Intenta de nuevo.');
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Placa duplicada', detail });
      },
    });
  }

  omitirPlacaActual() {
    this.notification.add({ module: 'Productos', severity: 'warn', summary: 'Sin placa SENA', detail: `El ítem ${this.placaActualIndex + 1} quedará sin placa asignada. Puedes asignarla después desde la vista de ítems.` });
    if (this.placaActualIndex < this.itemsParaPlaca.length - 1) {
      this.placaActualIndex++;
      this.placaActualValor = '';
    } else {
      this.displayPlacasDialog = false;
      this.cargarDatos();
    }
    this.cdr.markForCheck();
  }

  guardar() {
    if (this.productoForm.invalid || this.fechaInvalida) {
      this.notification.add({ module: 'Productos', severity: 'warn', summary: 'Advertencia', detail: 'Complete los campos requeridos correctamente' });
      return;
    }

    const formValue = this.productoForm.getRawValue();
    const esPerecedero = formValue.tipo_material === 'PERECEDERO';
    const esBultoVal = formValue.unidad_medida === 'BULTO' || formValue.unidad_medida === 'PAQUETE';

    const productoData: any = {
      nombre: formValue.nombre,
      tipo_material: formValue.tipo_material,
      unidad_medida: formValue.unidad_medida,
      es_psd: esPerecedero,
      id_categoria: Number(formValue.id_categoria),
      id_sitio: Number(formValue.id_sitio),
      stock_minimo: Number(formValue.stock_minimo),
    };

    // Opcionales — solo se incluyen si tienen valor real
    if (formValue.descripcion) productoData.descripcion = formValue.descripcion;
    if (formValue.codigo_unspsc) productoData.codigo_unspsc = String(formValue.codigo_unspsc);
    if (formValue.SKU) productoData.SKU = formValue.SKU;
    if (esPerecedero && formValue.fecha_vencimiento) productoData.fecha_vencimiento = formValue.fecha_vencimiento;
    if (esBultoVal && formValue.unidad_peso_bulto) productoData.unidad_peso_bulto = formValue.unidad_peso_bulto;
    if (esBultoVal && formValue.peso_por_bulto) productoData.peso_por_bulto = Number(formValue.peso_por_bulto);
    if (this.esNuevo) productoData.cantidad = Number(formValue.cantidad);

    console.log('[Guardar] Payload enviado:', productoData);

    if (this.esNuevo) {
      this.productoService.crearProducto(productoData).subscribe({
        next: (res: any) => {
          const itemsGenerados = res?.data?.items_generados ?? res?.items_generados ?? [];
          this.displayDialog = false;
          if (itemsGenerados.length > 0 && !this.esGastronomia) {
            this.notification.add({ module: 'Productos', severity: 'success', summary: 'Producto creado', detail: `${itemsGenerados.length} ítem(s) generado(s). Ahora registra las placas SENA.` });
            this.abrirDialogoPlacas(itemsGenerados);
          } else {
            this.notification.add({ module: 'Productos', severity: 'success', summary: 'Producto creado', detail: itemsGenerados.length > 0
              ? `${itemsGenerados.length} ítem(s) generado(s). Los productos de gastronomía no requieren placa SENA — si deseas, puedes asignarla después desde la vista de ítems.`
              : 'Producto creado correctamente.' });
            this.cargarDatos();
          }
        },
        error: (err) => {
          const backendMsg = err?.error?.message;
          const detail = Array.isArray(backendMsg)
            ? backendMsg.join(' | ')
            : (backendMsg || err?.message || 'Error desconocido');
          console.error('[Guardar] Error backend:', err?.error);
          this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error al crear', detail });
        },
      });
    } else {
      this.productoService.actualizarProducto(formValue.id_producto, productoData).subscribe({
        next: () => {
          this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente' });
          this.displayDialog = false;
          this.cargarDatos();
        },
        error: (err) => {
          const backendMsg = err?.error?.message;
          const detail = Array.isArray(backendMsg)
            ? backendMsg.join(' | ')
            : (backendMsg || err?.message || 'Error desconocido');
          console.error('[Guardar] Error backend:', err?.error);
          this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error al actualizar', detail });
        },
      });
    }
  }

  guardarNuevaCategoria() {
    const nombre = this.nuevoNombreCategoria.trim();
    if (!nombre) return;
    this.categoriaService.crearCategoria({ nombreCat: nombre }).subscribe({
      next: (res: any) => {
        const newCat = res?.data || res;
        this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Categoría agregada' });
        this.categoriaService.getCategorias().subscribe({
          next: (catRes: any) => {
            this.categorias = catRes?.data || catRes || [];
            const found = this.categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase() || c.id_categoria === newCat?.id_categoria);
            if (found) this.productoForm.patchValue({ id_categoria: found.id_categoria });
            else if (newCat?.id_categoria) this.productoForm.patchValue({ id_categoria: newCat.id_categoria });
            this.displayAddCategoria = false;
            this.nuevoNombreCategoria = '';
            this.cdr.markForCheck();
          },
          error: () => { this.displayAddCategoria = false; this.nuevoNombreCategoria = ''; }
        });
      },
      error: () => { this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudo crear la categoría' }); }
    });
  }

  guardarNuevoTipoMaterial() {
    const val = this.nuevoNombreTipoMaterial.trim().toUpperCase();
    if (!val) return;
    if (!this.tiposMaterial.some(t => t.value === val)) {
      this.tiposMaterial = [...this.tiposMaterial, { label: val, value: val }];
    }
    this.productoForm.patchValue({ tipo_material: val });
    this.displayAddTipoMaterial = false;
    this.nuevoNombreTipoMaterial = '';
    this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Tipo agregado' });
  }

  guardarNuevaUnidadMedida() {
    const val = this.nuevoNombreUnidadMedida.trim().toUpperCase();
    if (!val) return;
    if (!this.unidadesDisponibles.some(u => u.value === val)) {
      this.unidadesDisponibles = [...this.unidadesDisponibles, { label: val, value: val }];
    }
    this.productoForm.patchValue({ unidad_medida: val });
    this.displayAddUnidadMedida = false;
    this.nuevoNombreUnidadMedida = '';
    this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Unidad agregada' });
  }

  eliminar(producto: Producto) {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar "' + producto.nombre + '"?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.productoService.eliminarProducto(producto.id_producto).subscribe({
          next: () => {
            this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Producto eliminado' });
            this.cargarDatos();
          },
          error: () => { this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }); }
        });
      },
    });
  }

  verItems(producto: Producto) {
    this.productoSeleccionadoParaItems = producto;
    this.displayItemsDialog = true;
    this.cargandoItems = true;
    this.itemsDelProducto = [];
    this.productoService.getItemsByProducto(producto.id_producto).subscribe({
      next: (res: any) => {
        this.itemsDelProducto = res?.data || res || [];
        this.cargandoItems = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los items' });
        this.cargandoItems = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirAgregarItem() {
    this.nuevaPlacaItem = '';
    this.displayAgregarItemDialog = true;
  }

  agregarItemAlLote() {
    if (!this.productoSeleccionadoParaItems) return;
    this.agregandoItem = true;
    const placa = this.nuevaPlacaItem.trim() || undefined;
    this.productoService.agregarItemAProducto(this.productoSeleccionadoParaItems.id_producto, placa).subscribe({
      next: () => {
        this.notification.info(
          `📦 Material nuevo registrado en "${this.productoSeleccionadoParaItems.nombre}"`,
          'Productos',
          { life: 4000 },
        );
        this.nuevaPlacaItem = '';
        this.agregandoItem = false;
        this.displayAgregarItemDialog = false;
        this.verItems(this.productoSeleccionadoParaItems);
        this.cargarDatos();
      },
      error: (err) => {
        this.agregandoItem = false;
        const backendMsg = err?.error?.message;
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: backendMsg || 'No se pudo agregar el item' });
      },
    });
  }

  abrirEditarItem(item: any) {
    this.itemEnEdicion = item;
    this.editPlacaSena = item.placa_sena || '';
    this.displayEditarItemDialog = true;
  }

  guardarEdicionItem() {
    if (!this.itemEnEdicion) return;
    this.guardandoItem = true;
    const data: { placa_sena: string | null } = {
      placa_sena: this.editPlacaSena.trim() || null,
    };
    this.productoService.actualizarItem(this.itemEnEdicion.id_item, data).subscribe({
      next: () => {
        this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Item actualizado correctamente' });
        this.guardandoItem = false;
        this.displayEditarItemDialog = false;
        this.verItems(this.productoSeleccionadoParaItems);
      },
      error: (err) => {
        this.guardandoItem = false;
        const backendMsg = err?.error?.message;
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: backendMsg || 'No se pudo actualizar el item' });
      },
    });
  }

  abrirAsignarItem(item: any) {
    if (!item.placa_sena) {
      this.confirmationService.confirm({
        message: 'Este ítem no tiene una placa SENA registrada. ¿El equipo físico tiene placa SENA? Si la tiene, regístrala primero para no perder la trazabilidad antes de asignarlo a una ficha.',
        header: '¿Tiene placa SENA?',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Sí, agregar placa',
        rejectLabel: 'No tiene, continuar',
        acceptButtonStyleClass: 'p-button-success',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => this.abrirEditarItem(item),
        reject: () => this.continuarAsignarItem(item),
      });
      return;
    }
    this.continuarAsignarItem(item);
  }

  private continuarAsignarItem(item: any) {
    this.itemParaAsignar = item;
    this.fichaSeleccionadaAsignar = null;
    this.bodegaSeleccionadaAsignacion = null;
    this.modoAsignacion = 'ficha';
    this.displayAsignarItemDialog = true;
    // fichasParaAsignar ya está cargado en ngOnInit; si está vacío, recargamos
    if (this.fichasParaAsignar.length === 0) this.cargarFichas();
    this.cdr.markForCheck();
  }

  confirmarAsignarItem() {
    if (!this.itemParaAsignar || !this.fichaSeleccionadaAsignar) return;
    const productoId: number = this.itemParaAsignar.id_producto;
    const fichaId: number = this.fichaSeleccionadaAsignar;
    this.asignandoItem = true;
    this.cdr.markForCheck();

    this.asignacionService.getAsignaciones().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data ?? res ?? [];
        const existente = all.find((a: any) => {
          const mismoProducto = a.id_producto === productoId || a.producto?.id_producto === productoId;
          const mismaFicha = a.id_ficha === fichaId || a.ficha?.id_ficha === fichaId;
          return mismoProducto && mismaFicha && a.estado?.toUpperCase() === 'ACTIVA';
        });

        const agregarItem = (idAsignacion: number) => {
          this.asignacionService.agregarItemAAsignacion(idAsignacion, this.itemParaAsignar.id_item).subscribe({
            next: () => {
              this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Ítem asignado a la ficha correctamente' });
              this.asignandoItem = false;
              this.displayAsignarItemDialog = false;
              this.verItems(this.productoSeleccionadoParaItems);
              this.cargarDatos();
            },
            error: (err: any) => {
              this.asignandoItem = false;
              this.cdr.markForCheck();
              this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo asignar el ítem' });
            },
          });
        };

        if (existente) {
          // Asignación activa existe → agregar el ítem específico a ella
          agregarItem(existente.id_asignacion);
        } else {
          // No existe asignación → crearla pasando el ítem específico para evitar descuento aleatorio
          const idUsuarioFinal = Number(this.authService.getUserId()) || 1;
          this.asignacionService.crearAsignacion({
            id_ficha: fichaId,
            id_producto: productoId,
            cantidad: 1,
            id_usuario_asigna: idUsuarioFinal,
            id_items: [this.itemParaAsignar.id_item],
          }).subscribe({
            next: () => {
              // El ítem ya quedó marcado como PRESTADO y vinculado por el backend
              this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Ítem asignado a la ficha correctamente' });
              this.asignandoItem = false;
              this.displayAsignarItemDialog = false;
              this.verItems(this.productoSeleccionadoParaItems);
              this.cargarDatos();
            },
            error: (err: any) => {
              this.asignandoItem = false;
              this.cdr.markForCheck();
              this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo crear la asignación' });
            },
          });
        }
      },
      error: () => {
        this.asignandoItem = false;
        this.cdr.markForCheck();
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudo verificar las asignaciones existentes' });
      },
    });
  }

  confirmarAsignarABodega() {
    if (!this.itemParaAsignar || !this.bodegaSeleccionadaAsignacion) return;
    this.asignandoABodega = true;
    this.cdr.markForCheck();
    this.productoService.actualizarItem(this.itemParaAsignar.id_item, { id_sitio: this.bodegaSeleccionadaAsignacion }).subscribe({
      next: () => {
        this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Ítem asignado a la bodega/ambiente correctamente' });
        this.asignandoABodega = false;
        this.displayAsignarItemDialog = false;
        this.verItems(this.productoSeleccionadoParaItems);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.asignandoABodega = false;
        this.cdr.markForCheck();
        const backendMsg = err?.error?.message;
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: backendMsg || 'No se pudo asignar el ítem a la bodega' });
      },
    });
  }

  abrirTrasladarItem(item: any) {
    this.itemParaTrasladar = item;
    this.sitioDestinoTraslado = null;
    this.justificacionTraslado = '';
    const idSitioActual = item.id_sitio ?? this.productoSeleccionadoParaItems?.id_sitio ?? null;
    const tipoActual = this.getBodegaTipoLabel(idSitioActual);
    this.ubicacionActualTraslado = idSitioActual
      ? `${this.getBodegaNombre(idSitioActual)}${tipoActual ? ' · ' + tipoActual : ''}`
      : '';
    this.destinosTrasladoOpciones = this.bodegas
      .filter(b => b.id_sitio !== idSitioActual)
      .map(b => {
        const tipo = this.getBodegaTipoLabel(b.id_sitio);
        return { label: `${b.nombre}${tipo ? ' · ' + tipo : ''}`, value: b.id_sitio };
      });
    this.displayTrasladarItemDialog = true;
  }

  confirmarTrasladarItem() {
    if (!this.itemParaTrasladar || !this.sitioDestinoTraslado) return;
    this.trasladandoItem = true;
    const userId = Number(this.authService.getUserId()) || 1;
    this.trasladoService.crearTraslado({
      id_item: this.itemParaTrasladar.id_item,
      id_sitio_destino: this.sitioDestinoTraslado,
      justificacion: this.justificacionTraslado?.trim() || undefined,
      id_usuario_solicita: userId,
    }).subscribe({
      next: () => {
        this.notification.add({ module: 'Productos', severity: 'success', summary: 'Solicitud enviada', detail: 'Traslado solicitado. El responsable del lugar actual debe aprobarlo.' });
        this.trasladandoItem = false;
        this.displayTrasladarItemDialog = false;
      },
      error: (err) => {
        this.trasladandoItem = false;
        const backendMsg = err?.error?.message;
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: backendMsg || 'No se pudo solicitar el traslado' });
      },
    });
  }

  abrirBuscarPlaca() {
    this.placaBuscada = '';
    this.resultadoBusquedaPlaca = null;
    this.errorBusquedaPlaca = null;
    this.displayBuscarPlacaDialog = true;
  }

  buscarPorPlaca() {
    const placa = this.placaBuscada.trim();
    if (!placa) return;
    this.buscandoPlaca = true;
    this.resultadoBusquedaPlaca = null;
    this.errorBusquedaPlaca = null;
    this.productoService.buscarItemPorPlaca(placa).subscribe({
      next: (res: any) => {
        this.resultadoBusquedaPlaca = res?.data || res;
        this.buscandoPlaca = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.buscandoPlaca = false;
        this.errorBusquedaPlaca = err?.error?.message || `No se encontró ningún ítem con la placa SENA: ${placa}`;
        this.cdr.markForCheck();
      },
    });
  }

  contarItemsEstado(estado: string): number {
    return this.itemsDelProducto.filter(i => i.estado === estado).length;
  }

  getNovedadTipoLabel(tipo: string): string {
    const found = this.tiposNovedadOpciones.find(t => t.value === tipo);
    return found ? found.label : tipo;
  }

  getItemSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'DISPONIBLE': return 'success';
      case 'PRESTADO': return 'warn';
      case 'DAÑADO': return 'danger';
      case 'PERDIDO': return 'secondary';
      default: return 'info';
    }
  }

  abrirDialogoNovedad(item: any) {
    this.itemParaNovedad = item;
    this.nuevaNovedad = { tipo: '', descripcion: '' };
    this.displayNovedadDialog = true;
  }

  guardarNovedad() {
    const userId = Number(this.authService.getUserId()) || 1;
    const payload = {
      tipo: this.nuevaNovedad.tipo,
      descripcion: this.nuevaNovedad.descripcion.trim(),
      id_item: this.itemParaNovedad.id_item,
      id_usuario: userId,
      estado: 'PENDIENTE',
    };
    this.novedadService.crearNovedad(payload).subscribe({
      next: () => {
        this.notification.add({ module: 'Productos', severity: 'success', summary: 'Novedad registrada', detail: `Novedad registrada para el item ${this.itemParaNovedad.codigo_sku}` });
        this.displayNovedadDialog = false;
      },
      error: () => {
        this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudo registrar la novedad' });
      },
    });
  }

  getTipoMaterialSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (tipo) {
      case 'CONSUMO': return 'info';
      case 'DEVOLUTIVO': return 'success';
      case 'PERECEDERO': return 'warn';
      default: return 'secondary';
    }
  }

  getUnspscLabel(codigo: string): string {
    const found = this.codigosUnspsc.find(c => c.value === codigo);
    return found ? found.label : codigo;
  }

  getUnspscName(codigo: string): string {
    const found = this.codigosUnspsc.find(c => c.value === codigo);
    if (!found) return '';
    const separatorIndex = found.label.indexOf(' - ');
    return separatorIndex >= 0 ? found.label.slice(separatorIndex + 3) : found.label;
  }

  getFechaClass(fecha: string): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vence = new Date(fecha + 'T00:00:00');
    const diasRestantes = Math.ceil((vence.getTime() - hoy.getTime()) / 86400000);
    if (diasRestantes < 0) return 'bg-red-100 text-red-700 border border-red-300';
    if (diasRestantes <= 7) return 'bg-orange-100 text-orange-700 border border-orange-300';
    if (diasRestantes <= 30) return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    return 'bg-green-100 text-green-700 border border-green-300';
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: '¿Eliminar los ' + this.selectedProducts.length + ' productos seleccionados?',
      header: 'Confirmar Eliminación Múltiple',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const ids = this.selectedProducts.map(p => p.id_producto);
        this.productoService.eliminarMultiples(ids).subscribe({
          next: () => {
            this.notification.add({ module: 'Productos', severity: 'success', summary: 'Éxito', detail: 'Productos eliminados' });
            this.selectedProducts = [];
            this.cargarDatos();
          },
          error: () => { this.notification.add({ module: 'Productos', severity: 'error', summary: 'Error', detail: 'No se pudieron eliminar' }); }
        });
      },
    });
  }
}
