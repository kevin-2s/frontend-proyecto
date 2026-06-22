import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WhatsappChatService {
  private http = inject(HttpClient);

  sendMessage(message: string): Observable<string> {
    const url = environment.whatsappBotUrl;

    if (!url) {
      // Si no hay URL configurada en environment, usamos el mock inteligente local
      return this.getMockResponse(message);
    }

    // Petición real al servidor de Hostinger
    // Enviamos el mensaje del usuario y esperamos recibir un JSON con la respuesta.
    // Asumimos un formato común: { message: string } en el envío y { reply: string } o { response: string } en la respuesta.
    return this.http.post<any>(url, { message }).pipe(
      map(res => {
        // Mapeamos los formatos de respuesta comunes
        return res?.reply || res?.response || res?.message || 'Mensaje recibido, pero el formato de respuesta del servidor no es el esperado.';
      }),
      catchError(error => {
        console.error('Error al conectar con la automatización en Hostinger:', error);
        // Si falla la conexión con el servidor real, caemos al mock interactivo para no romper la experiencia de usuario
        return this.getMockResponse(message + ' [FALLBACK: Servidor Desconectado]');
      })
    );
  }

  private getMockResponse(message: string): Observable<string> {
    const lowerMessage = message.toLowerCase().trim();
    let reply = '';

    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos dias') || lowerMessage.includes('buenas tardes')) {
      reply = '¡Hola! Soy el asistente virtual del Sistema de Gestión de Materiales (SGM). ¿En qué puedo ayudarte hoy? \n\nPuedes preguntarme sobre:\n• Productos\n• Préstamos\n• Bodegas\n• Novedades';
    } else if (lowerMessage.includes('producto') || lowerMessage.includes('material') || lowerMessage.includes('insumo')) {
      reply = 'Para gestionar **Productos**, ve a la sección **Inventario > Productos** en el menú lateral. Allí podrás:\n1. Agregar nuevos artículos.\n2. Ver el stock disponible.\n3. Buscar productos por nombre o código UNSPSC.';
    } else if (lowerMessage.includes('prestamo') || lowerMessage.includes('prestar') || lowerMessage.includes('devolucion')) {
      reply = 'En el módulo de **Préstamos** (menú lateral) puedes registrar la salida temporal de materiales a instructores o aprendices. Recuerda que al retornar el material debes registrar la **devolución** para liberar el inventario.';
    } else if (lowerMessage.includes('bodega') || lowerMessage.includes('almacen')) {
      reply = 'La sección de **Bodegas** te permite ver los diferentes puntos de almacenamiento físico y qué productos e inventarios están asignados a cada uno de ellos.';
    } else if (lowerMessage.includes('novedad') || lowerMessage.includes('daño') || lowerMessage.includes('roto')) {
      reply = 'Si un material sufre algún daño o pérdida, debes registrar una **Novedad** en el menú **Inventario > Novedades** para reportar detalladamente lo ocurrido y justificar la baja de stock.';
    } else if (lowerMessage.includes('reporte') || lowerMessage.includes('excel') || lowerMessage.includes('pdf')) {
      reply = 'En el módulo de **Reportes** puedes generar reportes de inventario general o movimientos en formato **Excel** o visualizar las estadísticas clave del sistema.';
    } else if (lowerMessage.includes('qr') || lowerMessage.includes('escaner') || lowerMessage.includes('codigo')) {
      reply = 'El sistema cuenta con un **Escáner QR** en el menú **Utilidades**. Puedes usar la cámara de tu dispositivo para leer códigos y validar rápidamente la información de préstamos o productos.';
    } else {
      reply = 'Entendido. Recibí tu mensaje: "' + message + '". Como soy un bot en fase de desarrollo, si tienes dudas específicas sobre cómo realizar un proceso, te sugiero consultar las secciones de **Productos**, **Préstamos** o **Reportes** en el menú de navegación.';
    }

    // Añadimos un retardo de 1.5 segundos para simular que el bot está escribiendo de forma premium
    return of(reply).pipe(delay(1500));
  }
}
