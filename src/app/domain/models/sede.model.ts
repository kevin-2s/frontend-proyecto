import { Centro } from './centro.model';

export interface Sede {
  id_sede?: number;
  nombre: string;
  direccion: string;
  id_centro: number;
  id_administrador?: number;
  centro?: Centro;
  estado?: boolean;
}
