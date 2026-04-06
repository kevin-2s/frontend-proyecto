export interface Solicitud { 
  id: number; 
  fechaSol: Date; 
  fechaRespuesta: Date; 
  estadoSol: string; 
  justificacion: string; 
  observacionRespuesta: string; 
  usuarioId: number; 
  usuarioRespondeId: number; 
}
