# REGISTRO DE SEGUIMIENTO Y TESTING

### Tareas Completadas
## [12/11/2025]
  -[001] Se creo el menu sidebar para navegar por las distintas pantallas.
  -[002] Se crearon los ABMs correspondientes a clientes, productos y ordenes.
  -[003] Se escribió un seeder completo con usuarios, clientes, productos, ordenes y facturas para el testeo general.
  -[004] Se posibilita el crear una factura parcialmente o completa dependiendo de si la orden esta en fecha limite.
  -[005] Se agregaron los logos correspondientes a la app.

## [15/11/2025]
  -[006] Se creo ABM para usuarios propios de RZ (Administrador, trabajador, etc).
  -[007] Cambiamos el index de facturas por una tabla y cada factura con su show.
  -[008] Agregamos nuevo rol Trabajador(worker) en los seeders para crearlo junto con admin.
  -[009] Posibilitamos asignar un trabajador a una orden (Desde el show de la orden).
  -[010] Agregamos estados al helper para su posterior gestion en los estadios de la orden.
  -[011] Gestion de estados.
  -[012] Gestion de Notas y Archivos en ordenes.
  -[013] Posibilidad de crear una orden sin stock para luego ser gestionado por el trabajador.

## [18/11/2025]
  -[014] Posibilidad de iniciar y luego finalizar la orden como trabajador.
  -[015] Explicaciones y mejoras en ui para Trabajador.
--- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

### Historia de Usuario (Pruebas)
**Como** [Administrador]
//TESTEADO
- Navegar, asegurando que cada vista corresponda a un ABM o funcionalidad particular (Falta maquetear el menu principal o quitarlo).

- Crear, editar y eliminar clientes desde el index.
      Crear, editar, eliminar, agregar stock y precio por dia a los productos desde el index.
      Crear, editar, eliminar y agregar movimientos a las ordenes desde el index (Falta poder editar fechas).

- Correr seeder, revisar numeros en productos, ordenes y facturas.

- Crear, editar, eliminar usuarios propios de la app.

- Asignar y reasignar trabajador en una orden

- Los estados cambian correctamente

- Agregar y actualizar notas / Agregar y eliminar archivos
- Agregar y actualizar archivos / Agregar y eliminar archivos

- Posibilidad de crear una orden sin stock.
- Facturacion parcial, se agrega un movimiento de salida para luego facturar (Quitamos 5 productos de 10 de la orden)
- Facturacion completa, antes que termine la fecha de la orden.

//PENDIENTES
- Falta testear cuando se termina la fecha de la orden y se factura dias despues de finalizada (Por mas que los movimientos se agreguen despues)
- Falta testear cuando se factura mas de una orden de una sola vez


**Como** [Trabajador]
//PENDIENTES

//TESTEADO
- Agregamos un movimiento de salida (Quitamos de la orden los productos). 
  Seleccionamos la orden y facturamos. (Creada el 18/11 , facturada el 24/11) me dio 6 dias y el monto correctos
  Antes de facturar deben sacarse los productos con un movimiento de devolucion, salida de la orden
- Agregar y actualizar notas / Agregar y eliminar archivos
- Agregar y actualizar archivos / Agregar y eliminar archivos



