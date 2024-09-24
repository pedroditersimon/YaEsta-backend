# Documento de acceso

### **¿Qué es?**

Contiene toda la información necesaria para ejecutar una acción que subscribe el usuario a un [canal](Canal.md).
Es el único medio que permite a los usuarios unirse a un canal privado.
El documento contiene el ID del canal al cual se unirá el usuario.

### **Configurar la acción del Documento de acceso**

Es necesario especificar el tipo de acción que realizará el documento, ya sea una suscripción o una creación.

- **Acción de suscripción:** Se debe especificar el ID del canal destino al cual los usuarios serán suscritos.
- **Acción de creación:** Se puede especificar una plantilla de titulo del canal que se creará.

Propiedades de esta funcionalidad:

- Acción (subscribirse o crear un nuevo canal)
- ID del [canal](Canal.md) destino (si la acción es suscribirse)
- Plantilla de titulo (si la acción es crear)

### Plantilla de titulo

La plantilla de titulo puede incluir una serie de variables clave, como el número de canales creados (índice) o incluso puede integrarse con la [API](API.md) para establecer un nombre personalizado.

Variables disponibles:

- **{index}** Enumeración actual de la cantidad de canales creados.
- **{minutes}** Minuto actual en hora UTC.
- **{hours}** Hora actual en UTC.
- **{day}** Día actual del mes.
- **{month}** Mes actual del año.
- **{year}** Año actual.

### **Reconfigurar un Documento de acceso**

Cada vez que se intente configurar un Documento de acceso, este será validado nuevamente.
Si se cambia el tipo de acción, el documento restablecerá las propiedades correspondientes a la funcionalidad anterior. Por ejemplo, si se cambia de Acción de Suscripción a Acción de Creación, la propiedad de "ID del canal destino" será eliminada.

### **¿Los Documentos de acceso existen dentro de los canales o pertenecen a estos?**

Los Documentos de acceso son independientes de los canales y existen en una colección aparte.
Esto significa que no es necesario crear un nuevo documento para dirigirse a un canal diferente; basta con reconfigurar el canal de destino del documento existente. Esta flexibilidad facilita la conservación del mismo código QR y los enlaces previamente distribuidos.
Se podría afirmar que los Documentos de acceso de suscripción están relacionados con un canal específico, ya que apuntan directamente a uno. Por otro lado, los Documento de acceso de creación no están asociados a ningún canal en particular.

### **Creación del D**ocumento de acceso

Cada canal viene equipado con un Documento de acceso por defecto, el cual permite la suscripción al canal.
Si el canal es privado, sólo los administradores tienen la capacidad de crear nuevos Documentos de acceso.
Si el canal es público, no se permite la creación de nuevos documentos, incluso por parte de los administradores.
Esto se hace para prevenir la saturación de creación de Documentos de acceso en canales públicos, que podrían tener miles de miembros, por ende, se utiliza el documento por defecto en común.
Si se hace una petición de Documento de acceso a un canal publico, se procederá a suscribir al usuario sin restricción alguna.

### **[idea] Aprobar peticiones del D**ocumento de acceso

Se podrá configurar el documento para que cada petición requiera la aprobación de un administrador.
Esto servirá para prevenir ataques maliciosos de solicitudes masivas o simplemente para tener más control sobre el proceso.
Cuando un usuario realiza una petición a un Documento de acceso que requiere aprobación, se genera una alerta en el panel del administrador y puede ser aprobada con un simple clic.
Si otro usuario intenta realizar una petición mientras ya hay una en espera de aprobación, la nueva petición se cancelará.
La aprobación en espera tiene un breve tiempo de vida, por ejemplo, 1/2 minutos.

Propiedades de esta funcionalidad:

- Requiere aprobación.
- Aprobación pendiente (incluye usuario y la fecha de la petición).

### **Habilitar y deshabilitar el D**ocumento de acceso

El Documento de acceso se puede marcar como habilitado o deshabilitado.
Cuando está deshabilitado, todas las peticiones de este se rechazarán automáticamente.

Propiedades de esta funcionalidad:

- Habilitado

### **Evitar ataques maliciosos de peticiones masivas, filtración del documento**

Se podrá deshabilitar en cualquier momento el Documento de acceso existente y crear uno totalmente nuevo sin conexión alguna con el anterior.
Utilizar la funcionalidad de aprobación.

### **Reiteradas peticiones a un D**ocumento de acceso **de suscripción**

Si un usuario hace una petición a el Documento de acceso de suscripción, se obtiene el canal destino y se verifica si el usuario ya es miembro:
→ Si ya es miembro del canal, únicamente se lo redirige.
→ De lo contrario, se procede a su suscripción.

### **Reiteradas peticiones a un D**ocumento de acceso **de creación**

Los usuarios únicamente pueden crear 1 canal por documento, así se evita que un usuario cree múltiples canales del mismo Documento de acceso.
Se registrará en una lista a los usuarios y los canales que han creado.
Si un usuario hace una petición a el Documento de acceso de creación, se verifica si esta en la lista y se obtiene el canal destino:
→ Si ya es miembro del canal destino, únicamente se lo redirige; sino, se lo subscribe nuevamente.
→ Si no esta en la lista, se crea un nuevo canal.
Esta lista es de uso exclusivo y únicamente accesible por el servidor

Propiedades de esta funcionalidad:

- Usuarios que han creado un nuevo canal

### **Modelo del D**ocumento de acceso

- ID
- ID del usuario creador del Documento de acceso
- Fecha de creación
- Habilitado
- Requiere aprobación
- Aprobación pendiente (incluye usuario y la fecha de petición)
- Acción (subscribirse o crear un nuevo canal)
- ID del [canal](Canal.md) destino (si la acción es suscribirse)
- Plantilla de titulo (si la acción es crear)
- Usuarios que han creado un nuevo canal (incluye un usuario y el nuevo canal)

Referencias:

[Canal](Canal.md) 

[QR y Link](QR_y_Link.md)