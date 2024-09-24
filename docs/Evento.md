# Evento

### **¿Qué es?**

Es la planificación de una [notificación](Notificacion.md), programada para ser enviada en una fecha específica.

### ¿Cómo se activa el evento en la fecha establecida?

Se implementa un mecanismo para registrar solo los eventos pendientes que están próximos a vencer.
El servidor filtra los eventos próximos a notificar con una antelación menor a 30 minutos de la fecha y hora programadas.
Para cada evento recuperado, se establece un temporizador interno que se activará automáticamente cuando llegue la hora programada para el evento.
Cuando el temporizador se activa, desencadena una llamada a la función encargada de enviar la notificación correspondiente.

### **Estados del evento**

El sistema identifica las diferentes fases del evento para procesarlo.

- **Pendiente:** Estado inicial, pendiente a registrar el evento.
- **Registrado:** Se registró el temporizador del evento.
- **Completado:** Notificación enviada exitosamente, estado final del proceso.

En el caso de enviarse manualmente una notificación al instante, el sistema salteara este proceso y enviara la notificación directamente, marcándola como completada.

Propiedades de esta funcionalidad:

- Estado

### Fecha de recordatorio

Se puede configurar una notificación de recordatorio con antelación a la fecha del evento, para recordar a los participantes la próxima actividad.
Funciona con el mismo mecanismo con el que se activa el evento, pero utilizando un estado independiente.
Esta fecha debe ser anterior a la fecha del evento y expresada en formato de fecha absoluta (por ejemplo, 10/05/2024 18:30).
Se recomienda proporcionar una interfaz de usuario intuitiva que permita a los usuarios establecer la fecha en formato de tiempo relativo (por ejemplo, 5 días antes).

Propiedades de esta funcionalidad:

- Fecha de recordatorio
- Estado del recordatorio

### Información útil del evento

El evento tendrá propiedades para proporcionar información adicional como una descripción, ubicación del evento, etc.

### Modelo de Evento:

- ID
- ID del [canal](Canal.md) a notificar
- Fecha de creación
- Fecha del evento
- Estado
- Fecha de recordatorio
- Estado del recordatorio
- Titulo
- Descripción
- Ubicación en Mapas

Referencias:

[Notificación](Notificacion.md) 

[Canal](Canal.md)