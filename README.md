# XSorter Tooltips

## Descripción del Proyecto

**XSorter Tooltips** es un conjunto de herramientas desarrolladas internamente en **DHL Supply Chain** para añadir ciertas funcionalidades al sistema **XSorter** creado por Vandelande. Estas mejoras están diseñadas para optimizar tareas productivas donde el sistema original podría no haber ofrecido mejoras significativas. El objetivo es mejorar ciertas funcionalidades que faciliten el día a día del equipo de manera interna.

Las herramientas han sido creadas completamente en **JavaScript** y su integración se realiza mediante **Tampermonkey**.

## Instalación de Tampermonkey

### Guía de Instalación en Distintos Navegadores

#### Google Chrome

1. Abre Google Chrome y navega a la [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
2. Busca "Tampermonkey".
3. Haz clic en "Añadir a Chrome".
4. Confirma la instalación haciendo clic en "Añadir extensión".

#### Mozilla Firefox

1. Abre Mozilla Firefox y navega a la [página de complementos de Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/).
2. Busca "Tampermonkey".
3. Haz clic en "Añadir a Firefox".
4. Confirma la instalación haciendo clic en "Añadir".

#### Microsoft Edge

1. Abre Microsoft Edge y navega a la [Microsoft Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
2. Busca "Tampermonkey".
3. Haz clic en "Obtener" y luego en "Añadir extensión".

#### Safari

1. Abre Safari y navega a la [Mac App Store](https://apps.apple.com/app/tampermonkey/id1482490089).
2. Busca "Tampermonkey".
3. Haz clic en "Obtener" y sigue las instrucciones para instalar la extensión.

### Instalación de los Scripts en Tampermonkey

#### `xsorter_required.js`

> **Nota:** Este archivo es obligatorio para que las herramientas funcionen correctamente.

1. Abre tu navegador y haz clic en el icono de Tampermonkey en la barra de herramientas.
2. Selecciona "Dashboard" o "Administrar panel de scripts".
3. Haz clic en el botón "+" para crear un nuevo script.
4. Copia y pega el contenido del archivo `xsorter_required.js` en el editor.
5. Guarda el script haciendo clic en "Archivo" y luego en "Guardar" o simplemente presionando `Ctrl + S` (o `Cmd + S` en Mac).

#### Otros Scripts (`xsorter_soportes.js` como ejemplo)

1. Abre tu navegador y haz clic en el icono de Tampermonkey en la barra de herramientas.
2. Selecciona "Dashboard" o "Administrar panel de scripts".
3. Haz clic en el botón "+" para crear un nuevo script.
4. Copia y pega el contenido del archivo del script deseado (por ejemplo, `xsorter_soportes.js`) en el editor.
5. Guarda el script haciendo clic en "Archivo" y luego en "Guardar" o simplemente presionando `Ctrl + S` (o `Cmd + S` en Mac).

### Establecer Prioridad de los Scripts

Para que `xsorter_required.js` funcione correctamente, debe tener la prioridad número 1 en Tampermonkey.

1. Abre Tampermonkey y ve al "Dashboard" o "Administrar panel de scripts".
2. Encuentra `xsorter_required.js` en la lista de scripts.
3. Haz clic y arrastra `xsorter_required.js` hacia la parte superior de la lista para asegurarte de que tenga la prioridad número 1.
4. Asegúrate de que otros scripts estén ubicados debajo de `xsorter_required.js` en la lista de scripts.

## Autor

Este proyecto ha sido creado por **Ahmed Bibi**.

## Licencia

El proyecto **XSorter Tooltips** está licenciado bajo la **GNU General Public License v3.0**. Esta licencia permite que cualquiera pueda usar, estudiar, compartir y modificar el software. Sin embargo, cualquier copia o modificación del software debe también estar disponible bajo la misma licencia. Esto asegura que el software y sus derivados permanezcan libres y abiertos para la comunidad.

Para más detalles sobre la licencia GNU GPL v3.0, puedes visitar [este enlace](https://www.gnu.org/licenses/gpl-3.0.html).

---

Esperamos que estas herramientas mejoren tu experiencia diaria y optimicen tus tareas productivas. Si tienes alguna pregunta o sugerencia, no dudes en ponerte en contacto.

¡Gracias por usar XSorter Tooltips!
