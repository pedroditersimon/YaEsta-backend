# QR y Link

### **Funcionamiento del QR y Link**

Los códigos QR y Links se generan a partir de un [Documento de acceso](Documento_de_acceso.md), el cual será accionado para que el usuario pueda unirse a un canal.
Cuando se escanea el código, la aplicación lo decodifica y envía una solicitud al servidor.
El servidor se encarga del resto del proceso, lo que **debe** resultar en la suscripción del usuario que ha realizado la solicitud.
Están diseñados para obtenerse y ser presentados y/o distribuidos a los usuarios que desea unirlos a el canal.

### Obtener el código QR y Link

En canales privados solo los administradores pueden obtener el código QR y Link de cualquier Documento de acceso del canal.
En cambio, en canales públicos tanto administradores como **miembros**, pueden obtener el código QR o Link únicamente del Documento de acceso por **defecto** del canal.

Referencias:

[Documento de acceso](Documento_de_acceso.md)