export interface Producto { 
  id_producto: number;
  nombre: string; 
  descripcion?: string; 
  codigo_unspsc?: string; 
  SKU: string; 
  tipo_material: string;
  unidad_medida: string;
  es_psd: boolean;
  fecha_vencimiento?: string;
  id_categoria?: number;
  stock_minimo: number;
  categoria?: {
    id_categoria: number;
    nombre: string;
  };
}
