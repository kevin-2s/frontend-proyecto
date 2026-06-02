import { Area } from './area.model';

export interface Programa {
  id_programa?: number;
  nombre: string;
  codigo: string;
  id_area: number;
  area?: Area;
  estado?: boolean;
}
