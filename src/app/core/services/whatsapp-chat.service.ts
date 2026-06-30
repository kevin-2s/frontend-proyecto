import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WhatsappChatService {

  sendMessage(message: string): Observable<string> {
    // Retorna directamente las respuestas detalladas del mock de SARA/LogiMat
    return this.getMockResponse(message);
  }

  private getMockResponse(message: string): Observable<string> {
    const lowerMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    let reply = '';

    // Palabras clave aceptadas para temas de LogiMat
    const logimatKeywords = [
      'hola', 'buen', 'saludo', 'sara', 'ayuda', 'quien eres', 'logimat', 'sena',
      'centro', 'sede', 'area', 'área', 'programa', 'ficha',
      'usuario', 'rol', 'roles', 'permiso',
      'producto', 'material', 'insumo', 'categoria', 'categoría', 'bodega', 'almacen', 'solicitud', 'solicitar', 'asignar', 'asignacion', 'novedad', 'daño', 'dano', 'roto', 'perdido', 'baja',
      'dashboard', 'panel', 'grafic', 'estadistica',
      'trazabilidad', 'movimiento', 'kardex', 'historial'
    ];

    // Verificar si el mensaje intenta pedirle al bot que realice una acción de escritura/modificación/eliminación
    const isActionRequest = 
      lowerMessage.includes('por mi') || 
      lowerMessage.includes('por mí') || 
      lowerMessage.includes('puedes registrar') || 
      lowerMessage.includes('puedes crear') || 
      lowerMessage.includes('puedes modificar') || 
      lowerMessage.includes('puedes eliminar') || 
      lowerMessage.includes('puedes agregar') || 
      lowerMessage.includes('puedes editar') || 
      lowerMessage.includes('puedes borrar') || 
      lowerMessage.includes('registrame') ||
      lowerMessage.includes('creame') ||
      lowerMessage.includes('eliminame') ||
      lowerMessage.includes('hazlo') ||
      lowerMessage.includes('haz una') ||
      lowerMessage.startsWith('registra') ||
      lowerMessage.startsWith('crea') ||
      lowerMessage.startsWith('elimina') ||
      lowerMessage.startsWith('edita') ||
      lowerMessage.startsWith('borra') ||
      lowerMessage.startsWith('agrega');

    const hasKeyword = logimatKeywords.some(kw => lowerMessage.includes(kw));

    if (isActionRequest) {
      reply = 'No tengo la capacidad de realizar acciones dentro del sistema, pero puedo guiarte paso a paso para que tú mismo lo hagas. ¿Quieres que te explique cómo?';
    } 
    else if (!hasKeyword) {
      reply = 'Lo siento, pero mi único propósito es guiarte e informarte sobre el funcionamiento de **LogiMat**, el Sistema de Gestión de Materiales de Formación del SENA. No puedo responder preguntas ajenas a esta plataforma.';
    }
    else if (
      lowerMessage.includes('hola') || 
      lowerMessage.includes('buenos dias') || 
      lowerMessage.includes('buenas tardes') || 
      lowerMessage.includes('saludos') || 
      lowerMessage.includes('sara') || 
      lowerMessage.includes('ayuda') || 
      lowerMessage.includes('quien eres')
    ) {
      reply = '¡Hola! Soy el asistente virtual de **LogiMat**, el Sistema de Gestión de Materiales de Formación del SENA. Mi único propósito es guiarte e informarte sobre cómo usar el sistema.\n\nPuedes consultarme acerca de:\n• **Estructura**: Centros, Sedes, Áreas, Programas y Fichas.\n• **Administración**: Usuarios y Roles.\n• **Inventario**: Productos, Categorías, Bodegas, Solicitudes, Asignar y Novedades.\n• **Dashboard** (Panel de Control) y **Trazabilidad**.\n\n¿En qué puedo orientarte hoy?';
    } 
    else if (lowerMessage.includes('centro')) {
      reply = 'Para gestionar los Centros de Formación en **LogiMat**, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **ESTRUCTURA → Centros**.\n3. Allí podrás ver, registrar, editar o eliminar los centros de formación.';
    } 
    else if (lowerMessage.includes('sede')) {
      reply = 'Para gestionar las Sedes, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **ESTRUCTURA → Sedes**.\n3. Desde allí podrás administrar las sedes asociadas a cada centro de formación.';
    } 
    else if (lowerMessage.includes('area') || lowerMessage.includes('área')) {
      reply = 'Para gestionar las Áreas de formación, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **ESTRUCTURA → Áreas**.\n3. En este espacio podrás configurar las áreas asociadas a cada sede.';
    } 
    else if (lowerMessage.includes('programa')) {
      reply = 'Para gestionar los Programas de formación, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Selecciona la opción **ESTRUCTURA → Programas**.\n3. Aquí podrás registrar y administrar todos los programas del catálogo educativo.';
    } 
    else if (lowerMessage.includes('ficha')) {
      reply = 'Para gestionar las Fichas de formación asignadas, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **ESTRUCTURA → Fichas**.\n3. Allí podrás administrar las fichas vigentes asociadas a los programas correspondientes.';
    } 
    else if (lowerMessage.includes('usuario')) {
      reply = 'Para gestionar las cuentas de usuario y sus accesos, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Selecciona la sección **ADMINISTRACIÓN → Usuarios**.\n3. En esta sección podrás ver, crear, actualizar o dar de baja cuentas de usuario.';
    } 
    else if (lowerMessage.includes('rol') || lowerMessage.includes('roles') || lowerMessage.includes('permiso')) {
      reply = 'Para gestionar los Roles y Permisos de los usuarios en LogiMat, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Selecciona la sección **ADMINISTRACIÓN → Roles**.\n3. Allí podrás verificar las políticas y niveles de acceso asignados a cada tipo de rol.';
    } 
    else if (lowerMessage.includes('producto') || lowerMessage.includes('material') || lowerMessage.includes('insumo')) {
      reply = 'Para ver o gestionar los productos del catálogo de materiales, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Selecciona la sección **INVENTARIO → Productos**.\n3. Desde aquí podrás ingresar nuevos artículos, editar especificaciones o consultar su información general.';
    } 
    else if (lowerMessage.includes('categoria') || lowerMessage.includes('categoría')) {
      reply = 'Para gestionar la clasificación de los materiales, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **INVENTARIO → Categorías**.\n3. En este espacio podrás crear o modificar las categorías que agrupan los productos.';
    } 
    else if (lowerMessage.includes('bodega') || lowerMessage.includes('almacen')) {
      reply = 'Para gestionar las Bodegas o almacenes de materiales, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo.\n2. Haz clic en la sección **INVENTARIO → Bodegas**.\n3. Aquí podrás administrar los puntos físicos de almacenamiento de existencias.';
    } 
    else if (lowerMessage.includes('solicitud') || lowerMessage.includes('solicitar')) {
      reply = 'Para gestionar o registrar solicitudes de materiales, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo, sección **INVENTARIO → Solicitudes**.\n2. Haz clic en el botón de crear nueva solicitud.\n3. Completa los campos requeridos con la información de los materiales y envíala.';
    } 
    else if (lowerMessage.includes('asignar') || lowerMessage.includes('asignacion')) {
      reply = 'Para realizar la asignación de materiales a fichas de formación, sigue estos pasos:\n1. Dirígete a la sección **INVENTARIO → Asignar** en el menú lateral izquierdo.\n2. Selecciona la ficha de formación, añade los materiales e indica la cantidad a asignar.';
    } 
    else if (lowerMessage.includes('novedad') || lowerMessage.includes('daño') || lowerMessage.includes('dano') || lowerMessage.includes('roto') || lowerMessage.includes('perdido') || lowerMessage.includes('baja')) {
      reply = 'Para registrar o consultar novedades sobre materiales, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo, sección **INVENTARIO → Novedades**.\n2. En esta sección podrás registrar incidencias, pérdidas o averías para dar de baja o actualizar el estado de los ítems.';
    } 
    else if (lowerMessage.includes('dashboard') || lowerMessage.includes('panel') || lowerMessage.includes('grafic') || lowerMessage.includes('estadistica')) {
      reply = 'El **Panel de Control (Dashboard)** de LogiMat presenta un resumen en tiempo real que incluye:\n• **Indicadores clave**: Total de materiales en catálogo, movimientos de trazabilidad registrados, total de solicitudes registradas y asignaciones entregadas a fichas.\n• **Accesos rápidos**: Movimientos de Trazabilidad, Solicitudes Pendientes, Alertas de Stock Crítico y Asignaciones de Fichas.\n• **Gráficas**: Clasificación de materiales (Consumo vs Devolutivo) y consumo de materiales por ficha de formación.';
    } 
    else if (lowerMessage.includes('trazabilidad') || lowerMessage.includes('movimiento') || lowerMessage.includes('kardex') || lowerMessage.includes('historial')) {
      reply = 'Para ver la trazabilidad e historial físico de movimientos de un material, sigue estos pasos:\n1. Dirígete al menú lateral izquierdo y haz clic en **Trazabilidad**.\n2. Desde allí podrás visualizar el historial completo de entradas, salidas, asignaciones y devoluciones de cada material con su respectiva fecha.';
    } 
    else {
      reply = 'Entendido. Recibí tu mensaje: "' + message + '". Como tu asistente **LogiMat**, te recomiendo preguntarme utilizando palabras clave como **Estructura**, **Inventario**, **Administración**, **Dashboard** o **Trazabilidad** para brindarte información exacta del módulo que necesites.';
    }

    // Retardo premium de 1.5 segundos para simular que el bot está escribiendo
    return of(reply).pipe(delay(1500));
  }
}
