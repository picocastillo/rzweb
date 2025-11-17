# REGISTRO DE SEGUIMIENTO Y TESTING

ESTADOS
✅ OK: Prueba superada.

❌ FAIL: Prueba fallida (se encontró un bug).

⏳ PEND: Pendiente de probar.

⚠️ RE-TEST: Falló antes y necesita ser re-testeado tras la corrección.

--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

## [12/11/2025]
### Tareas Completadas

-[001] Se creo el menu sidebar para navegar por las distintas pantallas.
-[002] Se crearon los ABMs correspondientes a clientes, productos y ordenes.
-[003] Se escribió un seeder completo con usuarios, clientes, productos, ordenes y facturas para el testeo general.
-[004] Se posibilita el crear una factura parcialmente o completa dependiendo de si la orden esta en fecha limite.
-[005] Se agregaron los logos correspondientes a la app.

## [15/11/2025]
### Tareas Completadas

-[006] Se creo ABM para usuarios propios de RZ (Administrador, trabajador, etc).
-[007] Cambiamos el index de facturas por una tabla y cada factura con su show.
-[008] Agregamos nuevo rol Trabajador(worker) en los seeders para crearlo junto con admin.
-[009] Posibilitamos asignar un trabajador a una orden (Desde el show de la orden).
-[010] Agregamos estados al helper para su posterior gestion en los estadios de la orden.
-[011] Gestion de estados.
-[012] Gestion de Notas y Archivos en ordenes.
-[013] Posibilidad de crear una orden sin stock para luego ser gestionado por el trabajador.


--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

### Historia de Usuario (Pruebas)
**Como** [Administrador]
-[001] Navegar, asegurando que cada vista corresponda a un ABM o funcionalidad particular (Falta maquetear el menu principal o quitarlo). ✅ OK
-[002] Crear, editar y eliminar clientes desde el index. ✅ OK
      Crear, editar, eliminar, agregar stock y precio por dia a los productos desde el index. ✅ OK
      Crear, editar, eliminar y agregar movimientos a las ordenes desde el index (Falta poder editar fechas). ⏳ PEND 
-[003] Correr seeder, revisar numeros en productos, ordenes y facturas. ✅ OK
-[004] Agregar movimientos desde ordenes, quitando la mitad de la orden y otra completa por ejemplo, luego crear factura y revisar fechas y montos. ⏳ PEND
-[006] Crear, editar, eliminar usuarios propios de la app. ✅ OK
-[009] Asignar y reasignar trabajador en una orden ✅ OK
-[011] Los estados cambian correctamente ✅ OK
-[012] Agregar y actualizar notas / Agregar y eliminar archivos ✅ OK
-[013] Posibilidad de crear una orden sin stock. ✅ OK
