PLG es una empresa dedicada a la comercialización y distribución de Gas Licuado de Petróleo (GLP)
para sus clientes (plantas industriales, empresas comerciales, condominios, etc.) que están en la ciudad
XYZ. Durante las ventas, PLG pacta el plazo de entrega en horas, pero en ningún caso es menor de 4 horas
la entrega. PLG tiene un fuerte competidor en la misma ciudad, por lo que ha dispuesto la política de cero
incumplimientos con la única condición de que sus clientes realicen el pedido con un mínimo de 4 horas
antelación. Para efectos del curso, se considera que no habrá demoras en los plazos de entrega.
Esta nueva política ha provocado que PLG construya 2 tanques cisternas “intermedios” con una
capacidad “efectiva” de 160m3 en cada una, adicional a su planta principal. Los tanques intermedios se
abastecen una vez al día, a las 0:00 horas y la planta principal está abastecida todo el tiempo. Su flota actual
está constituida por camiones cisternas para distribución con distintas capacidades “efectivas” (que van
desde 5m3 hasta 25m3) y que requiere de mantenimiento preventivo que dura 24 horas cada 2 meses; así
como mantenimiento correctivo cuando sea necesario.

### **Requisitos Visuales y de Interfaz de Usuario para la Simulación**

#### I. Vista General y Layout 🖥️

- **Pantalla Principal:** El mapa de la simulación debe ser el componente central y ocupar el máximo espacio disponible en la pantalla para una visualización inmersiva.
- **Paneles:** La interfaz debe permitir ocultar o minimizar paneles secundarios para maximizar el área del mapa.
- **Carga Inicial:** El tiempo de espera para visualizar la simulación por primera vez debe ser mínimo.
- **Visualización del Tiempo:** Deben mostrarse de forma clara y constante:
  - La fecha y hora **actual de la simulación**.
  - El tiempo **transcurrido** dentro de la simulación (formato `dd:hh:mm:ss`).
  - (Opcional) La fecha y hora del mundo real.

---

#### II. Representación de Elementos en el Mapa 🗺️

- **Iconografía Clara:** Cada elemento en el mapa debe ser representado con un ícono claro, distinguible y con buen contraste respecto al fondo del mapa.
  - **Almacenes (Principal y Secundarios):** Iconos distintos para diferenciar el almacén principal de los secundarios.
  - **Unidades de Transporte (Vehículos):** Iconos que representen claramente un vehículo. La orientación del ícono debe ser coherente con la dirección de su movimiento (ej. apuntando al norte si se mueve al norte).
  - **Bloqueos:** Utilizar un color y un ícono distintivo (ej. una señal de stop o barrera) que comunique claramente una obstrucción.
- **Visualización de Estado por Colores (Semáforo):** El estado de los recursos debe ser inmediatamente visible a través de un sistema de colores intuitivo.
  - **Stock de Almacenes:** El nivel de inventario se debe representar con colores (ej. verde para alto, amarillo para medio, rojo para bajo).
  - **Stock de Vehículos:** El nivel de carga/combustible de cada vehículo también debe usar un sistema de colores similar.
- **Posicionamiento:** Todos los elementos (almacenes, vehículos, etc.) deben aparecer en las coordenadas geográficas correctas dentro del mapa.

---

#### III. Visualización de Rutas y Movimiento 🚗

- **Animación Fluida:** El desplazamiento de los vehículos por el mapa debe ser una animación suave y continua, sin saltos, parpadeos o movimientos erráticos.
- **Líneas de Ruta:**
  - Se debe poder visualizar la **ruta completa** que está recorriendo una unidad de transporte.
  - La línea de la ruta debe tener un grosor, color o estilo (ej. degradado) que la haga fácil de seguir.
  - Opcionalmente, se debe poder visualizar únicamente el **tramo actual** de la ruta, borrando el camino ya recorrido para reducir la saturación visual.

---

#### IV. Interacción y Visualización de Datos (Click & Hover) 🖱️

- **Información al Seleccionar (Click):** La selección de un elemento en el mapa o en el panel debe mostrar información detallada y contextual.
  - **Al hacer clic en un Almacén:** Se debe mostrar una lista de los pedidos programados y las unidades de transporte asignadas a él (idealmente, enlazando al panel de detalles).
  - **Al hacer clic en un Vehículo:** Se debe mostrar su ruta planificada, los pedidos que transporta y su estado actual (operativo, en mantenimiento, averiado).
  - **Al hacer clic en un Pedido:** Se deben ver las unidades de transporte que lo atienden y la ruta que seguirán.
- **Datos Numéricos Detallados:** Además de los colores, al hacer clic o pasar el mouse sobre un elemento, se debe poder ver su stock o nivel de carga en números y/o porcentaje.
- **Búsqueda y Filtro:** El panel debe permitir buscar elementos específicos (ej. un almacén, un pedido, un vehículo) y filtrar las listas (ej. bloqueos por hora).

---

#### V. Panel de Información y Control 📊

- **Sincronización Mapa-Panel:** Debe existir una conexión bidireccional:
  - Seleccionar un elemento en el **panel** debe resaltarlo o centrarlo en el **mapa**.
  - Seleccionar un elemento en el **mapa** debe mostrar sus detalles en el **panel**.
- **Visualización de Listas:** El panel debe presentar de forma clara y ordenada:
  - Lista de todos los pedidos.
  - Lista de todas las unidades de transporte con su stock/carga actual.
  - Lista de todos los bloqueos, preferiblemente organizados por hora.
- **Visualización de Estados de Avería:** Un vehículo averiado debe ser claramente visible tanto en el mapa (ej. con un color o ícono especial) como en el panel, indicando su tipo de avería.
- **Gestión de Interrupciones:** La interfaz debe mostrar claramente cómo se visualizan y gestionan las interrupciones, bloqueos y reprogramaciones, tanto en el mapa como en el planificador.
- **Reporte Final:** Al finalizar la simulación, se debe presentar un reporte final completo y legible.
