export interface Movimiento { 
  id: number; 
  tipo: string; 
  cantidad: number; 
  fecha: Date; 
  observaciones: string; 
  productoId: number; 
  usuarioId: number; 
  sitioId: number; 
}
