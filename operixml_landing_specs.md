# Especificaciones Técnicas - Landing OperixML (Post Login)

## Objetivo
Diseñar la página de inicio (landing post login) de OperixML para generar impacto inmediato y reforzar el valor inteligente del sistema. La landing debe comunicar que Operix "ya trabajó por vos" y entregar insights accionables desde el primer segundo.

## Estructura General

### 1. **Encabezado Fijo (Top Bar)**
- Logo de OperixML (esquina superior izquierda).
- Nombre de usuario / empresa activa (superior derecha).
- Íconos:
  - Notificaciones 🔔
  - Acceso rápido al Chat IA 💬
  - Menú de usuario / Configuración ⚙️

### 2. **Sección Principal: Panel de Impacto Operativo**

#### 2.1. **Alertas Prioritarias Detectadas (cards)**
- Mostrar hasta 3 cards destacadas con problemas detectados por IA:
  - Icono de alerta 🟠 / 🔴
  - Título del evento (ej: "Demoras en sucursal Avellaneda")
  - Breve explicación del impacto
  - Botón: "Ver detalle" o "Actuar"

#### 2.2. **Sugerencias Inteligentes de Acción (cards)**
- Hasta 2 recomendaciones accionables generadas por OperixAI:
  - Icono de sugerencia 💡
  - Título (ej: "Promoción sugerida para esmalte sintético")
  - Causa de la sugerencia (ej: "Sin rotación hace 3 semanas")
  - Botón: "Aceptar sugerencia" o "Ver propuesta"

#### 2.3. **KPIs Principales Personalizables (gráficas o contadores)**
- Ventas del día / semana / mes
- Stock crítico o próximos a ruptura
- Comparativas de sucursales (si hay más de una)
- Tendencia de rentabilidad (barras/flechas simples)

#### 2.4. **Insight Diario generado por IA (bloque lateral o footer)**
- Texto del tipo:
  > “Aprendizaje de hoy: Los lunes caen tus ventas de pintura en un 18%. ¿Querés programar un descuento automático?”
  - Botón: "Programar", "Ignorar", "Ver más"

### 3. **Acceso rápido al Chat IA (Operix.Chat)**
- Chat visible como **botón flotante en la esquina inferior derecha** (💬).
- Tooltip al pasar el mouse: "Consultá a Operix en lenguaje natural"
- Al hacer clic, se abre el chat en un panel lateral (tipo drawer), sin interrumpir la vista actual.
- El chat mantiene contexto y permite hacer preguntas sobre métricas, acciones o sugerencias.

## Estilo Visual y UX
- Estética limpia, profesional, con jerarquía visual clara.
- Usar colores suaves y consistentes (modo claro + modo oscuro).
- Emplear íconos amigables pero discretos (material design o similares).
- Cargar rápido, evitar animaciones innecesarias.
- Responsive (funciona bien en desktop, tablets y móviles).

## Consideraciones Técnicas
- Backend debe exponer API de eventos prioritarios y recomendaciones con metadata contextual.
- Cada card debe estar vinculada a un endpoint para acción inmediata (crear promoción, enviar alerta, etc).
- El chat debe integrarse con el motor LLM preexistente (Operix.Core) y responder en contexto del usuario autenticado.
- Debe contemplarse localización para versión en español neutro y portugués (a futuro).

## Notas Finales
Este panel debe convertirse en el "centro de control inteligente" del usuario. La clave es que al iniciar sesión:
1. El sistema ya haya detectado algo útil.
2. Proponga una acción directa.
3. Permita preguntar o profundizar vía chat sin fricción.

**Este diseño debe comunicar desde el primer segundo que OperixML no es un ERP común: es un asistente operativo inteligente y proactivo.**