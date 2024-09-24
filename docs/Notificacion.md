# Notificación

### **¿Qué es?**

Una notificación es un mensaje dirigido que recibirán los usuarios pertenecientes a un [canal](Canal.md). Con el fin de comunicar información relevante sobre el estado de un pedido, turno, evento, entre otros.

### Envío de Notificaciones

Las notificaciones se pueden enviar manualmente desde el panel de administración o programar [eventos](Evento.md) que envíen notificaciones en fechas específicas, permitiendo una planificación anticipada.

### Tratamiento de Notificaciones

El sistema gestiona a las notificaciones como [Eventos](Evento.md) y utilizando el [Modelo de un evento](Evento.md) para almacenar su información.
Incluso al configurar notificaciones manualmente para que se envíen instantáneamente, se procesan como eventos con fecha y hora actuales. [Ver en Estados de un evento](Evento.md)
Si se quiere obtener las notificaciones enviadas de un canal, se debe buscar los eventos en estado “completado”.

Referencias:

[Canal](Canal.md) 

[Evento](Evento.md)