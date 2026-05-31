export interface Sitio { 
  id_sitio?: number; 
  nombre: string; 
  tipo: string; 
  id_responsable?: number; 
  responsable?: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
  estado?: boolean; 
}